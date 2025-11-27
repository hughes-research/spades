import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateRequest,
  successResponse,
  errorResponse,
  withErrorHandler,
} from "@/lib/api/utils";
import { isNonNegativeInteger } from "@/lib/validation";

const DEFAULT_STATS = {
  id: "global",
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  totalRounds: 0,
  highScore: 0,
  winStreak: 0,
  bestStreak: 0,
} as const;

interface StatsBody {
  roundsPlayed?: number;
  highScore?: number;
  won?: boolean;
}

function validateStatsBody(body: StatsBody): string | null {
  const { roundsPlayed, highScore, won } = body;

  if (roundsPlayed !== undefined && !isNonNegativeInteger(roundsPlayed)) {
    return "Invalid roundsPlayed value";
  }
  if (highScore !== undefined && !isNonNegativeInteger(highScore)) {
    return "Invalid highScore value";
  }
  if (won !== undefined && typeof won !== "boolean") {
    return "Invalid won value";
  }

  return null;
}

async function getOrCreateStats() {
  let stats = await prisma.stats.findUnique({ where: { id: "global" } });
  
  if (!stats) {
    stats = await prisma.stats.create({ data: DEFAULT_STATS });
  }
  
  return stats;
}

export async function GET(request: NextRequest) {
  const { error } = await validateRequest({ request });
  if (error) return error;

  return withErrorHandler(
    async () => {
      const stats = await getOrCreateStats();
      return successResponse(stats, request);
    },
    "Failed to fetch stats"
  );
}

export async function POST(request: NextRequest) {
  const { body, error } = await validateRequest<StatsBody>({
    request,
    requireBody: true,
  });
  if (error) return error;

  const validationError = validateStatsBody(body ?? {});
  if (validationError) {
    return errorResponse(validationError, 400);
  }

  const { roundsPlayed, highScore, won } = body ?? {};

  return withErrorHandler(
    async () => {
      const stats = await getOrCreateStats();
      const updates: Record<string, number> = {};

      if (roundsPlayed) {
        updates.totalRounds = stats.totalRounds + roundsPlayed;
      }

      if (highScore && highScore > stats.highScore) {
        updates.highScore = highScore;
      }

      if (won !== undefined) {
        updates.gamesPlayed = stats.gamesPlayed + 1;
        if (won) {
          updates.gamesWon = stats.gamesWon + 1;
          updates.winStreak = stats.winStreak + 1;
          updates.bestStreak = Math.max(stats.bestStreak, stats.winStreak + 1);
        } else {
          updates.gamesLost = stats.gamesLost + 1;
          updates.winStreak = 0;
        }
      }

      const updatedStats = await prisma.stats.update({
        where: { id: "global" },
        data: updates,
      });

      return successResponse(updatedStats, request);
    },
    "Failed to update stats"
  );
}
