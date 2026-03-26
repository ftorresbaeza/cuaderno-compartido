"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface WakeLockHook {
  isSupported: boolean
  isActive: boolean
}

export function useWakeLock(): WakeLockHook {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen")
      setIsActive(true)

      wakeLockRef.current.addEventListener("release", () => {
        setIsActive(false)
      })
    } catch {
      setIsActive(false)
    }
  }, [])

  useEffect(() => {
    setIsSupported("wakeLock" in navigator)
    requestWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      wakeLockRef.current?.release()
    }
  }, [requestWakeLock])

  return { isSupported, isActive }
}
