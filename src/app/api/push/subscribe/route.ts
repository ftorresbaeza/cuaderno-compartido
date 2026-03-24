import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint")
  const courseId = searchParams.get("courseId")

  if (!endpoint || !courseId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const sub = await prisma.pushSubscription.findFirst({
    where: { endpoint, courseId },
  })

  return NextResponse.json({ subscribed: !!sub })
}

export async function POST(request: NextRequest) {
  const { endpoint, keys, courseId } = await request.json()

  if (!endpoint || !keys?.p256dh || !keys?.auth || !courseId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint_courseId: { endpoint, courseId } },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, courseId },
    update: { p256dh: keys.p256dh, auth: keys.auth },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { endpoint, courseId } = await request.json()

  if (!endpoint || !courseId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint, courseId } })
  return NextResponse.json({ success: true })
}
