import { prisma } from "@/lib/prisma"

export async function getOrdersByUser(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}