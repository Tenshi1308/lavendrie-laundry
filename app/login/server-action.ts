"use server"

import { prisma } from "@/lib/prisma"
import { verifyPassword, setSession } from "@/lib/auth"
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

export async function login(data: {
  email: string
  password: string
}) {
  const ip = await getIP()
  const rateLimitError = await checkLoginRateLimit(ip)
  if (rateLimitError) return rateLimitError

  const { email, password } = data

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Email atau password salah" }
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return { error: "Email atau password salah" }
  }

  await setSession(user.id)

  if (user.role === "admin") {
    redirect("/admin")
  }

  redirect("/")
}

export async function loginWithGoogle(idToken: string) {
  const ip = await getIP()
  const rateLimitError = await checkLoginRateLimit(ip)
  if (rateLimitError) return rateLimitError

  let decodedToken
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken)
  } catch {
    return { error: "Token Google tidak valid" }
  }

  const { email, name, picture } = decodedToken

  if (!email) {
    return { error: "Akun Google tidak memiliki email" }
  }

  let user = await prisma.user.findUnique({
    where: { email },
  })

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