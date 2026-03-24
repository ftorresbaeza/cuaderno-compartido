"use client"

import { useState, useEffect } from "react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications(courseId: string) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)
      checkSubscription()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  async function checkSubscription() {
    try {
      // Forzar actualización del service worker para asegurar que tiene el listener push
      const reg = await navigator.serviceWorker.ready
      await reg.update()

      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const res = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}&courseId=${courseId}`)
        setIsSubscribed(res.ok && (await res.json()).subscribed)
      } else {
        setIsSubscribed(false)
      }
    } catch {
      setIsSubscribed(false)
    }
  }

  async function subscribe() {
    setIsLoading(true)
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission === "denied") {
        setError("Permiso de notificaciones denegado. Habilítalas en la configuración del navegador.")
        return
      }
      if (permission !== "granted") return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const subJson = sub.toJSON()
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys, courseId }),
      })

      if (!res.ok) {
        setError("No se pudo guardar la suscripción. Intenta de nuevo.")
        return
      }

      setIsSubscribed(true)
    } catch (e) {
      setError(`Error al suscribirse: ${e instanceof Error ? e.message : "desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    setIsLoading(true)
    setError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint, courseId }),
        })
        await sub.unsubscribe()
      }
      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, isSupported, error, subscribe, unsubscribe }
}
