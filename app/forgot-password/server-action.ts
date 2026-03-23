"use server"

import { prisma } from "@/lib/prisma"

export async function checkEmail(email: string) {
  if (!email) {
    return { error: "Email wajib diisi" }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: "Email tidak ditemukan" }
  }

  return { success: true }
}