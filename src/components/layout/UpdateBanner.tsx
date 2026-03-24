"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

export function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      // Si ya hay un SW esperando al montar (ej: recargó la página)
      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
          }
        })
      })
    })

    // Recargar automáticamente cuando el SW toma control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload()
    })
  }, [])

  const handleUpdate = () => {
    if (!waitingWorker) return
    waitingWorker.postMessage({ type: "SKIP_WAITING" })
    setWaitingWorker(null)
  }

  if (!waitingWorker) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-accent-primary px-4 py-3 text-white shadow-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="h-4 w-4 shrink-0" />
        Nueva versión disponible
      </div>
      <button
        onClick={handleUpdate}
        className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 active:scale-95 transition-all"
      >
        Actualizar
      </button>
    </div>
  )
}
