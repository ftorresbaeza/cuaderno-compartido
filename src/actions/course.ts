"use server"

import { prisma } from "@/lib/prisma"
import { generateCourseCode } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export async function createCourse(formData: FormData) {
  const name = formData.get("name") as string
  
  if (!name || name.trim().length === 0) {
    return { error: "El nombre del curso es requerido" }
  }

  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Debes iniciar sesión para crear un curso" }
  }

  let code = generateCourseCode()
  let attempts = 0
  
  while (attempts < 10) {
    const existing = await prisma.course.findUnique({ where: { code } })
    if (!existing) break
    code = generateCourseCode()
    attempts++
  }

  try {
    const course = await prisma.course.create({
      data: { 
        name: name.trim(), 
        code,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        }
      },
    })
    
    revalidatePath("/")
    return { success: true, code: course.code }
  } catch (error) {
    console.error("Error creating course:", error)
    return { error: "Error al crear el curso" }
  }
}

export async function joinCourse(code: string) {
  const normalizedCode = code.toUpperCase().trim()
  
  if (normalizedCode.length !== 6) {
    return { error: "El código debe tener 6 caracteres" }
  }

  const course = await prisma.course.findUnique({
    where: { code: normalizedCode },
  })

  if (!course) {
    return { error: "No se encontró un curso con ese código" }
  }

  // Si está logueado, lo registramos como seguidor automáticamente
  const session = await auth()
  if (session?.user?.id) {
    await prisma.courseMember.upsert({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      },
      update: {}, // No hacemos nada si ya es miembro
      create: {
        userId: session.user.id,
        courseId: course.id,
        role: "FOLLOWER"
      }
    })
  }

  return { success: true, course: { code: course.code, name: course.name } }
}

export async function getCourseByCode(code: string) {
  const course = await prisma.course.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      subjects: {
        include: {
          _count: { select: { images: true } },
        },
        orderBy: { name: "asc" },
      },
      events: {
        where: {
          date: { gte: new Date() },
        },
        include: { subject: true },
        orderBy: { date: "asc" },
        take: 5,
      },
      members: {
        include: {
          user: true,
        },
      },
    },
  })

  return course
}

export async function getUserCourses() {
  const session = await auth()
  if (!session?.user?.id) return []

  const memberships = await prisma.courseMember.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return memberships.map((m) => ({
    code: m.course.code,
    name: m.course.name,
    role: m.role,
    memberCount: m.course._count.members,
  }))
}

export async function renameCourse(courseId: string, newName: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const member = await prisma.courseMember.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (member?.role !== "OWNER") return { error: "Solo el propietario puede renombrar el curso" }

  const trimmed = newName.trim()
  if (!trimmed) return { error: "El nombre no puede estar vacío" }

  try {
    await prisma.course.update({ where: { id: courseId }, data: { name: trimmed } })
    revalidatePath("/")
    return { success: true }
  } catch {
    return { error: "Error al renombrar el curso" }
  }
}

export async function deleteCourse(courseId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "No autorizado" }

  const member = await prisma.courseMember.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  })
  if (member?.role !== "OWNER") return { error: "Solo el propietario puede eliminar el curso" }

  try {
    await prisma.course.delete({ where: { id: courseId } })
    revalidatePath("/")
    redirect("/")
  } catch {
    return { error: "Error al eliminar el curso" }
  }
}

export async function takeOwnershipAdmin(courseId: string) {
  const session = await auth()
  const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"
  if (session?.user?.email !== SUPER_ADMIN_EMAIL || !session.user.id) return { error: "No autorizado" }

  try {
    // Bajar al owner actual a ADMIN
    await prisma.courseMember.updateMany({
      where: { courseId, role: "OWNER" },
      data: { role: "ADMIN" },
    })
    // Upsert super admin como OWNER
    await prisma.courseMember.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { role: "OWNER" },
      create: { userId: session.user.id, courseId, role: "OWNER" },
    })
    revalidatePath("/admin")
    return { success: true }
  } catch {
    return { error: "Error al tomar control del curso" }
  }
}

export async function deleteCourseAdmin(courseId: string) {
  const session = await auth()
  const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"
  if (session?.user?.email !== SUPER_ADMIN_EMAIL) return { error: "No autorizado" }

  try {
    await prisma.course.delete({ where: { id: courseId } })
    revalidatePath("/admin")
    return { success: true }
  } catch {
    return { error: "Error al eliminar el curso" }
  }
}

export async function getAllCoursesAdmin() {
  const session = await auth()
  const SUPER_ADMIN_EMAIL = "ftorresbaeza@gmail.com"
  if (session?.user?.email !== SUPER_ADMIN_EMAIL) return null

  return prisma.course.findMany({
    include: {
      _count: { select: { members: true, subjects: true } },
      members: {
        where: { role: "OWNER" },
        include: { user: { select: { name: true, email: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateMemberRole(courseId: string, userId: string, newRole: "ADMIN" | "FOLLOWER") {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "No autorizado" }
  }

  // Verificar que el que hace el cambio es el OWNER
  const requester = await prisma.courseMember.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId
      }
    }
  })

  if (requester?.role !== "OWNER") {
    return { error: "Solo el propietario puede gestionar administradores" }
  }

  // No permitir que el OWNER se cambie su propio rol (seguridad)
  if (userId === session.user.id) {
    return { error: "No puedes cambiar tu propio rol" }
  }

  try {
    await prisma.courseMember.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        role: newRole
      }
    })

    revalidatePath(`/[code]/members`)
    return { success: true }
  } catch (error) {
    console.error("Error updating role:", error)
    return { error: "Error al actualizar el rol" }
  }
}
