"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { register } from "./server-action"
import { Eye, EyeOff } from "lucide-react"
import {
  auth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "@/lib/firebase-client"

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    try {
      // 1. Buat akun di Firebase (client-side)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // 2. Set display name di Firebase
      await updateProfile(userCredential.user, { displayName: name })

      // 3. Ambil idToken
      const idToken = await userCredential.user.getIdToken()

      // 4. Kirim ke server action untuk simpan ke PostgreSQL
      const result = await register({ name, email, phone, password, idToken })

      if (result?.error) {
        // Jika gagal simpan ke DB, hapus akun Firebase yang baru dibuat
        // agar tidak ada akun Firebase tanpa data di DB
        await userCredential.user.delete()
        setError(result.error)
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar")
      } else if (code === "auth/weak-password") {
        setError("Password terlalu lemah, minimal 6 karakter")
      } else if (code === "auth/invalid-email") {
        setError("Format email tidak valid")
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap"
              required
              disabled={isSubmitting}
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
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

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Register"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>
          </p>

        </form>
      </CardContent>
    </Card>
  )
}