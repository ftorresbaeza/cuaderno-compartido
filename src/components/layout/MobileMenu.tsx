"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Moon, Sun, Calendar, Users, Trophy, Settings, Upload, BookOpen, LogOut } from "lucide-react"
import { signOut } from "@/auth"

interface MobileMenuProps {
  courseCode?: string
  courseName?: string
}

export function MobileMenu({ courseCode, courseName }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = courseCode ? [
    { href: `/${courseCode}`, label: "Inicio", icon: BookOpen },
    { href: `/${courseCode}/calendar`, label: "Calendario", icon: Calendar },
    { href: `/${courseCode}/ranking`, label: "Ranking", icon: Trophy },
    { href: `/${courseCode}/upload`, label: "Subir", icon: Upload },
    { href: `/${courseCode}/members`, label: "Miembros", icon: Users },
    { href: `/${courseCode}/settings`, label: "Ajustes", icon: Settings },
  ] : []

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl hover:bg-bg-secondary transition-colors"
      >
        <Menu className="h-5 w-5 text-text-secondary" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-bg-card border-l border-border shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between bg-bg-card">
              <span className="font-semibold text-text-primary">{courseName || "Menú"}</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-bg-secondary"
              >
                <X className="h-5 w-5 text-text-secondary" />
              </button>
            </div>
            
            <nav className="p-4 space-y-2 bg-bg-card">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isActive 
                        ? "bg-accent-primary text-white" 
                        : "text-text-primary hover:bg-bg-secondary"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <div className="pt-4 border-t border-border">
                <button
                  onClick={async () => {
                    await signOut()
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl text-danger hover:bg-red-50 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
