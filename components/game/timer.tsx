"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { formatTime } from "@/lib/game-utils"

interface TimerProps {
  timeLimit: number
  isRunning: boolean
  onTimeUp: () => void
  key?: string | number // Añadir key para forzar el remontaje del componente
}

export function GameTimer({ timeLimit, isRunning, onTimeUp, key }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const progress = (timeLeft / timeLimit) * 100

  // Reiniciar el tiempo cuando cambia el timeLimit o la key
  useEffect(() => {
    setTimeLeft(timeLimit)
  }, [timeLimit, key])

  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, onTimeUp])

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Tiempo restante</span>
        <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
      </div>
      <Progress
        value={progress}
        className={`h-2 ${progress > 60 ? "bg-green-100" : progress > 30 ? "bg-yellow-100" : "bg-red-100"}`}
        indicatorClassName={`${progress > 60 ? "bg-green-500" : progress > 30 ? "bg-yellow-500" : "bg-red-500"}`}
      />
    </div>
  )
}

