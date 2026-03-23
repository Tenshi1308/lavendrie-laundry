"use server"

import { prisma } from "@/lib/prisma"
import { setSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase-admin"
import { loginRateLimiter } from "@/lib/rate-limit"
import { headers } from "next/headers"

async function getIP(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  return forwardedFor?.split(",")[0]?.trim() ?? realIP ?? "anonymous"
}

async function checkLoginRateLimit(ip: string) {
  const { success, limit, reset } = await loginRateLimiter.limit(`login:${ip}`)
  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000)
    return {
      error: `Terlalu banyak percobaan login. Maksimal ${limit} request per menit. Coba lagi dalam ${resetInSeconds} detik.`
    }
  }
  return null
}

// Fungsi shared untuk proses setelah idToken diverifikasi
async function handleFirebaseLogin(idToken: string) {
  let decodedToken
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken)
  } catch {
    return { error: "Token tidak valid, silakan coba lagi" }
  }

  const { email, name, picture } = decodedToken

  if (!email) {
    return { error: "Akun tidak memiliki email" }
  }

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        avatar: picture ?? null,
        password: "",
        role: "user",
      },
    })
  }

  await setSession(user.id)

  if (user.role === "admin") {
    redirect("/admin")
  }

  redirect("/")
}

export async function login(idToken: string) {
  const ip = await getIP()
  const rateLimitError = await checkLoginRateLimit(ip)
  if (rateLimitError) return rateLimitError

  return await handleFirebaseLogin(idToken)
}

export async function loginWithGoogle(idToken: string) {
  const ip = await getIP()
  const rateLimitError = await checkLoginRateLimit(ip)
  if (rateLimitError) return rateLimitError

  return await handleFirebaseLogin(idToken)
}