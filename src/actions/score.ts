"use server"

import { prisma } from "@/lib/prisma"

const POINTS = {
  UPLOAD: 10,
  ROLE_OWNER: 50,
  ROLE_ADMIN: 20,
  ROLE_FOLLOWER: 0,
} as const

export type LeaderboardEntry = {
  userId: string
  name: string
  image: string | null
  role: "OWNER" | "ADMIN" | "FOLLOWER"
  uploads: number
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

  const uploadCounts = await prisma.imageNote.groupBy({
    by: ["uploaderId"],
    where: {
      subjectId: { in: subjectIds },
      uploaderId: { not: null },
    },
    _count: { id: true },
  })

  const uploadMap = new Map(
    uploadCounts.map((u) => [u.uploaderId!, u._count.id])
  )

  const leaderboard: LeaderboardEntry[] = course.members.map((member) => {
    const uploads = uploadMap.get(member.userId) ?? 0
    const roleBonus = POINTS[`ROLE_${member.role}` as keyof typeof POINTS]
    const score = uploads * POINTS.UPLOAD + roleBonus
    return {
      userId: member.userId,
      name: member.user.name ?? "Usuario",
      image: member.user.image,
      role: member.role as "OWNER" | "ADMIN" | "FOLLOWER",
      uploads,
      score,
    }
  })

  return leaderboard.sort((a, b) => b.score - a.score)
}
