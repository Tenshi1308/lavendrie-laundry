"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function verifyPhone(email: string, phone: string) {
  if (!email || !phone) {
    return { error: "Data tidak lengkap" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Email tidak ditemukan" }
  }

  if (user.phone !== phone) {
    return { error: "Nomor telepon tidak cocok" }
  }

  // Set cookie untuk menandai bahwa email ini sudah diverifikasi (berlaku 15 menit)
  cookies().set("verified_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15, // 15 menit
    path: "/",
  })

  // Redirect ke halaman reset password
  redirect(`/reset-password?email=${encodeURIComponent(email)}`)
}