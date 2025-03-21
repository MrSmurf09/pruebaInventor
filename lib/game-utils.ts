// Tipos para el juego
export type CardType = {
  id: number
  value: number
  flipped: boolean
  matched: boolean
}

export type GameMode = "easy" | "medium" | "hard"

export type GameConfig = {
  rows: number
  cols: number
  timeLimit: number
  name: string
  color: string
}

// Configuraciones de los modos de juego
export const GAME_CONFIGS: Record<GameMode, GameConfig> = {
  easy: {
    rows: 2,
    cols: 4,
    timeLimit: 25,
    name: "Fácil",
    color: "green",
  },
  medium: {
    rows: 3,
    cols: 4,
    timeLimit: 35,
    name: "Medio",
    color: "blue",
  },
  hard: {
    rows: 5,
    cols: 4,
    timeLimit: 60,
    name: "Difícil",
    color: "red",
  },
}

// Función para barajar un array (Fisher-Yates shuffle)
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Función para crear un nuevo juego
export function createNewGame(mode: GameMode): CardType[] {
  const config = GAME_CONFIGS[mode]
  const totalCards = config.rows * config.cols
  const totalPairs = totalCards / 2

  // Crear pares de cartas
  const values = Array.from({ length: totalPairs }, (_, i) => i + 1)
  const pairs = [...values, ...values]

  // Barajar las cartas
  const shuffled = shuffleArray(pairs)

  // Crear el array de cartas
  return shuffled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }))
}

// Función para formatear el tiempo
export function formatTime(seconds: number): string {
  return `${seconds}s`
}

