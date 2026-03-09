import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdminOrders, getAdminStats } from "./query";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== "admin") redirect("/");

  const [orders, stats] = await Promise.all([
    getAdminOrders(),
    getAdminStats(),
  ]);

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold mb-6">Daftar Order Aktif</h1>
      <AdminOrdersClient orders={orders as any[]} />
    </div>
  );
}