"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { forgotPassword } from "./server-action"
import { ArrowLeft } from "lucide-react"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    const result = await forgotPassword(email)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else if (result?.success) {
      router.push(`/verify-phone?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            {isSubmitting ? "Memproses..." : "Lanjutkan"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => router.push("/login")}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}