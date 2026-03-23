import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Calendar, Camera } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-bg-primary to-bg-primary">
      <div className="container mx-auto px-4 py-8 pb-32">
        <header className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-primary rounded-3xl mb-6 shadow-lg shadow-blue-200">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-text-primary mb-3">
            Cuaderno Compartido
          </h1>
          <p className="text-lg text-text-secondary max-w-sm mx-auto">
            Colabora fácilmente con las materias del curso. Sube fotos, consulta apuntes y mantente al día.
          </p>
        </header>

        <section className="max-w-md mx-auto space-y-6">
          <Card className="border-2 border-accent-primary bg-white shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Unirse a un curso
              </h2>
              <form action="/api/course/join" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="courseCode" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Código del curso
                  </label>
                  <input
                    type="text"
                    id="courseCode"
                    name="code"
                    placeholder="Ej: ABC123"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-border rounded-xl text-center text-lg font-mono uppercase tracking-wider focus:border-accent-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-accent-primary hover:bg-blue-600 text-white font-semibold py-3 rounded-xl">
                  Unirse al curso
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-primary px-3 text-text-muted">o</span>
            </div>
          </div>

          <Card className="bg-white shadow-md">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Crear nuevo curso
              </h2>
              <form action="/api/course/create" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="courseName" className="block text-sm font-medium text-text-secondary mb-1.5">
                    Nombre del curso
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    name="name"
                    placeholder="Ej: 3° Básico A"
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-accent-primary focus:outline-none transition-colors"
                    required
                  />
                </div>
                <Button type="submit" variant="outline" className="w-full border-2 border-accent-primary text-accent-primary hover:bg-blue-50 font-semibold py-3 rounded-xl">
                  Crear curso
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-2xl mb-3 mx-auto">
              <Camera className="w-6 h-6 text-accent-secondary" />
            </div>
            <p className="text-sm font-medium text-text-primary">Sube fotos</p>
            <p className="text-xs text-text-muted mt-1">Desde cámara o galería</p>
          </div>
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-2xl mb-3 mx-auto">
              <Users className="w-6 h-6 text-accent-tertiary" />
            </div>
            <p className="text-sm font-medium text-text-primary">Colabora</p>
            <p className="text-xs text-text-muted mt-1">Todos aportan</p>
          </div>
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl mb-3 mx-auto">
              <Calendar className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">Organiza</p>
            <p className="text-xs text-text-muted mt-1">Por fecha y materia</p>
          </div>
          <div className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-2xl mb-3 mx-auto">
              <BookOpen className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-sm font-medium text-text-primary">Consulta</p>
            <p className="text-xs text-text-muted mt-1">Fácil y rápido</p>
          </div>
        </section>
      </div>
    </main>
  )
}
