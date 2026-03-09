import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getArchivedOrders } from "../query";
import ArchivedOrdersClient from "./ArchivedOrdersClient";

export default async function ArchivePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (user?.role !== "admin") redirect("/");

  const archivedOrders = await getArchivedOrders();
  return (
    <div className="container mx-auto px-8 py-8">
      <ArchivedOrdersClient orders={archivedOrders as any[]} />
    </div>
  );
}