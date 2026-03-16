"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { login, loginWithGoogle } from "./server-action"
import { Eye, EyeOff } from "lucide-react"
import { auth, googleProvider } from "@/lib/firebase-client"
import { signInWithPopup } from "firebase/auth"

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const result = await login(data)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    setError(null)

    try {
      // 1. Popup Google Sign-In via Firebase (client-side)
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      // 2. Kirim idToken ke server action
      const response = await loginWithGoogle(idToken)

      if (response?.error) {
        setError(response.error)
      }
    } catch (err: unknown) {
      // Jika user tutup popup, abaikan error
      if ((err as { code?: string })?.code === "auth/popup-closed-by-user") {
        return
      }
      setError("Gagal login dengan Google. Silakan coba lagi.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const isLoading = isSubmitting || isGoogleLoading

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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <a href="/forgot-password" className="text-sm text-primary hover:underline">
              Lupa password?
            </a>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isSubmitting ? "Memproses..." : "Login"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          {/* Tombol Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isGoogleLoading ? (
              "Memproses..."
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Login dengan Google
              </>
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <a href="/register" className="text-primary font-medium hover:underline">
              Register
            </a>
          </p>

        </form>
      </CardContent>
    </Card>
  )
}