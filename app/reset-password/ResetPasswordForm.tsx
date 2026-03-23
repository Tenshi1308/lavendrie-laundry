"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import {
  auth,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "@/lib/firebase-client"

interface ResetPasswordFormProps {
  oobCode: string
}

export function ResetPasswordForm({ oobCode }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValidCode, setIsValidCode] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Verifikasi oobCode saat halaman dibuka
  useEffect(() => {
    async function verifyCode() {
      if (!oobCode) {
        setError("Link reset password tidak valid atau sudah kadaluarsa.")
        setIsVerifying(false)
        return
      }

      try {
        // Firebase verifikasi kode dan kembalikan email user
        const userEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(userEmail)
        setIsValidCode(true)
      } catch {
        setError("Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.")
        setIsValidCode(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [oobCode])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama")
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsSubmitting(false)
      return
    }

    try {
      // Firebase update password menggunakan oobCode
      await confirmPasswordReset(auth, oobCode, password)
      toast.success("Password berhasil diubah. Silakan login dengan password baru.")
      router.push("/login")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "auth/expired-action-code") {
        setError("Link sudah kadaluarsa. Silakan minta link reset password baru.")
      } else if (code === "auth/weak-password") {
        setError("Password terlalu lemah, minimal 6 karakter.")
      } else {
        setError("Gagal mengubah password. Silakan coba lagi.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading saat verifikasi kode
  if (isVerifying) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground py-4">
            Memverifikasi link...
          </p>
        </CardContent>
      </Card>
    )
  }

  // Tampilan jika kode tidak valid
  if (!isValidCode) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              Minta Link Baru
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-4">
          Reset password untuk: <span className="font-medium text-gray-700">{email}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                required
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ketik ulang password baru"
                required
                disabled={isSubmitting}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/forgot-password")}
              disabled={isSubmitting}
              className="px-6"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Ubah Password"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  )
}