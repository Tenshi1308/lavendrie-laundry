"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { resetPassword } from "./server-action"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface ResetPasswordFormProps {
    email: string
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        const result = await resetPassword(email, password)

        if (result?.error) {
            setError(result.error)
            setIsSubmitting(false)
        } else if (result?.success) {
            toast.success("Password berhasil diubah. Silakan login dengan password baru.")
            router.push("/login")
        }
    }

    return (
        <Card className="shadow-md">
            <CardContent className="pt-2">
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
                                placeholder="Ketik ulang password"
                                required
                                disabled={isSubmitting}
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
                            onClick={() => router.back()}
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