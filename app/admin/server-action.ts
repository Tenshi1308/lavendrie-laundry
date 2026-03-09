"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function archiveOrder(orderId: string) {
  const session = await getSession()
  if (!session) {
    return { error: "Unauthorized" }
  }

  // Cek apakah user adalah admin
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true }
  })

  if (user?.role !== "admin") {
    return { error: "Forbidden" }
  }

  // Cek order dan statusnya
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  })

  if (!order) {
    return { error: "Order tidak ditemukan" }
  }

  // Update archivedAt
  await prisma.order.update({
    where: { id: orderId },
    data: { archivedAt: new Date() }
  })

  revalidatePath("/admin")
  return { success: true }
}