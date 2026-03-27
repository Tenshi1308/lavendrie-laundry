"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { checkEmail } from "./server-action"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { auth, sendPasswordResetEmail } from "@/lib/firebase-client"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    // 1. Cek apakah email terdaftar di database
    const result = await checkEmail(email)
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    try {
      // 2. Firebase kirim email reset link
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
    } catch {
      setError("Gagal mengirim email. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <h2 className="font-semibold text-gray-800">Email Terkirim!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Kembali ke Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <p className="text-sm text-muted-foreground">
              Masukkan email yang terdaftar untuk menerima link reset password
            </p>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Kirim Link Reset"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}