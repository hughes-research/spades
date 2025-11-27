"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { formatBid } from "@/lib/game/scoring";

interface PlayerLabelProps {
  name: string;
  bid: number | null;
  tricks: number;
  isCurrentPlayer: boolean;
  isHuman?: boolean;
}

/**
 * Displays a player's name with their current bid and tricks won.
 */
export const PlayerLabel = memo(function PlayerLabel({
  name,
  bid,
  tricks,
  isCurrentPlayer,
  isHuman = false,
}: PlayerLabelProps) {
  return (
    <motion.div
      className="text-center"
      animate={isCurrentPlayer ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: isCurrentPlayer ? Infinity : 0 }}
    >
      <span 
        className="text-lg font-bold drop-shadow-lg"
        style={{ 
          color: isHuman ? "#ff6b6b" : "#ffd700",
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
        }}
      >
        {name}: {tricks}/{formatBid(bid, true)}
      </span>
    </motion.div>
  );
});

export default PlayerLabel;

