"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } })
    revalidatePath("/history")
    return { success: true }
  } catch (error) {
    return { error: "Gagal menghapus order" }
  }
}