"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { TeamScore } from "@/lib/game/types";

interface RoundEndModalProps {
  roundNumber: number;
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
}

/**
 * Modal displayed at the end of each round showing the score summary.
 */
export const RoundEndModal = memo(function RoundEndModal({
  roundNumber,
  playerTeamScore,
  opponentTeamScore,
}: RoundEndModalProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 text-center max-w-lg">
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#ffd700" }}>
          Round {roundNumber} Complete
        </h2>
        
        <div className="flex gap-12 justify-center mb-6">
          <div>
            <div className="text-gray-400 text-sm mb-1">Your Team</div>
            <div className="text-4xl font-bold" style={{ color: "#ffd700" }}>
              {playerTeamScore.score}
            </div>
            <div className={`text-lg ${playerTeamScore.roundScore >= 0 ? "text-green-400" : "text-red-400"}`}>
              {playerTeamScore.roundScore >= 0 ? "+" : ""}{playerTeamScore.roundScore}
            </div>
          </div>
          <div className="w-px bg-gray-600" />
          <div>
            <div className="text-gray-400 text-sm mb-1">Opponents</div>
            <div className="text-4xl font-bold text-white">
              {opponentTeamScore.score}
            </div>
            <div className={`text-lg ${opponentTeamScore.roundScore >= 0 ? "text-green-400" : "text-red-400"}`}>
              {opponentTeamScore.roundScore >= 0 ? "+" : ""}{opponentTeamScore.roundScore}
            </div>
          </div>
        </div>
        
        <p className="text-gray-400">Next round starting...</p>
      </div>
    </motion.div>
  );
});

export default RoundEndModal;

