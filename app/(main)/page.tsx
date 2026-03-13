import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) {
    redirect("/login")
  }

  if(user.role === "admin"){
    redirect("/admin")
  }

  return (
    <div className="container mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lavendrie Laundry</h1>

      <Card>
        <CardHeader>
          <CardTitle>Selamat datang, {user.name || user.email}!</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-0 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Lavendrie Logo"
            className="h-35 w-200 object-contain"
          />
          <p className="text-muted-foreground mb-4 text-left w-full pt-16 text-sm">
            Kelola order kamu dengan mudah. Gunakan navigasi untuk membuat order baru
            dan melihat riwayat order yang sudah dibuat.
          </p>

          <div className="text-sm text-muted-foreground space-y-2 w-full text-left">
            <p><strong>Cara Menggunakan Aplikasi:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pilih menu <strong> New Order</strong> untuk mengisi data layanan laundry.</li>
              <li>Lengkapi info customer, detail order, dan alamat pengambilan.</li>
              <li>Simpan order, lalu buka menu <strong> List Order</strong> untuk melihat daftar order.</li>
              <li>Tekan tombol <strong>Bayar</strong> untuk melanjutkan pembayaran melalui WhatsApp.</li>
              <li>Pembayaran dilakukan secara manual dan harus lunas sebelum laundry diproses.</li>
              <li>Setelah selesai, dapat memesan ulang dengan menekan tombol <strong>Pesan Ulang</strong> pada halaman <strong> List Order</strong></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}