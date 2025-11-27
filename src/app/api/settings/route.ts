import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { rateLimit, addRateLimitHeaders } from "@/lib/rateLimit";
import {
  isValidDifficulty,
  isValidAnimationSpeed,
  validateRequestSize,
} from "@/lib/validation";

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "global" },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "global",
          difficulty: "medium",
          animationSpeed: "normal",
          showTutorial: true,
        },
      });
    }

    const response = NextResponse.json(settings);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to fetch settings", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/settings - Update settings
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
    const { difficulty, animationSpeed, showTutorial } = body;

    // Validate inputs
    if (difficulty !== undefined && !isValidDifficulty(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty value" },
        { status: 400 }
      );
    }

    if (animationSpeed !== undefined && !isValidAnimationSpeed(animationSpeed)) {
      return NextResponse.json(
        { error: "Invalid animation speed value" },
        { status: 400 }
      );
    }

    if (showTutorial !== undefined && typeof showTutorial !== "boolean") {
      return NextResponse.json(
        { error: "Invalid showTutorial value" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.upsert({
      where: { id: "global" },
      update: {
        ...(difficulty && { difficulty }),
        ...(animationSpeed && { animationSpeed }),
        ...(showTutorial !== undefined && { showTutorial }),
      },
      create: {
        id: "global",
        difficulty: difficulty || "medium",
        animationSpeed: animationSpeed || "normal",
        showTutorial: showTutorial ?? true,
      },
    });

    const response = NextResponse.json(settings);
    return addRateLimitHeaders(response, request);
  } catch (error) {
    logger.error("Failed to update settings", { error: String(error) });
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
