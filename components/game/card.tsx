"use client"
import { motion } from "framer-motion"
import type { CardType } from "@/lib/game-utils"

interface CardProps {
  card: CardType
  onClick: (card: CardType) => void
  disabled: boolean
}

const CARD_ICONS = ["🍎", "🍌", "🍒", "🍓", "🍊", "🍇", "🍉", "🍋", "🍍", "🥝"]

export function GameCard({ card, onClick, disabled }: CardProps) {
  const handleClick = () => {
    if (!disabled && !card.flipped && !card.matched) {
      onClick(card)
    }
  }

  return (
    <div className="aspect-[3/4] relative cursor-pointer" onClick={handleClick}>
      <motion.div
        className="w-full h-full absolute"
        initial={false}
        animate={{
          rotateY: card.flipped || card.matched ? 180 : 0,
        }}
        transition={{ duration: 0.5 }}
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-md">
          ?
        </div>
      </motion.div>

      <motion.div
        className="w-full h-full absolute"
        initial={false}
        animate={{
          rotateY: card.flipped || card.matched ? 0 : -180,
        }}
        transition={{ duration: 0.5 }}
        style={{
          backfaceVisibility: "hidden",
        }}
      >
        <div
          className={`w-full h-full rounded-lg ${card.matched ? "bg-green-100" : "bg-white"} flex items-center justify-center text-4xl shadow-md`}
        >
          {CARD_ICONS[card.value - 1] || card.value}
        </div>
      </motion.div>
    </div>
  )
}

