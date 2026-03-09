import { redirect } from "next/navigation"
import { VerifyPhoneForm } from "./VerifyPhoneForm"

interface PageProps {
  searchParams: { email?: string }
}

export default function VerifyPhonePage({ searchParams }: PageProps) {
  const email = searchParams.email
  if (!email) {
    redirect("/forgot-password")
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi Nomor Telepon</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Masukkan nomor telepon yang terdaftar untuk akun {email}
          </p>
        </div>
        <VerifyPhoneForm email={email} />
      </div>
    </div>
  )
}