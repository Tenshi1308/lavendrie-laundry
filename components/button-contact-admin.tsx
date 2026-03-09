"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react" // atau icon lain
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

const ADMIN_PHONE = "6282121152064" // nomor WhatsApp admin

interface ButtonContactAdminProps {
  order: {
    customerName: string
    phone: string
    orderCode: string
    serviceType: string
    address: string
    orderDate: Date
  }
}

export function ButtonContactAdmin({ order }: ButtonContactAdminProps) {
  const [open, setOpen] = useState(false)

  const handleRedirectWA = () => {
    const message = `Halo Lavendrie Laundry, saya ingin konfirmasi penjemputan untuk order dengan detail:
- Kode Order: ${order.orderCode}
- Nama: ${order.customerName}
- Nomor HP: ${order.phone}
- Layanan: ${order.serviceType}
- Alamat: ${order.address}
- Tanggal penjemputan: ${new Date(order.orderDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Mohon informasi jadwal penjemputan. Terima kasih.`
    const encodedMessage = encodeURIComponent(message)
    window.location.href = `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Contact Admin
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penjemputan</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Anda akan menghubungi admin untuk konfirmasi penjemputan dengan detail:</p>
                <div className="bg-muted rounded-md p-3 text-sm space-y-1">
                  <p className="text-muted-foreground">Nama: {order.customerName}</p>
                  <p className="text-muted-foreground">Telepon: {order.phone}</p>
                  <p className="text-muted-foreground">Kode Order: {order.orderCode}</p>
                  <p className="text-muted-foreground">Layanan: {order.serviceType}</p>
                  <p className="text-muted-foreground">Alamat: {order.address}</p>
                </div>
                <p className="text-sm">Anda akan diarahkan ke WhatsApp untuk berbicara dengan admin.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedirectWA}>
              Ya, Hubungi Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}