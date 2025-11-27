"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card as CardType, PlayerPosition, Player } from "@/lib/game/types";

interface HintDisplayProps {
  showHint: boolean;
  hintCard: CardType | null;
}

/**
 * Displays a hint for which card to play.
 */
export const HintDisplay = memo(function HintDisplay({
  showHint,
  hintCard,
}: HintDisplayProps) {
  return (
    <AnimatePresence>
      {showHint && hintCard && (
        <motion.div
          className="absolute bottom-40 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="bg-green-700 px-6 py-3 rounded-lg border-2 border-green-400 shadow-xl">
            <span className="text-white font-bold">
              Play: {hintCard.rank} of {hintCard.suit}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

interface WaitingForBidOverlayProps {
  currentPlayer: PlayerPosition;
  players: Record<PlayerPosition, Player>;
}

/**
 * Shows when waiting for an AI player to bid.
 */
export const WaitingForBidOverlay = memo(function WaitingForBidOverlay({
  currentPlayer,
  players,
}: WaitingForBidOverlayProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-black/70 px-8 py-4 rounded-xl">
        <span className="text-white text-lg">
          Waiting for <span className="text-yellow-400 font-bold">{players[currentPlayer].name}</span> to bid...
        </span>
      </div>
    </motion.div>
  );
});

interface AIThinkingOverlayProps {
  currentPlayer: PlayerPosition;
  players: Record<PlayerPosition, Player>;
}

/**
 * Shows when an AI player is thinking about their play.
 */
export const AIThinkingOverlay = memo(function AIThinkingOverlay({
  currentPlayer,
  players,
}: AIThinkingOverlayProps) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div className="bg-black/50 px-6 py-3 rounded-lg">
        <span className="text-yellow-400 font-medium">
          {players[currentPlayer].name} is thinking...
        </span>
      </div>
    </motion.div>
  );
});

