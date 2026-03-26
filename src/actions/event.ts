"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendPushToCourse } from "@/lib/webpush"
import { auth } from "@/auth"

export type EventType = "TASK" | "TEST" | "ACTIVITY"

export interface CreateEventInput {
  title: string
  description?: string
  type: EventType
  date: Date
  courseId: string
  subjectId?: string
}

export async function createEvent(input: CreateEventInput) {
  if (!input.title || input.title.trim().length === 0) {
    return { error: "El título es requerido" }
  }

  if (!input.date) {
    return { error: "La fecha es requerida" }
  }

  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  try {
    const event = await prisma.event.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        type: input.type,
        date: input.date,
        courseId: input.courseId,
        subjectId: input.subjectId || null,
        createdBy: session.user.id,
      },
      include: { subject: true, course: true },
    })

    const eventTypeLabel: Record<string, string> = {
      TASK: "Tarea",
      TEST: "Prueba",
      ACTIVITY: "Actividad",
    }

    const dateLabel = new Date(event.date).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })
    sendPushToCourse(input.courseId, {
      title: `${event.course?.name ?? ""} · ${eventTypeLabel[input.type] ?? "Evento"}`,
      body: `${event.title}${event.subject ? ` — ${event.subject.name}` : ""} · ${dateLabel}`,
      url: `/${event.course?.code ?? input.courseId}/calendar`,
    }).catch(() => {/* no bloquear si falla el push */})

    await prisma.userActivity.create({
      data: { userId: session.user.id, courseId: input.courseId, type: "CREATE_EVENT" },
    })

    revalidatePath("/")
    return { success: true, event }
  } catch (error) {
    console.error("Error creating event:", error)
    return { error: "Error al crear el evento" }
  }
}

export async function updateEvent(eventId: string, input: Partial<CreateEventInput>) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  })
  if (!existing) return { error: "Evento no encontrado" }
  if (existing.createdBy !== session.user.id) return { error: "Solo puedes editar eventos que tú creaste" }

  try {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(input.title && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description?.trim() || null }),
        ...(input.type && { type: input.type }),
        ...(input.date && { date: input.date }),
        ...(input.subjectId !== undefined && { subjectId: input.subjectId || null }),
      },
    })

    revalidatePath("/")
    return { success: true, event }
  } catch (error) {
    console.error("Error updating event:", error)
    return { error: "Error al actualizar el evento" }
  }
}

export async function getEventsByDate(courseId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return prisma.event.findMany({
    where: {
      courseId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: { subject: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function getEventsByMonth(courseId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  return prisma.event.findMany({
    where: {
      courseId,
      date: { gte: startDate, lte: endDate },
    },
    include: { subject: true },
    orderBy: { date: "asc" },
  })
}

export async function deleteEvent(eventId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  })
  if (!existing) return { error: "Evento no encontrado" }
  if (existing.createdBy !== session.user.id) return { error: "Solo puedes eliminar eventos que tú creaste" }

  try {
    await prisma.event.delete({ where: { id: eventId } })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { error: "Error al eliminar el evento" }
  }
}

export async function getUpcomingEvents(courseId: string, limit = 5) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.event.findMany({
    where: {
      courseId,
      date: { gte: today },
    },
    include: { subject: true },
    orderBy: { date: "asc" },
    take: limit,
  })
}
