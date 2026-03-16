"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword, setSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { registerRateLimiter } from "@/lib/rate-limit"
import { headers } from "next/headers"

async function getIP(): Promise<string> {
  const headersList = await headers()
  const forwardedFor = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  return forwardedFor?.split(",")[0]?.trim() ?? realIP ?? "anonymous"
}

export async function register(data: {
  name: string
  email: string
  phone: string
  password: string
}) {
  // Rate limiting (1 request per menit)
  const ip = await getIP()
  const { success, limit, reset } = await registerRateLimiter.limit(`register:${ip}`)

  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000)
    return {
      error: `Terlalu banyak percobaan register. Maksimal ${limit} request per menit. Coba lagi dalam ${resetInSeconds} detik.`
    }
  }

  const { name, email, phone, password } = data

  if (!email || !password || !phone) {
    return { error: "Semua field wajib diisi" }
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" }
  }

  const cleanPhone = phone.replace(/\D/g, '')
  if (!/^[0-9]{10,13}$/.test(cleanPhone)) {
    return { error: "Nomor telepon tidak valid (10-13 digit angka)" }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email sudah terdaftar" }
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      phone: cleanPhone,
    },
  })

  await setSession(user.id)

  if (user.role === "admin") {
    redirect("/admin")
  }

  redirect("/")
}