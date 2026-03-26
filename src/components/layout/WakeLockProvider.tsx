"use client"

import { useWakeLock } from "@/hooks/use-wake-lock"

export function WakeLockProvider({ children }: { children: React.ReactNode }) {
  useWakeLock()
  return <>{children}</>
}
