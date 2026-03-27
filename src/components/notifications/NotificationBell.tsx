"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"

type Notification = {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export function NotificationBell({ courseCode }: { courseCode: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(`notifications-${courseCode}`)
    if (stored) {
      setNotifications(JSON.parse(stored))
    } else {
      const defaultNotifications: Notification[] = [
        {
          id: "1",
          title: "Bienvenido",
          message: "Bienvenido a Cuaderno Compartido",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]
      setNotifications(defaultNotifications)
      localStorage.setItem(`notifications-${courseCode}`, JSON.stringify(defaultNotifications))
    }
  }, [courseCode])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    setNotifications(updated)
    localStorage.setItem(`notifications-${courseCode}`, JSON.stringify(updated))
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.setItem(`notifications-${courseCode}`, JSON.stringify([]))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-xl hover:bg-bg-secondary transition-colors relative"
      >
        <Bell className="h-5 w-5 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-bg-card border-2 border-border rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-text-primary">Notificaciones</span>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-text-muted hover:text-text-secondary"
              >
                Limpiar todo
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-text-muted text-sm">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 cursor-pointer hover:bg-bg-secondary ${!n.read ? "bg-blue-50" : ""}`}
                >
                  <p className={`text-sm ${!n.read ? "font-semibold" : ""} text-text-primary`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-text-muted mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
