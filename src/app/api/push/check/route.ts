import { NextResponse } from "next/server"
import webpush from "web-push"

export async function GET() {
  const rawPrivate = process.env.VAPID_PRIVATE_KEY ?? ""
  const privateKey = rawPrivate.trim().replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  const publicKey = "BNpU_ZnAQrxw6DU0gfQlLLxBhpk6MI2hbF_ZhPts272LhLt4azNtepjBoLgBY1DWw2-j3f-RycTVfe3A7jWTHwA"

  let vapidOk = false
  let vapidError = ""
  try {
    webpush.setVapidDetails("mailto:test@test.com", publicKey, privateKey)
    vapidOk = true
  } catch (e) {
    vapidError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    hasPrivateKey: !!rawPrivate,
    privateKeyRawLen: rawPrivate.length,
    privateKeyNormLen: privateKey.length,
    privateKeyFirst4: privateKey.slice(0, 4),
    publicKeyLen: publicKey.length,
    vapidOk,
    vapidError,
  })
}
