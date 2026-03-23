"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Calendar, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "", label: "Inicio", icon: Home },
  { href: "/subjects", label: "Materias", icon: BookOpen },
  { href: "/calendar", label: "Calendario", icon: Calendar },
]

export function BottomNav() {
  const pathname = usePathname()
  const basePath = pathname.replace(/(\/subjects|\/calendar|\/upload).*$/, "")

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-card border-t-2 border-border safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {navItems.map((item) => {
          const href = `${basePath}${item.href}`
          const isActive = pathname === href || (item.href === "" && pathname === basePath)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors",
                isActive
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function FAB() {
  const pathname = usePathname()
  const basePath = pathname.replace(/(\/subjects|\/calendar|\/upload).*$/, "")

  return (
    <Link
      href={`${basePath}/upload`}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary text-white shadow-lg shadow-blue-300 transition-transform hover:scale-105 active:scale-95"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  )
}
