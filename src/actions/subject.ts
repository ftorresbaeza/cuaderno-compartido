"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function createSubject(courseId: string, name: string) {
  if (!name || name.trim().length === 0) {
    return { error: "El nombre de la asignatura es requerido" }
  }

  try {
    const [subject, session] = await Promise.all([
      prisma.subject.create({ data: { name: name.trim(), courseId } }),
      auth(),
    ])

    if (session?.user?.id) {
      await prisma.userActivity.create({
        data: { userId: session.user.id, courseId, type: "CREATE_SUBJECT" },
      })
    }

    revalidatePath(`/[courseCode]`, "layout")
    return { success: true, subject }
  } catch (error) {
    console.error("Error creating subject:", error)
    return { error: "Error al crear la asignatura" }
  }
}

export async function getSubjects(courseId: string) {
  return prisma.subject.findMany({
    where: { courseId },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { images: true } },
    },
  })
}

export async function getSubjectWithImages(subjectId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize

  const [subject, images, totalImages] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      include: { course: { include: { members: { select: { userId: true, role: true } } } } },
    }),
    prisma.imageNote.findMany({
      where: { subjectId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
    }),
    prisma.imageNote.count({ where: { subjectId } }),
  ])

  return {
    subject,
    images,
    totalImages,
    totalPages: Math.ceil(totalImages / pageSize),
    currentPage: page,
  }
}

export async function deleteSubject(subjectId: string) {
  try {
    await prisma.subject.delete({ where: { id: subjectId } })
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting subject:", error)
    return { error: "Error al eliminar la asignatura" }
  }
}
