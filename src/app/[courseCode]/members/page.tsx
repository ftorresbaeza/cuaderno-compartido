import { auth } from "@/auth"
import { getCourseByCode, updateMemberRole } from "@/actions/course"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Shield, ShieldCheck, UserMinus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function MembersPage({
  params,
}: {
  params: Promise<{ courseCode: string }>
}) {
  const { courseCode } = await params
  const session = await auth()
  
  if (!session?.user) {
    redirect("/")
  }

  const course = await getCourseByCode(courseCode)
  if (!course) {
    redirect("/")
  }

  // Verificar si el usuario actual es al menos ADMIN o OWNER para ver esta página
  const currentMember = course.members.find(m => m.userId === session.user?.id)
  if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
    redirect(`/${courseCode}`)
  }

  const isOwner = currentMember.role === "OWNER"

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 py-4">
        <Link href={`/${courseCode}`} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5 text-text-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Miembros del curso</h1>
          <p className="text-text-muted text-sm">{course.name}</p>
        </div>
      </div>

      <div className="space-y-4">
        {course.members.sort((a,b) => {
          const order = { OWNER: 0, ADMIN: 1, FOLLOWER: 2 }
          return order[a.role as keyof typeof order] - order[b.role as keyof typeof order]
        }).map((member) => (
          <Card key={member.id} className="bg-white border-2 border-border shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <img src={member.user.image} alt={member.user.name || ""} className="h-10 w-10 rounded-full border-2 border-accent-primary" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-accent-primary">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-text-primary">{member.user.name || "Usuario"}</p>
                  <p className="text-xs text-text-muted capitalize">{member.role.toLowerCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {member.role === "OWNER" ? (
                  <div className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Propietario
                  </div>
                ) : isOwner ? (
                  <form action={async () => {
                    "use server"
                    await updateMemberRole(course.id, member.userId, member.role === "ADMIN" ? "FOLLOWER" : "ADMIN")
                  }}>
                    <Button 
                      variant={member.role === "ADMIN" ? "destructive" : "outline"} 
                      size="sm"
                      className="h-8 rounded-lg gap-1.5"
                    >
                      {member.role === "ADMIN" ? (
                        <>
                          <UserMinus className="h-3.5 w-3.5" />
                          Quitar Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-3.5 w-3.5" />
                          Hacer Admin
                        </>
                      )}
                    </Button>
                  </form>
                ) : member.role === "ADMIN" && (
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                    Admin
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
