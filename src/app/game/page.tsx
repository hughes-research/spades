"use client";

import { useEffect } from "react";
import { GameTable } from "@/components/game";
import { useGameStore } from "@/lib/store";

export default function GamePage() {
  const phase = useGameStore((s) => s.phase);
  const startNewGame = useGameStore((s) => s.startNewGame);

  // If no active game, start one with default difficulty
  useEffect(() => {
    if (phase === "waiting") {
      startNewGame("medium");
    }
  }, [phase, startNewGame]);

  if (phase === "waiting") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(145deg, #1a5f4a 0%, #0d4a3a 50%, #0a3d2f 100%)"
        }}
      >
        <div className="text-white text-xl animate-pulse">
          Loading game...
        </div>
      </div>
    );
  }

  return <GameTable />;
}
