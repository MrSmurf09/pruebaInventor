"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, BarChart } from "lucide-react"
import Link from "next/link"

export default function GamePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay un usuario en localStorage o sessionStorage
    const storedUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")

    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("currentUser")
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Memory Match</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/stats">
              <BarChart className="h-4 w-4" />
              <span className="sr-only">Estadísticas</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {user?.Nombre}!</h2>
        <p className="text-muted-foreground">Selecciona un modo de juego para comenzar</p>
      </div>

      <div className="grid gap-4 max-w-md mx-auto w-full">
        <Link href="/game/easy" className="w-full">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-green-600">Modo Fácil</h3>
                  <p className="text-muted-foreground">4 x 2 cartas</p>
                </div>
                <div className="flex items-center text-green-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>25s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/game/medium" className="w-full">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">Modo Medio</h3>
                  <p className="text-muted-foreground">4 x 3 cartas</p>
                </div>
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>35s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/game/hard" className="w-full">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 hover:border-red-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-red-600">Modo Difícil</h3>
                  <p className="text-muted-foreground">4 x 5 cartas</p>
                </div>
                <div className="flex items-center text-red-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>60s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6 max-w-md mx-auto w-full">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/stats">
            <BarChart className="h-4 w-4 mr-2" />
            Ver estadísticas
          </Link>
        </Button>
      </div>
    </div>
  )
}

