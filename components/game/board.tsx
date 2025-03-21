"use client"
import { GameCard } from "./card"
import type { CardType, GameConfig } from "@/lib/game-utils"

interface BoardProps {
  cards: CardType[]
  onCardClick: (card: CardType) => void
  config: GameConfig
  gameOver: boolean
}

export function GameBoard({ cards, onCardClick, config, gameOver }: BoardProps) {
  return (
    <div
      className="grid gap-2 w-full max-w-md mx-auto"
      style={{
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
      }}
    >
      {cards.map((card) => (
        <GameCard key={card.id} card={card} onClick={onCardClick} disabled={gameOver} />
      ))}
    </div>
  )
}

