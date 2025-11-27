"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trick, PlayerPosition } from "@/lib/game/types";
import { Card } from "./Card";

interface TrickAreaProps {
  currentTrick: Trick | null;
  lastTrickWinner?: PlayerPosition;
}

const positionStyles: Record<
  PlayerPosition,
  { x: number; y: number; rotate: number }
> = {
  south: { x: 0, y: 55, rotate: 0 },
  west: { x: -65, y: 0, rotate: -12 },
  north: { x: 0, y: -55, rotate: 180 },
  east: { x: 65, y: 0, rotate: 12 },
};

const cardEntryVariants = {
  initial: (position: PlayerPosition) => ({
    opacity: 0,
    scale: 0.5,
    x: positionStyles[position].x * 3,
    y: positionStyles[position].y * 3,
    rotate: positionStyles[position].rotate + 180,
  }),
  animate: (position: PlayerPosition) => ({
    opacity: 1,
    scale: 1,
    x: positionStyles[position].x,
    y: positionStyles[position].y,
    rotate: positionStyles[position].rotate,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 },
  },
};

export const TrickArea = memo(function TrickArea({
  currentTrick,
  lastTrickWinner,
}: TrickAreaProps) {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Center decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full border border-gold/20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-gold/10" />
        </div>
      </div>

      {/* Cards played in current trick */}
      <AnimatePresence mode="popLayout">
        {currentTrick?.cards.map(({ card, player }, index) => (
          <motion.div
            key={`${player}-${card.id}-${index}`}
            className="absolute"
            custom={player}
            variants={cardEntryVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              zIndex: index + 1,
            }}
          >
            <Card
              suit={card.suit}
              rank={card.rank}
              size="lg"
              isPlayable={false}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Show winner indicator when trick is complete */}
      <AnimatePresence>
        {currentTrick?.cards.length === 4 && currentTrick.winner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gold/20 backdrop-blur-sm rounded-full px-4 py-2 border border-gold/50">
              <span className="font-display text-sm uppercase tracking-wider" style={{ color: "#ffd700" }}>
                {currentTrick.winner === "south"
                  ? "You win!"
                  : `${currentTrick.winner} wins`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default TrickArea;

