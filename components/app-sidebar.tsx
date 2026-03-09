"use client"

import { navItems, NavItem } from "./nav-items"
import Image from "next/image"

export function AppSidebar() {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:left-0 md:top-0 md:h-screen md:border-r bg-background p-4">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="h-12 w-12 flex items-center justify-center text-primary-foreground font-bold">
          <Image
            src="/laundry.png"
            alt="Lavendry Logo"
            width={120}
            height={120}
            className="rounded-2xl shadow-lg mb-4 object-contain"
          />
        </div>
        <h1 className="text-xl font-bold">Lavendrie Laundry</h1>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>
    </aside>
  )
}
