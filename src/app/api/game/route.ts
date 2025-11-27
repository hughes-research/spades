import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, addRateLimitHeaders } from "@/lib/rateLimit";
import {
  isValidDifficulty,
  isValidStatus,
  isValidWinner,
  isInteger,
  validateRequestSize,
} from "@/lib/validation";

// Allowed fields for game updates
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

// Sanitize and validate updates
function sanitizeGameUpdates(updates: Record<string, unknown>): Record<string, unknown> | null {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_UPDATE_FIELDS.has(key)) {
      continue; // Skip disallowed fields
    }

    // Type-specific validation
    switch (key) {
      case "difficulty":
        if (!isValidDifficulty(value)) return null;
        break;
      case "status":
        if (!isValidStatus(value)) return null;
        break;
      case "winner":
        if (!isValidWinner(value)) return null;
        break;
      case "yourTeamScore":
      case "aiTeamScore":
      case "yourTeamBags":
      case "aiTeamBags":
      case "currentRound":
        if (!isInteger(value)) return null;
        break;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

// GET /api/game - List all games
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const response = NextResponse.json(games);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to fetch games", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST /api/game - Create a new game
export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate request size
  const sizeError = validateRequestSize(request.headers.get("content-length"));
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    const { difficulty = "medium" } = body;

    // Validate difficulty
    if (!isValidDifficulty(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty value" },
        { status: 400 }
      );
    }

    const game = await prisma.game.create({
      data: {
        difficulty,
        status: "in_progress",
      },
    });

    const response = NextResponse.json(game);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to create game", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}

// PUT /api/game - Update a game
export async function PUT(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate request size
  const sizeError = validateRequestSize(request.headers.get("content-length"));
  if (sizeError) {
    return NextResponse.json({ error: sizeError }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  try {
    const { id, ...rawUpdates } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Valid Game ID is required" },
        { status: 400 }
      );
    }

    const updates = sanitizeGameUpdates(rawUpdates);
    if (updates === null) {
      return NextResponse.json(
        { error: "Invalid update data" },
        { status: 400 }
      );
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const game = await prisma.game.update({
      where: { id },
      data: updates,
    });

    // If game is completed, update stats
    if (updates.status === "completed" && updates.winner) {
      await updateStats(updates.winner === "you");
    }

    const response = NextResponse.json(game);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to update game", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}

async function updateStats(playerWon: boolean) {
  const stats = await prisma.stats.findUnique({
    where: { id: "global" },
  });

  if (!stats) {
    await prisma.stats.create({
      data: {
        id: "global",
        gamesPlayed: 1,
        gamesWon: playerWon ? 1 : 0,
        gamesLost: playerWon ? 0 : 1,
        winStreak: playerWon ? 1 : 0,
        bestStreak: playerWon ? 1 : 0,
      },
    });
  } else {
    const newWinStreak = playerWon ? stats.winStreak + 1 : 0;
    await prisma.stats.update({
      where: { id: "global" },
      data: {
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: playerWon ? stats.gamesWon + 1 : stats.gamesWon,
        gamesLost: playerWon ? stats.gamesLost : stats.gamesLost + 1,
        winStreak: newWinStreak,
        bestStreak: Math.max(stats.bestStreak, newWinStreak),
      },
    });
  }
}
