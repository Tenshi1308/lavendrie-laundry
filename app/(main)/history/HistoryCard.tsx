"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Trash2, Calendar, RefreshCw } from "lucide-react"
import { deleteOrder } from "./server-action"
import { createOrder } from "../add-task/server-action"
import { ButtonBayar } from "@/components/button-bayar"
import { ButtonContactAdmin } from "@/components/button-contact-admin"

const ADMIN_PHONE = "6281945403211"

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

interface HistoryCardProps {
  order: Order
  isAdmin: boolean
}

export function HistoryCard({ order, isAdmin }: HistoryCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReorderDialog, setShowReorderDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [reorderError, setReorderError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteOrder(order.id)
    if (result.success) {
      setShowDeleteDialog(false)
      router.refresh()
    }
    setIsDeleting(false)
  }

  async function handleReorder() {
    setIsReordering(true)
    setReorderError(null)

    const today = new Date().toISOString().split("T")[0]

    const result = await createOrder({
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      serviceType: order.serviceType,
      duration: order.duration,
      workType: order.workType,
      orderDate: today,
    })

    if (result?.error) {
      setReorderError(result.error)
      setIsReordering(false)
      return
    }

    setShowReorderDialog(false)
    router.refresh()
    setIsReordering(false)
  }

  return (
    <>
      <Card className={isDeleting ? "opacity-50" : ""}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">{order.orderCode}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Customer: <span className="font-medium text-foreground">{order.customerName}</span> - {order.phone}
          </p>
          <p className="text-sm text-muted-foreground">
            Layanan: {order.serviceType === "Jemput" ? order.serviceType : `${order.serviceType} - ${order.workType} (${order.duration})`}
          </p>
          <p className="text-sm text-muted-foreground">
            Alamat: {order.address}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(order.orderDate).toLocaleDateString("id-ID", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {order.serviceType === "Jemput" ? (
              <ButtonContactAdmin order={order} />
            ) : (
              <ButtonBayar order={order} />
            )}

            {/* Tombol pesan ulang untuk user */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReorderDialog(true)}
              className="flex items-center gap-1 text-green-700 border-green-300 hover:bg-green-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Pesan Ulang
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="ml-auto px-6 h-8 w-8 text-red-500 hover:text-white hover:bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog konfirmasi pesan ulang */}
      <AlertDialog open={showReorderDialog} onOpenChange={setShowReorderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pesan Ulang?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Order baru akan dibuat dengan detail yang sama:</p>
                <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                  <p className="text-muted-foreground">Nama: {order.customerName}</p>
                  <p className="text-muted-foreground">Telepon: {order.phone}</p>
                  <p className="text-muted-foreground">Jenis Layanan: {order.serviceType}</p>
                  <p className="text-muted-foreground">Jenis Pengerjaan: {order.workType}</p>
                  <p className="text-muted-foreground">Durasi: {order.duration}</p>
                  <p className="text-muted-foreground">Alamat: {order.address}</p>
                  <p className="text-muted-foreground">Tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <p className="text-sm">Order baru akan muncul di riwayat dan siap untuk dibayar.</p>
                {reorderError && (
                  <p className="text-sm text-destructive">{reorderError}</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReordering}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReorder} disabled={isReordering}>
              {isReordering ? "Memproses..." : "Ya, Pesan Ulang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order <strong>{order.orderCode}</strong> akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}