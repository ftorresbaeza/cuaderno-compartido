import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { sendPushToCourse } from "@/lib/webpush"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files")
    const subjectId = formData.get("subjectId") as string
    const dateStr = formData.get("date") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const subject = await prisma.subject.findUnique({ 
      where: { id: subjectId },
      include: { course: true }
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(12, 0, 0, 0)

    const uploadedImages: string[] = []
    const errors: string[] = []

    for (const file of files) {
      if (!(file instanceof File)) {
        errors.push(`Invalid file: ${typeof file}`)
        continue
      }

      try {
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
        
        // Vercel blob can handle File objects directly in most environments
        const blob = await put(filename, file, {
          access: "public",
          contentType: file.type,
        })

        await prisma.imageNote.create({
          data: {
            url: blob.url,
            subjectId,
            date,
            uploaderId: null,
          },
        })

        uploadedImages.push(blob.url)
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        errors.push(`Error uploading ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (uploadedImages.length > 0) {
      const n = uploadedImages.length
      sendPushToCourse(subject.course.id, {
        title: `${subject.course.name} · ${subject.name}`,
        body: `${n} foto${n > 1 ? "s" : ""} nueva${n > 1 ? "s" : ""} subida${n > 1 ? "s" : ""}`,
        url: `/${subject.course.code}/subjects/${subjectId}`,
      }).catch(() => {/* no bloquear la respuesta si falla el push */})
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : 'Unknown error',
      originalError: error
    }, { status: 500 })
  }
}
