import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPushToCourse } from "@/lib/webpush"

export async function POST(request: NextRequest) {
  const { courseId } = await request.json()

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { courseId },
  })

  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No hay suscripciones para este curso", count: 0 })
  }

  try {
    const results = await sendPushToCourse(courseId, {
      title: "Prueba de notificación",
      body: "Si ves esto, las notificaciones funcionan correctamente.",
      url: "/",
    })
    return NextResponse.json({ success: true, count: subscriptions.length, results })
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    console.error("[push/test] Error:", errMsg)
    const hasPrivateKey = !!(process.env.VAPID_PRIVATE_KEY)
    return NextResponse.json({ error: errMsg, debug: { hasPrivateKey, privateKeyLength: process.env.VAPID_PRIVATE_KEY?.length ?? 0 } }, { status: 500 })
  }
}
