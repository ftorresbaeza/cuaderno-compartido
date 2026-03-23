"use server"

import { prisma } from "@/lib/prisma"
import { generateCourseCode } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCourse(formData: FormData) {
  const name = formData.get("name") as string
  
  if (!name || name.trim().length === 0) {
    return { error: "El nombre del curso es requerido" }
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
      data: { name: name.trim(), code },
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
    },
  })

  return course
}
