"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Trophy } from "lucide-react"
import {
  getStatsFromSupabase,
  getStatsFromLocalStorage,
  type GameStats,
  getBestTimesByMode,
  formatTimeMMSS,
} from "@/lib/stats-utils"
import { type GameMode, GAME_CONFIGS } from "@/lib/game-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StatsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<GameStats[]>([])
  const [loading, setLoading] = useState(true)
  const [bestTimes, setBestTimes] = useState<Record<GameMode, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  })

  useEffect(() => {
    // Verificar si hay un usuario
    const storedUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")

    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Cargar estadísticas
      loadStats(parsedUser)
    } catch (error) {
      router.push("/login")
    }
  }, [router])

  const loadStats = async (user: any) => {
    setLoading(true)

    // Intentar cargar desde Supabase
    const supabaseStats = await getStatsFromSupabase(user.id || user.Nombre)

    // Cargar desde localStorage como respaldo
    const localStats = getStatsFromLocalStorage()

    // Combinar y filtrar por usuario
    const userLocalStats = localStats.filter((stat) => stat.userId === user.id || stat.userId === user.Nombre)

    // Usar estadísticas de Supabase si están disponibles, de lo contrario usar localStorage
    const combinedStats = supabaseStats.length > 0 ? supabaseStats : userLocalStats

    // Ordenar por fecha (más reciente primero)
    combinedStats.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    setStats(combinedStats)

    // Calcular mejores tiempos
    const best = getBestTimesByMode(combinedStats)
    setBestTimes(best)

    setLoading(false)
  }

  // Filtrar estadísticas por modo
  const getStatsByMode = (mode: GameMode) => {
    return stats.filter((stat) => stat.mode === mode)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/game">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Estadísticas</h1>
        <div className="w-10"></div> {/* Espaciador para centrar el título */}
      </div>

      <div className="max-w-md mx-auto w-full mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Mejores Tiempos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Object.entries(GAME_CONFIGS).map(([mode, config]) => (
                <div key={mode} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${config.color}-500`}></div>
                    <span>Modo {config.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {bestTimes[mode as GameMode] !== null
                        ? formatTimeMMSS(bestTimes[mode as GameMode]!)
                        : "Sin registro"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-md mx-auto w-full">
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="easy">Fácil</TabsTrigger>
            <TabsTrigger value="medium">Medio</TabsTrigger>
            <TabsTrigger value="hard">Difícil</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <StatsTable stats={stats} />
          </TabsContent>

          <TabsContent value="easy">
            <StatsTable stats={getStatsByMode("easy")} />
          </TabsContent>

          <TabsContent value="medium">
            <StatsTable stats={getStatsByMode("medium")} />
          </TabsContent>

          <TabsContent value="hard">
            <StatsTable stats={getStatsByMode("hard")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Componente para la tabla de estadísticas
function StatsTable({ stats }: { stats: GameStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No hay estadísticas disponibles</p>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modo</TableHead>
              <TableHead>Tiempo</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat, index) => (
              <TableRow key={stat.id || index}>
                <TableCell className="font-medium">{GAME_CONFIGS[stat.mode].name}</TableCell>
                <TableCell>{formatTimeMMSS(stat.timeSpent)}</TableCell>
                <TableCell>{new Date(stat.completedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

