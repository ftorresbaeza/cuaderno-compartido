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
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (t: string) => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(t)
    if (t === "dark") {
      root.style.setProperty("--bg-primary", "#1a1a1a")
      root.style.setProperty("--bg-secondary", "#2d2d2d")
      root.style.setProperty("--bg-card", "#333333")
      root.style.setProperty("--text-primary", "#ffffff")
      root.style.setProperty("--text-secondary", "#b0b0b0")
      root.style.setProperty("--text-muted", "#888888")
      root.style.setProperty("--accent-primary", "#60a5fa")
      root.style.setProperty("--border", "#404040")
    } else {
      root.style.setProperty("--bg-primary", "#FDFBF7")
      root.style.setProperty("--bg-secondary", "#F5F1EA")
      root.style.setProperty("--bg-card", "#FFFFFF")
      root.style.setProperty("--text-primary", "#1F1B16")
      root.style.setProperty("--text-secondary", "#6B6459")
      root.style.setProperty("--text-muted", "#A39E94")
      root.style.setProperty("--accent-primary", "#3B82F6")
      root.style.setProperty("--border", "#E8E4DD")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
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