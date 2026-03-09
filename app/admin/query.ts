import { prisma } from "@/lib/prisma"

export async function autoArchiveOldOrders() {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  await prisma.order.updateMany({
    where: {
      archivedAt: null,
      createdAt: {
        lte: threeDaysAgo,
      },
    },
    data: {
      archivedAt: new Date(),
    },
  });
}

// Ambil order yang belum diarsip (aktif)
export async function getAdminOrders() {
  await autoArchiveOldOrders();
  return await prisma.order.findMany({
    where: { archivedAt: null },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// Ambil order yang sudah diarsip
export async function getArchivedOrders() {
  return await prisma.order.findMany({
    where: { archivedAt: { not: null } },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { archivedAt: "desc" },
  })
}

export async function getAdminStats() {
  const total = await prisma.order.count({
    where: { archivedAt: null },
  })
  return { total }
}