import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "./ResetPasswordForm"

interface PageProps {
  searchParams: { email?: string }
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const email = searchParams.email
  const cookieStore = cookies()
  const verifiedEmail = cookieStore.get("verified_email")?.value

  if (!email || verifiedEmail !== email) {
    // Jika tidak ada cookie atau tidak cocok, redirect ke forgot-password
    redirect("/forgot-password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Masukkan password baru untuk akun {email}
          </p>
        </div>
        <ResetPasswordForm email={email} />
      </div>
    </div>
  )
}