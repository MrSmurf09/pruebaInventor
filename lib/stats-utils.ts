import { supabase } from "./supabase"
import type { GameMode } from "./game-utils"

// Tipo para las estadísticas de juego
export type GameStats = {
  id?: number
  userId: number | string
  mode: GameMode
  timeSpent: number
  completedAt: string
}

// Función para guardar estadísticas en Supabase
export async function saveStatsToSupabase(stats: Omit<GameStats, "id">): Promise<boolean> {
  try {
    const { error } = await supabase.from("GameStats").insert([stats])
    return !error
  } catch (error) {
    console.error("Error al guardar estadísticas:", error)
    return false
  }
}

// Función para guardar estadísticas en localStorage
export function saveStatsToLocalStorage(stats: Omit<GameStats, "id">): void {
  try {
    // Obtener estadísticas existentes
    const existingStatsJson = localStorage.getItem("gameStats")
    const existingStats: GameStats[] = existingStatsJson ? JSON.parse(existingStatsJson) : []

    // Añadir nuevas estadísticas
    existingStats.push({
      ...stats,
      id: Date.now(), // Usar timestamp como ID local
    })

    // Guardar en localStorage
    localStorage.setItem("gameStats", JSON.stringify(existingStats))
  } catch (error) {
    console.error("Error al guardar estadísticas en localStorage:", error)
  }
}

// Función para obtener estadísticas de Supabase
export async function getStatsFromSupabase(userId: number | string): Promise<GameStats[]> {
  try {
    const { data, error } = await supabase
      .from("GameStats")
      .select("*")
      .eq("userId", userId)
      .order("completedAt", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return []
  }
}

// Función para obtener estadísticas de localStorage
export function getStatsFromLocalStorage(): GameStats[] {
  try {
    const statsJson = localStorage.getItem("gameStats")
    return statsJson ? JSON.parse(statsJson) : []
  } catch (error) {
    console.error("Error al obtener estadísticas de localStorage:", error)
    return []
  }
}

// Función para obtener los mejores tiempos por modo
export function getBestTimesByMode(stats: GameStats[]): Record<GameMode, number | null> {
  const bestTimes: Record<GameMode, number | null> = {
    easy: null,
    medium: null,
    hard: null,
  }

  // Agrupar por modo y encontrar el mejor tiempo para cada uno
  stats.forEach((stat) => {
    const currentBest = bestTimes[stat.mode]
    if (currentBest === null || stat.timeSpent < currentBest) {
      bestTimes[stat.mode] = stat.timeSpent
    }
  })

  return bestTimes
}

// Función para formatear el tiempo en formato mm:ss
export function formatTimeMMSS(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

