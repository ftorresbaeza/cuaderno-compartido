import { NextRequest, NextResponse } from "next/server"
import { cleanupOldImages } from "@/actions/image"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await cleanupOldImages()
    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cleanup error:", error)
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
  }
}
