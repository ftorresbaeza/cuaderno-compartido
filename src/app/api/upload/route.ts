import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const subjectId = formData.get("subjectId") as string
    const dateStr = formData.get("date") as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const date = dateStr ? new Date(dateStr) : new Date()
    date.setHours(12, 0, 0, 0)

    const uploadedImages: string[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        const { put } = await import("@vercel/blob")
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
        const blob = await put(filename, file, {
          access: "public",
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
        console.error("Error uploading:", error)
        errors.push(`Error uploading ${file.name}`)
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadedImages.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
