import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  validateRequest,
  successResponse,
  errorResponse,
  withErrorHandler,
} from "@/lib/api/utils";
import {
  isValidDifficulty,
  isValidStatus,
  isValidWinner,
  isInteger,
} from "@/lib/validation";

const ALLOWED_UPDATE_FIELDS = new Set([
  "status",
  "difficulty",
  "yourTeamScore",
  "aiTeamScore",
  "yourTeamBags",
  "aiTeamBags",
  "winner",
  "currentRound",
]);

type FieldValidator = (value: unknown) => boolean;

const FIELD_VALIDATORS: Record<string, FieldValidator> = {
  difficulty: isValidDifficulty,
  status: isValidStatus,
  winner: isValidWinner,
  yourTeamScore: isInteger,
  aiTeamScore: isInteger,
  yourTeamBags: isInteger,
  aiTeamBags: isInteger,
  currentRound: isInteger,
};

function sanitizeGameUpdates(updates: Record<string, unknown>): Record<string, unknown> | null {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_UPDATE_FIELDS.has(key)) continue;
    
    const validator = FIELD_VALIDATORS[key];
    if (validator && !validator(value)) return null;
    
    sanitized[key] = value;
  }

  return sanitized;
}

async function updateStats(playerWon: boolean) {
  const stats = await prisma.stats.findUnique({ where: { id: "global" } });

  const baseData = {
    gamesPlayed: 1,
    gamesWon: playerWon ? 1 : 0,
    gamesLost: playerWon ? 0 : 1,
    winStreak: playerWon ? 1 : 0,
    bestStreak: playerWon ? 1 : 0,
  };

  if (!stats) {
    await prisma.stats.create({ data: { id: "global", ...baseData } });
  } else {
    const newWinStreak = playerWon ? stats.winStreak + 1 : 0;
    await prisma.stats.update({
      where: { id: "global" },
      data: {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + (playerWon ? 1 : 0),
        gamesLost: stats.gamesLost + (playerWon ? 0 : 1),
        winStreak: newWinStreak,
        bestStreak: Math.max(stats.bestStreak, newWinStreak),
      },
    });
  }
}

export async function GET(request: NextRequest) {
  const { error } = await validateRequest({ request });
  if (error) return error;

  return withErrorHandler(
    async () => {
      const games = await prisma.game.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return successResponse(games, request);
    },
    "Failed to fetch games"
  );
}

export async function POST(request: NextRequest) {
  const { body, error } = await validateRequest<{ difficulty?: string }>({
    request,
    requireBody: true,
  });
  if (error) return error;

  const difficulty = body?.difficulty ?? "medium";
  if (!isValidDifficulty(difficulty)) {
    return errorResponse("Invalid difficulty value", 400);
  }

  return withErrorHandler(
    async () => {
      const game = await prisma.game.create({
        data: { difficulty, status: "in_progress" },
      });
      return successResponse(game, request);
    },
    "Failed to create game"
  );
}

export async function PUT(request: NextRequest) {
  const { body, error } = await validateRequest<{ id?: string } & Record<string, unknown>>({
    request,
    requireBody: true,
  });
  if (error) return error;

  const { id, ...rawUpdates } = body ?? {};
  
  if (!id || typeof id !== "string") {
    return errorResponse("Valid Game ID is required", 400);
  }

  const updates = sanitizeGameUpdates(rawUpdates);
  if (updates === null) {
    return errorResponse("Invalid update data", 400);
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse("No valid fields to update", 400);
  }

  return withErrorHandler(
    async () => {
      const game = await prisma.game.update({
        where: { id },
        data: updates,
      });

      if (updates.status === "completed" && updates.winner) {
        await updateStats(updates.winner === "you");
      }

      return successResponse(game, request);
    },
    "Failed to update game"
  );
}
