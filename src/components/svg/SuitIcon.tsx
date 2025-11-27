"use client";

import { memo } from "react";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

interface SuitIconProps {
  suit: Suit;
  className?: string;
  size?: number;
}

// Refined suit paths for crisp rendering
const suitPaths: Record<Suit, string> = {
  // Spade with stem
  spades: "M12 1C12 1 4 8 4 13C4 16.3 6.7 19 10 19C10.8 19 11.5 18.7 12 18.3C12.5 18.7 13.2 19 14 19C17.3 19 20 16.3 20 13C20 8 12 1 12 1ZM10 19.5L10 22C10 22.5 10.5 23 11 23H13C13.5 23 14 22.5 14 22V19.5H10Z",
  // Heart shape
  hearts: "M12 21L11.3 20.4C6.4 16 3 12.8 3 8.9C3 5.8 5.4 3.5 8.5 3.5C10.2 3.5 11.8 4.2 12 5.5C12.2 4.2 13.8 3.5 15.5 3.5C18.6 3.5 21 5.8 21 8.9C21 12.8 17.6 16 12.7 20.4L12 21Z",
  // Diamond with beveled edges
  diamonds: "M12 1L22 12L12 23L2 12L12 1ZM12 4L5 12L12 20L19 12L12 4Z M12 4L5 12L12 20L19 12L12 4Z",
  // Club with three lobes and stem
  clubs: "M12 2C9.8 2 8 3.8 8 6C8 7.5 8.8 8.8 10 9.5C7.5 9.7 5 11.7 5 14.5C5 17 7 19 9.5 19C10.6 19 11.6 18.5 12 17.8C12.4 18.5 13.4 19 14.5 19C17 19 19 17 19 14.5C19 11.7 16.5 9.7 14 9.5C15.2 8.8 16 7.5 16 6C16 3.8 14.2 2 12 2ZM10 19.5V22C10 22.5 10.5 23 11 23H13C13.5 23 14 22.5 14 22V19.5H10Z",
};

// Rich, traditional card colors
const suitColors: Record<Suit, string> = {
  spades: "#1a1a1a",    // Deep black
  hearts: "#d32f2f",    // Rich red
  diamonds: "#d32f2f",  // Rich red
  clubs: "#1a1a1a",     // Deep black
};

export const SuitIcon = memo(function SuitIcon({
  suit,
  className = "",
  size = 24,
}: SuitIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={suitColors[suit]}
      aria-label={suit}
    >
      <path d={suitPaths[suit]} />
    </svg>
  );
});

export { suitPaths, suitColors };

