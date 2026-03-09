import { AdminSidebar } from "./admin-sidebar"
import { AdminMobileNav } from "./admin-mobile-nav"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AdminSidebar />
            <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
                {children}
            </main>
            <AdminMobileNav />
        </>
    )
}