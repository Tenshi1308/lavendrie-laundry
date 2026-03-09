import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, password: true, name: true, role: true, createdAt: true, updatedAt: true, avatar: true, phone: true }
  });
}

export async function updateUser(
  id: string,
  data: { name: string; avatar?: string; password?: string; phone?: string }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}