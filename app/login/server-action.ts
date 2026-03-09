"use server"

import { prisma } from "@/lib/prisma"
import { verifyPassword, setSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function login(data: {
  email: string
  password: string
}) {
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
