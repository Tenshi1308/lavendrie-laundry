"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Clock, User, List } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/add-task", label: "New Order", icon: Plus },
  { href: "/history", label: "List Order", icon: List },
  { href: "/profile", label: "Profile", icon: User },
]

export function NavItem({ href, label, icon: Icon }: typeof navItems[number], className?: string) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

export { navItems }
