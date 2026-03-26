import { getCourseLeaderboard } from "@/actions/score"
import { auth, signIn } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Trophy, Upload, LogIn, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

const MEDAL = ["🥇", "🥈", "🥉"]

const ROLE_LABEL = {
  OWNER: { label: "Propietario", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ADMIN: { label: "Admin", color: "bg-blue-50 text-blue-700 border-blue-200" },
  FOLLOWER: { label: "Seguidor", color: "bg-slate-50 text-slate-600 border-slate-200" },
}

export default async function RankingPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const session = await auth()

  const leaderboard = await getCourseLeaderboard(courseCode)
  if (!leaderboard) redirect("/")

  const currentUserId = session?.user?.id

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 py-4">
        <Link
          href={`/${courseCode}`}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Ranking
          </h1>
          <p className="text-text-muted text-sm">¿Quién aporta más al curso?</p>
        </div>
      </div>

      {/* Banner para usuarios anónimos */}
      {!session?.user && (
        <div className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            ¡Aparece en el ranking!
          </p>
          <p className="text-xs text-yellow-700 leading-relaxed">
            Inicia sesión con Google para que tus subidas cuenten y compitas con el resto del curso. Gana puntos subiendo apuntes y siendo parte activa.
          </p>
          <form
            action={async () => {
              "use server"
              await signIn("google")
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white text-xs font-bold rounded-xl"
            >
              <LogIn className="h-4 w-4" />
              Registrarme con Google
            </button>
          </form>
        </div>
      )}

      {/* Podio top 3 */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-2">
          {/* 2do puesto */}
          <PodiumCard entry={leaderboard[1]} position={2} isCurrentUser={leaderboard[1].userId === currentUserId} />
          {/* 1er puesto */}
          <PodiumCard entry={leaderboard[0]} position={1} isCurrentUser={leaderboard[0].userId === currentUserId} />
          {/* 3er puesto */}
          <PodiumCard entry={leaderboard[2]} position={3} isCurrentUser={leaderboard[2].userId === currentUserId} />
        </div>
      )}

      {/* Lista completa */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-secondary">Clasificación completa</h2>
        {leaderboard.map((entry, idx) => {
          const isCurrentUser = entry.userId === currentUserId
          const roleInfo = ROLE_LABEL[entry.role]
          return (
            <Card
              key={entry.userId}
              className={`border-2 transition-all ${
                isCurrentUser
                  ? "border-accent-primary bg-blue-50/50 shadow-md"
                  : "border-border bg-white"
              }`}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl w-8 text-center font-bold text-text-muted">
                  {MEDAL[idx] ?? <span className="text-sm text-text-muted">{idx + 1}</span>}
                </span>

                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="h-10 w-10 rounded-full border-2 border-accent-primary flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-text-muted" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary text-sm truncate">
                    {entry.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs text-accent-primary font-bold">• Tú</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      {entry.uploads} subidas
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-accent-primary">{entry.score}</p>
                  <p className="text-xs text-text-muted">pts</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Explicación de puntos */}
      <div className="rounded-2xl bg-slate-50 border border-border p-4 space-y-2">
        <p className="text-xs font-semibold text-text-secondary">¿Cómo se calculan los puntos?</p>
        <ul className="text-xs text-text-muted space-y-1">
          <li>📸 Subir una imagen de apuntes → <strong>+10 pts</strong></li>
          <li>👑 Ser propietario del curso → <strong>+50 pts</strong></li>
          <li>🛡️ Ser administrador → <strong>+20 pts</strong></li>
        </ul>
      </div>
    </div>
  )
}

function PodiumCard({
  entry,
  position,
  isCurrentUser,
}: {
  entry: { name: string; image: string | null; score: number }
  position: number
  isCurrentUser: boolean
}) {
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" }
  const sizes = { 1: "h-14 w-14", 2: "h-12 w-12", 3: "h-10 w-10" }
  const podiumColors = {
    1: "bg-yellow-100 border-yellow-300",
    2: "bg-slate-100 border-slate-300",
    3: "bg-orange-50 border-orange-200",
  }

  return (
    <div className="flex flex-col items-center gap-1 flex-1 max-w-[100px]">
      <span className="text-2xl">{MEDAL[position - 1]}</span>
      {entry.image ? (
        <img
          src={entry.image}
          alt={entry.name}
          className={`${sizes[position as 1 | 2 | 3]} rounded-full border-2 ${
            isCurrentUser ? "border-accent-primary" : "border-white"
          } shadow-md`}
        />
      ) : (
        <div
          className={`${sizes[position as 1 | 2 | 3]} rounded-full bg-slate-200 flex items-center justify-center shadow-md`}
        >
          <User className="h-5 w-5 text-slate-400" />
        </div>
      )}
      <p className="text-xs font-semibold text-text-primary text-center truncate w-full px-1">
        {entry.name.split(" ")[0]}
      </p>
      <p className="text-sm font-bold text-accent-primary">{entry.score} pts</p>
      <div
        className={`w-full ${heights[position as 1 | 2 | 3]} rounded-t-xl border-2 ${
          podiumColors[position as 1 | 2 | 3]
        } flex items-center justify-center`}
      >
        <span className="text-xl font-bold text-text-muted">{position}</span>
      </div>
    </div>
  )
}
