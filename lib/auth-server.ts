import { cookies } from "next/headers"
import { prisma } from "./prisma"
import { getSession } from "./auth"

const COOKIE_NAME = "auth_token"

export async function getCurrentUser() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return user
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
