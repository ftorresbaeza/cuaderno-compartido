"use client"

import { useState } from "react"
import { HandHelping, X, Send, Calendar, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RequestPhotosButtonProps {
  courseCode: string
  courseName: string
  subjects: { id: string; name: string }[]
}

export function RequestPhotosButton({ courseCode, courseName, subjects }: RequestPhotosButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || "")
  const [shared, setShared] = useState(false)

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId)

  const buildLink = () => {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({ date: selectedDate, subjectId: selectedSubjectId })
    return `${base}/${courseCode}/upload?${params.toString()}`
  }

  const handleShare = async () => {
    const link = buildLink()
    const dateFormatted = format(new Date(selectedDate + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })
    const text = `📚 Necesito fotos de la materia de *${selectedSubject?.name}* del ${dateFormatted} para "${courseName}". ¿Me puedes ayudar?\n\n👉 Sube las fotos aquí:`

    if (navigator.share) {
      try {
        await navigator.share({ title: `Fotos de ${selectedSubject?.name}`, text, url: link })
        setShared(true)
        setTimeout(() => { setShared(false); setOpen(false) }, 2000)
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${link}`)
      setShared(true)
      setTimeout(() => { setShared(false); setOpen(false) }, 2000)
    }
  }

  return (
    <>
      {/* Botón disparador */}
      <button
        onClick={() => setOpen(true)}
        title="Solicitar fotos"
        className="flex items-center justify-center rounded-xl p-2 transition-all active:scale-95 text-text-muted hover:text-accent-primary hover:bg-blue-50"
      >
        <HandHelping className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="relative w-full bg-white rounded-t-3xl p-6 space-y-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full" />

            {/* Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h2 className="text-lg font-display font-bold text-text-primary">Solicitar fotos</h2>
                <p className="text-sm text-text-muted">Se enviará un link directo para subir</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            {/* Asignatura */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-2">
                <BookOpen className="h-4 w-4" />
                Asignatura
              </label>
              <div className="grid grid-cols-2 gap-2">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                      selectedSubjectId === s.id
                        ? "border-accent-primary bg-blue-50 text-accent-primary"
                        : "border-border text-text-secondary hover:border-slate-300"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-2">
                <Calendar className="h-4 w-4" />
                Fecha que falta
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors text-text-primary"
              />
            </div>

            {/* Botón de envío */}
            <Button
              onClick={handleShare}
              disabled={!selectedSubjectId || !selectedDate}
              className={`w-full h-12 text-base gap-2 transition-all ${shared ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {shared ? (
                <>
                  <Check className="h-5 w-5" />
                  ¡Enlace enviado!
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar solicitud
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
