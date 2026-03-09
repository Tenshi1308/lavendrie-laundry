"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function resetPassword(email: string, newPassword: string) {
  if (!email || !newPassword) {
    return { error: "Data tidak lengkap" }
  }

  if (newPassword.length < 6) {
    return { error: "Password minimal 6 karakter" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Email tidak ditemukan" }
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })

  return { success: true }
}