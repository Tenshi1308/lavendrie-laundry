import { ResetPasswordForm } from "./ResetPasswordForm"

interface PageProps {
  searchParams: { oobCode?: string }
}

export default function ResetPasswordPage({ searchParams }: PageProps) {
  const oobCode = searchParams.oobCode

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Masukkan password baru untuk akun Anda
          </p>
        </div>
        <ResetPasswordForm oobCode={oobCode ?? ""} />
      </div>
    </div>
  )
}