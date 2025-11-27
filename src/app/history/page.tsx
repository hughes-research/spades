"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs, Button } from "@/components/ui";
import { SuitIcon } from "@/components/svg";

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

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setGames(gamesData);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load game history");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="mb-6">
        <Breadcrumbs items={[{ label: "Game History" }]} />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full">
        <motion.h1
          className="text-3xl text-gold font-display text-center mb-8 tracking-wider"
          style={{ fontFamily: "var(--font-cinzel)" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          GAME HISTORY
        </motion.h1>

        {/* Stats Overview */}
        {stats && (
          <motion.div
            className="glass-panel p-6 rounded-xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2
              className="text-lg text-gold font-display mb-4"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              YOUR STATISTICS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Games Played" value={stats.gamesPlayed} />
              <StatCard
                label="Win Rate"
                value={
                  stats.gamesPlayed > 0
                    ? `${Math.round((stats.gamesWon / stats.gamesPlayed) * 100)}%`
                    : "0%"
                }
                highlight
              />
              <StatCard label="High Score" value={stats.highScore} />
              <StatCard label="Best Win Streak" value={stats.bestStreak} />
            </div>
          </motion.div>
        )}

        {/* Games List */}
        <motion.div
          className="glass-panel p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-lg text-gold font-display mb-4"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            RECENT GAMES
          </h2>

          {loading ? (
            <div className="text-center py-8 text-text-muted">
              Loading games...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-danger">{error}</div>
          ) : games.length === 0 ? (
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
                <motion.div
                  key={game.id}
                  className={`
                    p-4 rounded-lg border
                    ${
                      game.winner === "you"
                        ? "bg-success/10 border-success/30"
                        : game.winner === "ai"
                        ? "bg-danger/10 border-danger/30"
                        : "bg-midnight/40 border-text-muted/20"
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-mono ${
                            game.winner === "you"
                              ? "text-success"
                              : game.winner === "ai"
                              ? "text-danger"
                              : "text-text-primary"
                          }`}
                          style={{ fontFamily: "var(--font-fira-code)" }}
                        >
                          {game.yourTeamScore} - {game.aiTeamScore}
                        </span>
                        {game.winner && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              game.winner === "you"
                                ? "bg-success/20 text-success"
                                : "bg-danger/20 text-danger"
                            }`}
                          >
                            {game.winner === "you" ? "Victory" : "Defeat"}
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
              ))}
            </div>
          )}
        </motion.div>

        {/* Back button */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/">
            <Button variant="ghost">Back to Menu</Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl font-mono ${highlight ? "text-gold" : "text-text-primary"}`}
        style={{ fontFamily: "var(--font-fira-code)" }}
      >
        {value}
      </div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}


