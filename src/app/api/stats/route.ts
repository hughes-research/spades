import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, addRateLimitHeaders } from "@/lib/rateLimit";
import { isNonNegativeInteger, validateRequestSize } from "@/lib/validation";

// GET /api/stats - Get player statistics
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    let stats = await prisma.stats.findUnique({
      where: { id: "global" },
    });

    // Create default stats if none exist
    if (!stats) {
      stats = await prisma.stats.create({
        data: {
          id: "global",
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalRounds: 0,
          highScore: 0,
          winStreak: 0,
          bestStreak: 0,
        },
      });
    }

    const response = NextResponse.json(stats);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to fetch stats", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// POST /api/stats - Update statistics
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
    const { roundsPlayed, highScore, won } = body;

    // Validate inputs
    if (roundsPlayed !== undefined && !isNonNegativeInteger(roundsPlayed)) {
      return NextResponse.json(
        { error: "Invalid roundsPlayed value" },
        { status: 400 }
      );
    }

    if (highScore !== undefined && !isNonNegativeInteger(highScore)) {
      return NextResponse.json(
        { error: "Invalid highScore value" },
        { status: 400 }
      );
    }

    if (won !== undefined && typeof won !== "boolean") {
      return NextResponse.json(
        { error: "Invalid won value" },
        { status: 400 }
      );
    }

    let stats = await prisma.stats.findUnique({
      where: { id: "global" },
    });

    // Auto-create stats if they don't exist (consistent behavior)
    if (!stats) {
      stats = await prisma.stats.create({
        data: {
          id: "global",
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalRounds: 0,
          highScore: 0,
          winStreak: 0,
          bestStreak: 0,
        },
      });
    }

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

    const response = NextResponse.json(updatedStats);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to update stats", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to update stats" },
      { status: 500 }
    );
  }
}
