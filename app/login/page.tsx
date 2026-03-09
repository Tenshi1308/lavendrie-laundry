import Image from "next/image"
import { LoginForm } from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-8 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/laundry.png"
            alt="Lavendry Logo"
            width={120}
            height={120}
            className="rounded-2xl shadow-lg mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800">Lavendrie Laundry</h1>
          <p className="text-sm text-muted-foreground mt-1">Bersih, cepat, dan wangi.</p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}