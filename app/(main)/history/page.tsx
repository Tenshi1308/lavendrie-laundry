import { getOrders } from "../add-task/server-action"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { HistoryCard } from "./HistoryCard"

type Order = {
  id: string
  orderCode: string
  orderDate: Date
  serviceType: string
  duration: string
  workType: string
  customerName: string
  phone: string
  address: string
  createdAt: Date
}

export default async function HistoryPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const { orders = [], error } = await getOrders()

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">List Orders</h1>

      {error && <p className="text-destructive mb-4">{error}</p>}

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Belum ada order.</p>
          <a href="/add-task" className="text-primary underline mt-2 inline-block">
            Buat order pertama kamu
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {(orders as Order[]).map((order) => (
            <HistoryCard key={order.id} order={order} isAdmin={false} />
          ))}
        </div>
      )}
    </div>
  )
}
