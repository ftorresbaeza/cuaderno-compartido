import webpush from "web-push"
import { prisma } from "@/lib/prisma"

export async function sendPushToCourse(
  courseId: string,
  payload: { title: string; body: string; url?: string }
) {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { courseId },
  })

  console.log(`[webpush] courseId=${courseId} subscriptions=${subscriptions.length} privateKey=${process.env.VAPID_PRIVATE_KEY ? "ok" : "MISSING"}`)

  if (subscriptions.length === 0) return []

  const publicKey = "BNpU_ZnAQrxw6DU0gfQlLLxBhpk6MI2hbF_ZhPts272LhLt4azNtepjBoLgBY1DWw2-j3f-RycTVfe3A7jWTHwA"
  const rawPrivateKey = process.env.VAPID_PRIVATE_KEY ?? ""
  // Trim whitespace (newlines added by some shells), normalize to URL-safe base64 without padding
  const privateKey = rawPrivateKey.trim().replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")

  console.log(`[webpush] privateKey length=${privateKey.length} (raw=${rawPrivateKey.length})`)

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "ftorresbaeza@gmail.com"}`,
    publicKey,
    privateKey
  )

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  )

  const expiredEndpoints: string[] = []
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number; body?: string }
      console.error(`[webpush] failed endpoint=${subscriptions[i].endpoint.slice(0, 60)} status=${err?.statusCode} body=${err?.body}`)
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        expiredEndpoints.push(subscriptions[i].endpoint)
      }
    } else {
      console.log(`[webpush] sent ok endpoint=${subscriptions[i].endpoint.slice(0, 60)}`)
    }
  })

  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints }, courseId },
    })
  }

  return results.map((r, i) => ({
    endpoint: subscriptions[i].endpoint.slice(0, 60),
    status: r.status,
    error: r.status === "rejected" ? String((r.reason as Error)?.message) : undefined,
  }))
}
