"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function PushTestButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const { toast } = useToast()

  // Prueba local: directamente desde el SW, sin pasar por el servidor
  const handleLocalTest = async () => {
    setLocalLoading(true)
    try {
      if (!("serviceWorker" in navigator)) {
        toast({ title: "Sin soporte", description: "Service Worker no disponible en este navegador.", variant: "destructive" })
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({ title: "Permiso denegado", description: "Activa las notificaciones en configuración del sistema.", variant: "destructive" })
        return
      }
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification("Prueba local ✓", {
        body: "El SW puede mostrar notificaciones correctamente.",
        icon: "/icons/icon-192.png",
      })
      toast({ title: "Notificación local enviada", description: "Si no la ves, revisa los permisos del sistema." })
    } catch (e) {
      toast({ title: "Error local", description: String(e), variant: "destructive" })
    } finally {
      setLocalLoading(false)
    }
  }

  // Prueba vía servidor: envía push real desde el backend
  const handleServerTest = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: `Push enviado a ${data.count} dispositivo(s)`,
          description: "Deberías ver la notificación en segundos.",
        })
      } else {
        toast({
          title: "Error del servidor",
          description: data.error ?? "No se pudo enviar",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleLocalTest}
        disabled={localLoading}
        className="w-full rounded-xl"
      >
        {localLoading ? "Probando…" : "1. Probar notificación local (sin servidor)"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleServerTest}
        disabled={loading}
        className="w-full rounded-xl"
      >
        {loading ? "Enviando…" : "2. Probar push desde servidor"}
      </Button>
    </div>
  )
}
