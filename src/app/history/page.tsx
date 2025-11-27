"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PageLayout, Section, Button } from "@/components/ui";
import { SuitIcon } from "@/components/svg";
import { FONTS } from "@/lib/styles";

interface GameRecord {
  id: string;
  createdAt: string;
  status: string;
  difficulty: string;
  yourTeamScore: number;
  aiTeamScore: number;
  winner: string | null;
}

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalRounds: number;
  highScore: number;
  winStreak: number;
  bestStreak: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatCard({ label, value, highlight = false }: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl font-mono ${highlight ? "text-gold" : "text-text-primary"}`}
        style={{ fontFamily: FONTS.mono }}
      >
        {value}
      </div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}

function GameRecordItem({ game, index }: { game: GameRecord; index: number }) {
  const isWin = game.winner === "you";
  const isLoss = game.winner === "ai";
  
  const statusStyles = isWin
    ? "bg-success/10 border-success/30"
    : isLoss
    ? "bg-danger/10 border-danger/30"
    : "bg-midnight/40 border-text-muted/20";

  const scoreColor = isWin ? "text-success" : isLoss ? "text-danger" : "text-text-primary";

  return (
    <motion.div
      className={`p-4 rounded-lg border ${statusStyles}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-mono ${scoreColor}`} style={{ fontFamily: FONTS.mono }}>
              {game.yourTeamScore} - {game.aiTeamScore}
            </span>
            {game.winner && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isWin ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
              }`}>
                {isWin ? "Victory" : "Defeat"}
              </span>
            )}
            {game.status === "in_progress" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/20 text-gold">
                In Progress
              </span>
            )}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {formatDate(game.createdAt)} | {game.difficulty}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gamesRes, statsRes] = await Promise.all([
          fetch("/api/game"),
          fetch("/api/stats"),
        ]);
        if (gamesRes.ok) setGames(await gamesRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load game history");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const winRate = stats && stats.gamesPlayed > 0
    ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`
    : "0%";

  return (
    <PageLayout
      title="GAME HISTORY"
      breadcrumbs={[{ label: "Game History" }]}
      loading={loading}
      error={error}
      maxWidth="4xl"
    >
      {/* Stats Overview */}
      {stats && (
        <Section title="YOUR STATISTICS">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Games Played" value={stats.gamesPlayed} />
            <StatCard label="Win Rate" value={winRate} highlight />
            <StatCard label="High Score" value={stats.highScore} />
            <StatCard label="Best Win Streak" value={stats.bestStreak} />
          </div>
        </Section>
      )}

      {/* Games List */}
      <Section title="RECENT GAMES">
        {games.length === 0 ? (
          <div className="text-center py-8">
            <SuitIcon suit="spades" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-white font-bold mb-4">No games played yet</p>
            <Link href="/">
              <Button variant="primary">Start Your First Game</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game, index) => (
              <GameRecordItem key={game.id} game={game} index={index} />
            ))}
          </div>
        )}
      </Section>
    </PageLayout>
  );
}
