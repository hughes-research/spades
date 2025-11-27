"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeamScore, Player, PlayerPosition } from "@/lib/game/types";
import { formatBid } from "@/lib/game/scoring";
import { SuitIcon } from "@/components/svg";

interface ScoreboardProps {
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
  players: Record<PlayerPosition, Player>;
  currentPlayer?: PlayerPosition;
  round: number;
  compact?: boolean;
}

interface TeamRowProps {
  label: string;
  score: TeamScore;
  player1: Player;
  player2: Player;
  isPlayerTeam: boolean;
  currentPlayer?: PlayerPosition;
}

const TeamRow = memo(function TeamRow({
  label,
  score,
  player1,
  player2,
  isPlayerTeam,
  currentPlayer,
}: TeamRowProps) {
  const isActive =
    currentPlayer === player1.position || currentPlayer === player2.position;

  return (
    <motion.div
      className={`
        glass-panel p-3 rounded-lg
        ${isActive ? "ring-2 ring-gold/50" : ""}
      `}
      animate={isActive ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0, repeatDelay: 1 }}
    >
      {/* Team label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <SuitIcon suit="spades" size={16} />
          <span
            className="text-sm font-display tracking-wider"
            style={{ fontFamily: "var(--font-cinzel)", color: "#ffd700" }}
          >
            {label}
          </span>
        </div>
        <motion.span
          key={score.score}
          className="text-2xl font-mono font-bold"
          style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff" }}
          initial={{ scale: 1.3, color: "#d4af37" }}
          animate={{ scale: 1, color: "#ffffff" }}
          transition={{ duration: 0.3 }}
        >
          {score.score}
        </motion.span>
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <PlayerInfo
          player={player1}
          isCurrentPlayer={currentPlayer === player1.position}
        />
        <PlayerInfo
          player={player2}
          isCurrentPlayer={currentPlayer === player2.position}
        />
      </div>

      {/* Bags */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span style={{ color: "#ffffff" }}>Bags:</span>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < score.bags ? "bg-warning" : "bg-white/20"
              }`}
              initial={i < score.bags ? { scale: 0 } : {}}
              animate={i < score.bags ? { scale: 1 } : {}}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

const PlayerInfo = memo(function PlayerInfo({
  player,
  isCurrentPlayer,
}: {
  player: Player;
  isCurrentPlayer: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col p-1.5 rounded
        ${isCurrentPlayer ? "bg-gold/20 ring-1 ring-gold/50" : "bg-white/10"}
      `}
    >
      <span style={{ color: "#ffffff" }} className="truncate font-medium">{player.name}</span>
      <div className="flex justify-between mt-1">
        <span style={{ color: "#cccccc" }}>Bid:</span>
        <span
          className="font-mono font-bold"
          style={{ 
            fontFamily: "var(--font-fira-code)", 
            color: player.bid === 0 || player.bid === -1 ? "#fbbf24" : "#ffffff" 
          }}
        >
          {formatBid(player.bid)}
        </span>
      </div>
      <div className="flex justify-between">
        <span style={{ color: "#cccccc" }}>Won:</span>
        <span
          className="font-mono font-bold"
          style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff" }}
        >
          {player.tricksWon}
        </span>
      </div>
    </div>
  );
});

export const Scoreboard = memo(function Scoreboard({
  playerTeamScore,
  opponentTeamScore,
  players,
  currentPlayer,
  round,
  compact = false,
}: ScoreboardProps) {
  // Calculate team bids and tricks
  const playerTeamBid = (players.south.bid ?? 0) + (players.north.bid ?? 0);
  const playerTeamTricks = players.south.tricksWon + players.north.tricksWon;
  const opponentTeamBid = (players.west.bid ?? 0) + (players.east.bid ?? 0);
  const opponentTeamTricks = players.west.tricksWon + players.east.tricksWon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full">
        {/* Your team */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold" style={{ color: "#ffffff" }}>You</span>
          <span
            className="text-lg font-mono font-bold"
            style={{ fontFamily: "var(--font-fira-code)", color: "#ffd700" }}
          >
            {playerTeamScore.score}
          </span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ 
              fontFamily: "var(--font-fira-code)", 
              backgroundColor: playerTeamTricks >= playerTeamBid ? "#22c55e50" : "#ef444450",
              color: "#ffffff"
            }}
          >
            {playerTeamTricks}/{playerTeamBid > 0 ? playerTeamBid : "-"}
          </span>
        </div>
        <div className="w-px h-6 bg-white/30" />
        {/* Opponent team */}
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-semibold" style={{ color: "#ffffff" }}>Them</span>
          <span
            className="text-lg font-mono font-bold"
            style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff" }}
          >
            {opponentTeamScore.score}
          </span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ 
              fontFamily: "var(--font-fira-code)", 
              backgroundColor: opponentTeamTricks >= opponentTeamBid ? "#22c55e50" : "#ef444450",
              color: "#ffffff"
            }}
          >
            {opponentTeamTricks}/{opponentTeamBid > 0 ? opponentTeamBid : "-"}
          </span>
        </div>
        <div className="w-px h-6 bg-white/30" />
        <span className="text-xs font-semibold" style={{ color: "#ffffff" }}>R{round}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Round indicator */}
      <div className="text-center">
        <span
          className="text-sm font-display tracking-widest"
          style={{ fontFamily: "var(--font-cinzel)", color: "#ffd700" }}
        >
          ROUND {round}
        </span>
      </div>

      {/* Team scores */}
      <TeamRow
        label="YOUR TEAM"
        score={playerTeamScore}
        player1={players.south}
        player2={players.north}
        isPlayerTeam={true}
        currentPlayer={currentPlayer}
      />
      <TeamRow
        label="OPPONENTS"
        score={opponentTeamScore}
        player1={players.west}
        player2={players.east}
        isPlayerTeam={false}
        currentPlayer={currentPlayer}
      />

      {/* Progress to 500 */}
      <div className="glass-panel p-2 rounded-lg">
        <div className="text-xs text-center mb-2" style={{ color: "#ffffff" }}>
          First to 500 wins
        </div>
        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold/60 to-gold"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (playerTeamScore.score / 500) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mt-1">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-white/40 to-white/60"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (opponentTeamScore.score / 500) * 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
});

export default Scoreboard;
