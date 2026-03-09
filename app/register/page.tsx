import { RegisterForm } from "./RegisterForm"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8 py-8">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">Buat Akun</h1>
        <RegisterForm />
      </div>
    </div>
  )
}