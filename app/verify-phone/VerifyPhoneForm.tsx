"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { verifyPhone } from "./server-action"
import { ArrowLeft } from "lucide-react"

interface VerifyPhoneFormProps {
  email: string
}

export function VerifyPhoneForm({ email }: VerifyPhoneFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string

    const result = await verifyPhone(email, phone)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
    // Jika sukses, server action akan redirect, jadi tidak perlu handling di sini
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon Terdaftar</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Masukkan nomor telepon yang Anda daftarkan saat membuat akun.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => router.push("/forgot-password")}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}