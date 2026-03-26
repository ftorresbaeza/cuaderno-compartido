"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Image, HandHelping, X, Send, Calendar, Check } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Subject {
  id: string
  name: string
  _count: { images: number }
}

interface SubjectListProps {
  subjects: Subject[]
  courseCode: string
  courseId?: string
}

function RequestSheet({
  subject,
  courseCode,
  courseId,
  onClose,
}: {
  subject: Subject
  courseCode: string
  courseId?: string
  onClose: () => void
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const params = new URLSearchParams({ date: selectedDate, subjectId: subject.id })
    const link = `${window.location.origin}/${courseCode}/upload?${params}`
    const dateFormatted = format(new Date(selectedDate + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })
    const text = `📚 Necesito fotos de *${subject.name}* del ${dateFormatted}. ¿Me ayudas?\n\n👉 Sube las fotos aquí:`

    if (navigator.share) {
      try { await navigator.share({ title: `Fotos de ${subject.name}`, text, url: link }) } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n${link}`)
    }

    if (courseId) {
      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, type: "REQUEST_IMAGES" }),
      }).catch(() => {})
    }

    setShared(true)
    setTimeout(() => { setShared(false); onClose() }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-white rounded-t-3xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Solicitar fotos de</p>
              <h2 className="text-xl font-display font-bold text-text-primary">{subject.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>

          {/* Fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary mb-2">
              <Calendar className="h-4 w-4" />
              ¿Qué fecha falta?
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors text-text-primary text-base"
            />
          </div>

          {/* Botón */}
          <button
            onClick={handleShare}
            disabled={!selectedDate}
            className={`w-full h-13 py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              shared
                ? "bg-green-500 text-white"
                : "bg-accent-primary text-white hover:bg-blue-600"
            }`}
          >
            {shared ? (
              <><Check className="h-5 w-5" /> ¡Enviado!</>
            ) : (
              <><Send className="h-5 w-5" /> Enviar solicitud</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SubjectList({ subjects, courseCode, courseId }: SubjectListProps) {
  const [requestingSubject, setRequestingSubject] = useState<Subject | null>(null)

  if (subjects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <p className="text-text-secondary font-medium">No hay asignaturas todavía</p>
          <p className="text-text-muted text-sm mt-1">Crea la primera asignatura para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="hover:border-accent-primary hover:shadow-md transition-all overflow-hidden">
            <CardContent className="flex items-center gap-0 p-0">
              {/* Zona clickeable → va a la asignatura */}
              <Link
                href={`/${courseCode}/subjects/${subject.id}`}
                className="flex items-center gap-4 p-4 flex-1 min-w-0 active:scale-[0.99] transition-transform"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-accent-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary truncate">{subject.name}</h3>
                  <p className="text-sm text-text-muted flex items-center gap-1">
                    <Image className="h-3.5 w-3.5" />
                    {subject._count.images} imágenes
                  </p>
                </div>
              </Link>

              {/* Botón solicitar fotos */}
              <button
                onClick={() => setRequestingSubject(subject)}
                className="flex flex-col items-center justify-center gap-1 px-4 py-4 h-full border-l border-border text-accent-primary hover:bg-blue-50 transition-colors active:scale-95 flex-shrink-0"
                title="Solicitar fotos"
              >
                <HandHelping className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-tight leading-none">Pedir</span>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sheet de solicitud */}
      {requestingSubject && (
        <RequestSheet
          subject={requestingSubject}
          courseCode={courseCode}
          courseId={courseId}
          onClose={() => setRequestingSubject(null)}
        />
      )}
    </>
  )
}
