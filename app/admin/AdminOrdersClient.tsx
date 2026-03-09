"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { archiveOrder } from "./server-action"
import { Button } from "@/components/ui/button"
import { Archive } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  user?: { name: string | null; email: string }
}

export default function AdminOrdersClient({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [openArchive, setOpenArchive] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  async function handleArchive() {
    if (!selectedOrderId) return
    setArchivingId(selectedOrderId)
    setOpenArchive(false)
    const result = await archiveOrder(selectedOrderId)
    if (result.success) {
      router.push("/admin/archive")
    } else {
      alert("Gagal mengarsip: " + (result.error || "Terjadi kesalahan"))
      setArchivingId(null)
    }
  }

  const filtered = orders.filter((o) => {
    return (
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderCode.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama customer atau kode order..."
          className="border rounded-md px-3 py-2 text-sm flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Tidak ada order ditemukan.</p>
      ) : (
        filtered.map((order) => (
          <div key={order.id} className="p-4 border rounded-lg shadow-sm bg-white space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-lg">{order.orderCode}</p>
                <p className="text-xs text-muted-foreground">
                  {order.user?.name ?? order.user?.email ?? "User tidak diketahui"}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Customer: <span className="font-medium text-foreground">{order.customerName}</span> - {order.phone}
            </p>
            <p className="text-sm text-muted-foreground">
              Layanan: {order.serviceType === "Jemput" ? order.serviceType : `${order.serviceType} - ${order.workType} (${order.duration})`}
            </p>
            <p className="text-sm text-muted-foreground">Alamat: {order.address}</p>
            <p className="text-sm text-muted-foreground">
              Tanggal: {new Date(order.orderDate).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>

            {/* Tombol Arsip untuk semua order */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedOrderId(order.id)
                  setOpenArchive(true)
                }}
                disabled={archivingId === order.id}
                className="w-full sm:w-auto"
              >
                <Archive className="h-4 w-4 mr-1" />
                {archivingId === order.id ? "Mengarsip..." : "Arsipkan"}
              </Button>
            </div>
          </div>
        ))
      )}

      <AlertDialog open={openArchive} onOpenChange={setOpenArchive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Arsip</AlertDialogTitle>
            <AlertDialogDescription>
              Arsipkan order ini? Order akan dipindahkan ke arsip.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Ya, Arsipkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}