"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createOrder(data: {
  orderDate: string
  serviceType: string
  duration: string
  workType: string
  customerName: string
  phone: string
  address: string
}) {
  const session = await getSession()
  if (!session) return { error: "Unauthorized" }

  try {
    await prisma.order.create({
      data: {
        orderCode: "ORD-" + Date.now(),
        orderDate: new Date(data.orderDate),
        serviceType: data.serviceType,
        duration: data.duration,
        workType: data.workType,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        userId: session.userId,
      },
    })
    revalidatePath("/history")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Gagal menyimpan order" }
  }
}

export async function getOrders() {
  const session = await getSession()
  if (!session) return { error: "Unauthorized", orders: [] }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    })
    return { orders }
  } catch (error) {
    console.error(error)
    return { error: "Gagal mengambil data", orders: [] }
  }
}

export async function getAllOrders() {
  const session = await getSession()
  if (!session) return { error: "Unauthorized", orders: [] }

  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    })
    return { orders }
  } catch (error) {
    console.error(error)
    return { error: "Gagal mengambil data", orders: [] }
  }
}