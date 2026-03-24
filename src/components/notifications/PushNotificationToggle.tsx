"use client"

import { useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useToast } from "@/hooks/use-toast"

interface PushNotificationToggleProps {
  courseId: string
}

export function PushNotificationToggle({ courseId }: PushNotificationToggleProps) {
  const { isSubscribed, isLoading, isSupported, error, subscribe, unsubscribe } =
    usePushNotifications(courseId)
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({ title: "Error de notificaciones", description: error, variant: "destructive" })
    }
  }, [error, toast])

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe()
      toast({ title: "Notificaciones desactivadas" })
    } else {
      await subscribe()
      if (!error) {
        toast({ title: "Notificaciones activadas", description: "Te avisaremos cuando haya novedades en el curso." })
      }
    }
  }

  if (!isSupported) return null

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="p-2 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
      title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
    >
      {isSubscribed ? (
        <Bell className="h-5 w-5 text-accent-primary" />
      ) : (
        <BellOff className="h-5 w-5 text-text-muted" />
      )}
    </button>
  )
}
