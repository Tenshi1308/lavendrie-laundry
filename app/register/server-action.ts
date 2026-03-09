"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword, setSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function register(data: {
  name: string
  email: string
  phone: string
  password: string
}) {
  const { name, email, phone, password } = data

  if (!email || !password || !phone) {
    return { error: "Semua field wajib diisi" }
  }

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter" }
  }

  // Validasi format nomor telepon (hanya angka, 10-13 digit)
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