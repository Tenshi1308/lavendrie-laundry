"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
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

interface ButtonBayarProps {
  order: {
    customerName: string
    phone: string
    orderCode: string
    serviceType: string
    duration: string
    workType: string
    address: string
  }
}

export function ButtonBayar({ order }: ButtonBayarProps) {
  const [open, setOpen] = useState(false)

  const handleRedirectWA = () => {
    const message = `Halo Lavendrie Laundry, saya ingin melakukan pembayaran untuk order dengan detail:
- Kode Order: ${order.orderCode}
- Nama: ${order.customerName}
- Nomor HP: ${order.phone}
- Layanan: ${order.serviceType} 
- Durasi: ${order.duration}
- Pengerjaan: ${order.workType}
- Alamat: ${order.address}
Mohon info total pembayaran dan petunjuk pembayaran. Terima kasih.`
    const encodedMessage = encodeURIComponent(message)
    window.location.href = `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-black border-gray-300 hover:bg-gray-100"
      >
        <CreditCard className="h-3.5 w-3.5" />
        Bayar
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
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
                </div>
                <p className="text-sm">Order baru akan muncul di riwayat dan siap untuk dibayar.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedirectWA}>
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}