"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { POINTS } from "@/lib/score-config"

export type LeaderboardEntry = {
  userId: string
  name: string
  image: string | null
  role: "OWNER" | "ADMIN" | "FOLLOWER"
  breakdown: Record<string, number>
  score: number
}

export async function getCourseLeaderboard(courseCode: string): Promise<LeaderboardEntry[] | null> {
  const course = await prisma.course.findUnique({
    where: { code: courseCode.toUpperCase() },
    select: {
      id: true,
      subjects: { select: { id: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })

  if (!course) return null

  const subjectIds = course.subjects.map((s) => s.id)

  // Uploads tracked via ImageNote.uploaderId (legacy + new)
  const uploadCounts = await prisma.imageNote.groupBy({
    by: ["uploaderId"],
    where: { subjectId: { in: subjectIds }, uploaderId: { not: null } },
    _count: { id: true },
  })
  const uploadMap = new Map(uploadCounts.map((u) => [u.uploaderId!, u._count.id]))

  // Other activities tracked via UserActivity
  const activities = await prisma.userActivity.groupBy({
    by: ["userId", "type"],
    where: { courseId: course.id },
    _count: { id: true },
  })

  // Build a map: userId → { type → count }
  const activityMap = new Map<string, Record<string, number>>()
  for (const a of activities) {
    if (!activityMap.has(a.userId)) activityMap.set(a.userId, {})
    activityMap.get(a.userId)![a.type] = a._count.id
  }

  const leaderboard: LeaderboardEntry[] = course.members.map((member) => {
    const uploads = uploadMap.get(member.userId) ?? 0
    const acts = activityMap.get(member.userId) ?? {}

    const breakdown: Record<string, number> = {
      UPLOAD_IMAGE: uploads,
      CREATE_SUBJECT: acts.CREATE_SUBJECT ?? 0,
      CREATE_EVENT: acts.CREATE_EVENT ?? 0,
      REQUEST_IMAGES: acts.REQUEST_IMAGES ?? 0,
      SHARE_LINK: acts.SHARE_LINK ?? 0,
    }

    const score = Object.entries(breakdown).reduce(
      (sum, [type, count]) => sum + (POINTS[type] ?? 0) * count,
      0
    )

    return {
      userId: member.userId,
      name: member.user.name ?? "Usuario",
      image: member.user.image,
      role: member.role as "OWNER" | "ADMIN" | "FOLLOWER",
      breakdown,
      score,
    }
  })

  return leaderboard.sort((a, b) => b.score - a.score)
}

export async function recordActivity(courseId: string, type: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.userActivity.create({
    data: { userId: session.user.id, courseId, type: type as any },
  })
}
