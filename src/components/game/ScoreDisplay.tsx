"use client";

import { memo } from "react";
import { TeamScore } from "@/lib/game/types";

interface ScoreDisplayProps {
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
  roundNumber: number;
}

/**
 * Displays the current game scores in the top bar.
 */
export const ScoreDisplay = memo(function ScoreDisplay({
  playerTeamScore,
  opponentTeamScore,
  roundNumber,
}: ScoreDisplayProps) {
  return (
    <div 
      className="px-4 py-2 rounded-lg text-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="flex gap-6 items-center">
        <div>
          <div className="text-xs text-gray-400">US</div>
          <div className="text-xl font-bold" style={{ color: "#ffd700" }}>
            {playerTeamScore.score}
          </div>
        </div>
        <div className="text-gray-500">|</div>
        <div>
          <div className="text-xs text-gray-400">THEM</div>
          <div className="text-xl font-bold text-white">
            {opponentTeamScore.score}
          </div>
        </div>
        <div className="text-gray-500">|</div>
        <div className="text-sm text-gray-400">R{roundNumber}</div>
      </div>
    </div>
  );
});

export default ScoreDisplay;

