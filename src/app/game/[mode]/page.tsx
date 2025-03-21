"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, RefreshCw, Trophy } from "lucide-react"
import { GameBoard } from "@/components/game/board"
import { GameTimer } from "@/components/game/timer"
import { type CardType, type GameMode, GAME_CONFIGS, createNewGame } from "@/lib/game-utils"
import { saveStatsToSupabase, saveStatsToLocalStorage, formatTimeMMSS } from "@/lib/stats-utils"
import { useToast } from "@/hooks/use-toast"

export default function GameModePage() {
  const router = useRouter()
  const params = useParams()
  const mode = (params.mode as GameMode) || "easy"
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<CardType[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [timeSpent, setTimeSpent] = useState(0)

  // Usar useRef para rastrear el tiempo de inicio y el tiempo transcurrido
  const startTimeRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const config = GAME_CONFIGS[mode] || GAME_CONFIGS.easy
  const totalPairs = (config.rows * config.cols) / 2

  // Inicializar el juego
  useEffect(() => {
    // Verificar si hay un usuario
    const storedUser = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser")

    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch (error) {
      router.push("/login")
      return
    }

    // Inicializar cartas
    resetGame()

    // Limpiar el intervalo al desmontar
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [mode, router])

  // Iniciar el temporizador cuando comienza el juego
  useEffect(() => {
    if (gameStarted && !gameOver && !timerIntervalRef.current) {
      startTimeRef.current = Date.now()

      timerIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          setTimeSpent(elapsed)
        }
      }, 1000)
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [gameStarted, gameOver])

  // Guardar estadísticas cuando el juego termina con victoria
  useEffect(() => {
    if (gameWon && user) {
      // Detener el temporizador
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }

      // Calcular tiempo final si no está establecido
      if (timeSpent === 0 && startTimeRef.current) {
        const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setTimeSpent(finalTime)

        // Guardar estadísticas
        saveGameStats(finalTime)
      } else if (timeSpent > 0) {
        // Guardar estadísticas con el tiempo ya establecido
        saveGameStats(timeSpent)
      }
    }
  }, [gameWon, user, timeSpent, mode])

  // Función para guardar estadísticas
  const saveGameStats = async (time: number) => {
    if (!user) return

    const stats = {
      userId: user.id || user.Nombre,
      mode,
      timeSpent: time,
      completedAt: new Date().toISOString(),
    }

    // Intentar guardar en Supabase
    const savedToSupabase = await saveStatsToSupabase(stats)

    // Siempre guardar en localStorage como respaldo
    saveStatsToLocalStorage(stats)

    // Mostrar notificación
    toast({
      title: "Estadísticas guardadas",
      description: `Tu tiempo de ${formatTimeMMSS(time)} ha sido guardado.`,
      duration: 3000,
    })
  }

  // Modificar la función resetGame
  const resetGame = useCallback(() => {
    // Crear un nuevo juego con cartas barajadas
    const newCards = createNewGame(mode)
    setCards(newCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setGameStarted(false)
    setGameOver(false)
    setGameWon(false)
    setTimerKey((prev) => prev + 1)
    setTimeSpent(0)

    // Reiniciar referencias de tiempo
    startTimeRef.current = null

    // Limpiar intervalo existente
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [mode])

  // Manejar clic en carta
  const handleCardClick = useCallback(
    (card: CardType) => {
      if (!gameStarted) {
        setGameStarted(true)
      }

      // No permitir voltear más de 2 cartas a la vez
      if (flippedCards.length >= 2) return

      // Actualizar el estado de la carta
      setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)))

      // Añadir a las cartas volteadas
      setFlippedCards((prev) => [...prev, card])
    },
    [flippedCards, gameStarted],
  )

  // Comprobar coincidencias
  useEffect(() => {
    if (flippedCards.length < 2) return

    const [first, second] = flippedCards

    // Comprobar si las cartas coinciden
    if (first.value === second.value) {
      // Marcar como coincidentes
      setCards((prev) =>
        prev.map((card) => (card.id === first.id || card.id === second.id ? { ...card, matched: true } : card)),
      )

      // Incrementar contador de parejas
      setMatchedPairs((prev) => {
        const newCount = prev + 1
        // Comprobar victoria
        if (newCount >= totalPairs) {
          setGameWon(true)
          setGameOver(true)
        }
        return newCount
      })

      // Limpiar cartas volteadas
      setFlippedCards([])
    } else {
      // Si no coinciden, voltear de nuevo después de un tiempo
      const timer = setTimeout(() => {
        setCards((prev) =>
          prev.map((card) => (card.id === first.id || card.id === second.id ? { ...card, flipped: false } : card)),
        )
        setFlippedCards([])
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [flippedCards, totalPairs])

  // Manejar fin del tiempo
  const handleTimeUp = useCallback(() => {
    if (!gameWon) {
      setGameOver(true)

      // Detener el temporizador
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [gameWon])

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/game">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver</span>
          </Link>
        </Button>
        <h1 className={`text-xl font-semibold text-${config.color}-600`}>Modo {config.name}</h1>
        <Button variant="outline" size="icon" onClick={resetGame}>
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Reiniciar</span>
        </Button>
      </div>

      <div className="mb-4">
        <GameTimer
          key={timerKey}
          timeLimit={config.timeLimit}
          isRunning={gameStarted && !gameOver}
          onTimeUp={handleTimeUp}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {gameOver ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">{gameWon ? "¡Victoria!" : "¡Tiempo agotado!"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  {gameWon ? (
                    <div className="flex flex-col items-center">
                      <Trophy className="h-16 w-16 text-yellow-500 mb-2" />
                      <p>¡Felicidades! Has encontrado todas las parejas.</p>
                      <p className="mt-2 font-semibold">Tiempo: {formatTimeMMSS(timeSpent)}</p>
                    </div>
                  ) : (
                    <p>
                      Has encontrado {matchedPairs} de {totalPairs} parejas.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={resetGame}>
                    Jugar de nuevo
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/game">Cambiar modo</Link>
                  </Button>
                </div>
                <div className="pt-2">
                  <Button variant="link" className="w-full" asChild>
                    <Link href="/stats">Ver estadísticas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <GameBoard cards={cards} onCardClick={handleCardClick} config={config} gameOver={gameOver} />
        )}
      </div>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Parejas encontradas: {matchedPairs} de {totalPairs}
      </div>
    </div>
  )
}

