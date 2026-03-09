"use server"

import { prisma } from "@/lib/prisma"

export async function forgotPassword(email: string) {
  if (!email) {
    return { error: "Email wajib diisi" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // Untuk keamanan, jangan beri tahu bahwa email tidak ditemukan
    // Tapi kita beri pesan umum
    return { error: "Email tidak ditemukan" }
  }

  if (!user.phone) {
    return { error: "Akun Anda tidak memiliki nomor telepon terdaftar. Hubungi admin." }
  }

  // Jika ditemukan, kita lanjutkan ke halaman reset
  return { success: true, email }
}