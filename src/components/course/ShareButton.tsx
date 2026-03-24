"use client"

import { useState } from "react"
import { Share2, Check, Copy } from "lucide-react"

interface ShareButtonProps {
  courseCode: string
  courseName: string
  className?: string
}

export function ShareButton({ courseCode, courseName, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/${courseCode}`
    const text = `Únete al curso "${courseName}" con el código: ${courseCode}`

    if (navigator.share) {
      try {
        await navigator.share({ title: courseName, text, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      title="Compartir curso"
      className={`flex items-center justify-center rounded-xl transition-all active:scale-95 ${className}`}
    >
      {copied
        ? <Check className="h-4 w-4 text-green-500" />
        : <Share2 className="h-4 w-4" />
      }
    </button>
  )
}
