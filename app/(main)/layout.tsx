import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { AdminMobileNav } from "../admin/admin-mobile-nav"
import { AdminSidebar } from "../admin/admin-sidebar"
import { getCurrentUser } from "@/lib/auth-server"
import { redirect } from "next/dist/server/api-utils"

export const metadata = {
  title: "Dashboard",
  description: "Selamat datang di dashboard Anda",
}

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (user?.role === "admin") {
    return (
      <>
        <AdminSidebar />
        <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <AdminMobileNav />
      </>
    )
  } else {
    return (
      <>
        <AppSidebar />
        <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </>
    )
  }
}