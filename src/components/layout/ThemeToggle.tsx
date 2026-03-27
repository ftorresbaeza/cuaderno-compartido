"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") 
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = stored || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
  }

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-bg-secondary transition-colors"
      title={theme === "light" ? "Modo oscuro" : "Modo claro"}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary" />
      )}
    </button>
  )
}