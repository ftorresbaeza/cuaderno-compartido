"use server"

import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/blob"
import { revalidatePath } from "next/cache"

export interface UploadImageInput {
  files: File[]
  subjectId: string
  date: Date
  uploaderId?: string
}

export async function uploadImages(input: UploadImageInput) {
  const { files, subjectId, date, uploaderId } = input

  if (!files || files.length === 0) {
    return { error: "No se proporcionaron imágenes" }
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) {
    return { error: "Asignatura no encontrada" }
  }

  const uploadedImages: string[] = []
  const errors: string[] = []

  for (const file of files) {
    try {
      const { url } = await uploadImage(file)
      
      await prisma.imageNote.create({
        data: {
          url,
          subjectId,
          date,
          uploaderId: uploaderId || null,
        },
      })

      uploadedImages.push(url)
    } catch (error) {
      console.error("Error uploading image:", error)
      errors.push(`Error al subir ${file.name}`)
    }
  }

  revalidatePath(`/[courseCode]`, "layout")
  
  return {
    success: uploadedImages.length > 0,
    uploaded: uploadedImages.length,
    errors: errors.length > 0 ? errors : undefined,
  }
}

export async function getImagesByDate(courseId: string, date: Date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return prisma.imageNote.findMany({
    where: {
      subject: { courseId },
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      subject: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getImagesByMonth(courseId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const images = await prisma.imageNote.groupBy({
    by: ["date", "subjectId"],
    where: {
      subject: { courseId },
      date: { gte: startDate, lte: endDate },
    },
    _count: { id: true },
  })

  return images.map((img) => ({
    date: img.date,
    subjectId: img.subjectId,
    imageCount: img._count.id,
  }))
}

export async function deleteImage(imageId: string) {
  try {
    const image = await prisma.imageNote.delete({ where: { id: imageId } })
    revalidatePath("/")
    return { success: true, url: image.url }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { error: "Error al eliminar la imagen" }
  }
}

export async function deleteImageAdmin(imageId: string) {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  // Verificar que la imagen existe y obtener el courseId
  const image = await prisma.imageNote.findUnique({
    where: { id: imageId },
    include: { subject: true },
  })
  if (!image) return { error: "Imagen no encontrada" }

  // Permitir si es OWNER, ADMIN del curso, o super admin
  const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"
  const isSuperAdmin = session.user.email === SUPER_ADMIN_EMAIL

  if (!isSuperAdmin) {
    const membership = await prisma.courseMember.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: image.subject.courseId } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return { error: "No autorizado" }
    }
  }

  try {
    await prisma.imageNote.delete({ where: { id: imageId } })
    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { error: "Error al eliminar la imagen" }
  }
}

export async function deleteOwnImage(imageId: string) {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const image = await prisma.imageNote.findUnique({
    where: { id: imageId },
    select: { uploaderId: true, url: true },
  })
  if (!image) return { error: "Imagen no encontrada" }
  if (image.uploaderId !== session.user.id) return { error: "Solo puedes eliminar tus propias imágenes" }

  try {
    await prisma.imageNote.delete({ where: { id: imageId } })
    revalidatePath(`/[courseCode]`, "layout")
    return { success: true, url: image.url }
  } catch (error) {
    console.error("Error deleting image:", error)
    return { error: "Error al eliminar la imagen" }
  }
}

export async function cleanupOldImages() {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90)

  const oldImages = await prisma.imageNote.findMany({
    where: { createdAt: { lt: cutoffDate } },
    select: { id: true },
  })

  if (oldImages.length === 0) {
    return { deleted: 0 }
  }

  await prisma.imageNote.deleteMany({
    where: { id: { in: oldImages.map((img) => img.id) } },
  })

  return { deleted: oldImages.length }
}

export async function sendThanks(imageId: string) {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const image = await prisma.imageNote.findUnique({
    where: { id: imageId },
    include: {
      uploader: { select: { name: true } },
      subject: {
        include: {
          course: { select: { id: true, code: true } },
        },
      },
    },
  })

  if (!image) return { error: "Imagen no encontrada" }
  if (!image.uploaderId) return { error: "No se puede enviar gracias (autor desconocido)" }
  if (image.uploaderId === session.user.id) return { error: "No puedes enviarte gracias a ti mismo" }

  const senderName = session.user.name || "Alguien"
  const subjectName = image.subject.name
  const courseCode = image.subject.course.code

  const { sendPushToUser } = await import("@/lib/webpush")
  sendPushToUser(image.uploaderId, image.subject.courseId, {
    title: `${senderName} te agradece`,
    body: `Por tu foto de ${subjectName}`,
    url: `/${courseCode}/subjects/${image.subjectId}`,
  }).catch(() => {/* no bloquear si falla */})

  return { success: true }
}

export async function rotateImage(imageId: string) {
  const { auth } = await import("@/auth")
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const image = await prisma.imageNote.findUnique({
    where: { id: imageId },
  })
  if (!image) return { error: "Imagen no encontrada" }

  const newRotation = (image.rotation + 90) % 360

  await prisma.imageNote.update({
    where: { id: imageId },
    data: { rotation: newRotation },
  })

  revalidatePath(`/[courseCode]`, "layout")
  return { success: true, rotation: newRotation }
}
