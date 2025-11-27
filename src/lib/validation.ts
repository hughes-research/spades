/**
 * Shared validation utilities for input sanitization across the application.
 * Follows DRY principles by centralizing validation logic.
 */

import { Difficulty } from "./game/types";

// Valid difficulty levels
export const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

// Valid game statuses
export const VALID_GAME_STATUSES = ["in_progress", "completed"] as const;

// Valid winners
export const VALID_WINNERS = ["you", "ai"] as const;

// Valid animation speeds
export const VALID_ANIMATION_SPEEDS = ["slow", "normal", "fast"] as const;

/**
 * Type guard to check if a value is a valid difficulty.
 */
export function isValidDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && VALID_DIFFICULTIES.includes(value as Difficulty);
}

/**
 * Type guard to check if a value is a valid game status.
 */
export function isValidStatus(value: unknown): value is string {
  return typeof value === "string" && VALID_GAME_STATUSES.includes(value as typeof VALID_GAME_STATUSES[number]);
}

/**
 * Type guard to check if a value is a valid winner.
 */
export function isValidWinner(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && VALID_WINNERS.includes(value as typeof VALID_WINNERS[number]));
}

/**
 * Type guard to check if a value is a valid animation speed.
 */
export function isValidAnimationSpeed(value: unknown): value is string {
  return typeof value === "string" && VALID_ANIMATION_SPEEDS.includes(value as typeof VALID_ANIMATION_SPEEDS[number]);
}

/**
 * Type guard to check if a value is a non-negative integer.
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Type guard to check if a value is a valid integer (can be negative).
 */
export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/**
 * Validates that a string is not empty and within max length.
 */
export function isValidString(value: unknown, maxLength: number = 255): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

/**
 * Maximum allowed request body size in bytes (1MB).
 */
export const MAX_REQUEST_BODY_SIZE = 1024 * 1024;

/**
 * Maximum allowed JSON depth to prevent deeply nested attacks.
 */
export const MAX_JSON_DEPTH = 10;

/**
 * Validates that a request body is within acceptable size limits.
 * Returns null if valid, error message if invalid.
 */
export function validateRequestSize(contentLength: string | null): string | null {
  if (!contentLength) {
    return null; // Allow requests without Content-Length (will be validated when parsed)
  }
  
  const size = parseInt(contentLength, 10);
  if (isNaN(size)) {
    return "Invalid Content-Length header";
  }
  
  if (size > MAX_REQUEST_BODY_SIZE) {
    return `Request body too large. Maximum size is ${MAX_REQUEST_BODY_SIZE} bytes`;
  }
  
  return null;
}

