"use server"

import { prisma } from "@/lib/prisma"
import { setSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { adminAuth } from "@/lib/firebase-admin"
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
  password: string  // masih diterima untuk validasi, tapi Firebase yang simpan
  idToken: string
}) {
  // Rate limiting
  const ip = await getIP()
  const { success, limit, reset } = await registerRateLimiter.limit(`register:${ip}`)
  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000)
    return {
      error: `Terlalu banyak percobaan register. Maksimal ${limit} request per menit. Coba lagi dalam ${resetInSeconds} detik.`
    }
  }

  const { name, email, phone, idToken } = data

  if (!email || !phone || !name) {
    return { error: "Semua field wajib diisi" }
  }

  // Validasi format nomor telepon
  const cleanPhone = phone.replace(/\D/g, "")
  if (!/^[0-9]{10,13}$/.test(cleanPhone)) {
    return { error: "Nomor telepon tidak valid (10-13 digit angka)" }
  }

  // Verifikasi idToken dari Firebase
  let decodedToken
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken)
  } catch {
    return { error: "Token tidak valid, silakan coba lagi" }
  }

  if (decodedToken.email !== email) {
    return { error: "Email tidak cocok" }
  }

  // Cek apakah email sudah terdaftar di database
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "Email sudah terdaftar" }
  }

  // Simpan user ke PostgreSQL (password kosong, Firebase yang manage)
  const user = await prisma.user.create({
    data: {
      email,
      password: "",
      name,
      phone: cleanPhone,
      role: "user",
    },
  })

  await setSession(user.id)
  redirect("/")
}