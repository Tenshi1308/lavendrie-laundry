"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from 'xlsx';

export async function exportArchiveToExcel() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== "admin") throw new Error("Forbidden");

  // Ambil semua order yang sudah diarsip
  const archivedOrders = await prisma.order.findMany({
    where: { archivedAt: { not: null } },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { archivedAt: "desc" },
  });

  // Format data untuk Excel
  const data = archivedOrders.map((order) => ({
    "Kode Order": order.orderCode,
    "Tanggal Order": new Date(order.orderDate).toLocaleDateString("id-ID"),
    "Customer": order.customerName,
    "Telepon": order.phone,
    "Alamat": order.address,
    "Layanan": order.serviceType,
    "Durasi": order.duration,
    "Jenis Pengerjaan": order.workType,
    "User": order.user?.name || order.user?.email || "-",
    "Tanggal Arsip": order.archivedAt ? new Date(order.archivedAt).toLocaleDateString("id-ID") : "-",
  }));

  // Buat workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Arsip");

  // Generate buffer dan konversi ke base64
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const base64 = buf.toString("base64");

  return { base64, filename: `archive-order-${new Date().toISOString().slice(0,10)}.xlsx` };
}

export async function deleteArchivedOrder(orderId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== "admin") throw new Error("Forbidden");

  // Opsional: pastikan order benar-benar diarsip (archivedAt tidak null)
  await prisma.order.delete({
    where: { id: orderId },
  });

  // Revalidate path jika perlu, tapi karena client state akan diupdate, tidak wajib
  // revalidatePath("/admin/archive");
  return { success: true };
}