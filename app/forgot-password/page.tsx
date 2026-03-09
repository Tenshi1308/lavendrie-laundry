import { ForgotPasswordForm } from "./ForgotPasswordForm"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Lupa Password</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Masukkan email Anda untuk mereset password
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}