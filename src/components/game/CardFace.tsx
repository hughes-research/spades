"use client";

import { memo } from "react";
import Image from "next/image";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface CardFaceProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

// Map our rank names to the file name format
const rankFileMap: Record<Rank, string> = {
  A: "ace",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  J: "jack",
  Q: "queen",
  K: "king",
};

/**
 * Card face component using SVG playing cards from /public/imgs/
 * Files are named like: ace_of_spades.svg, 2_of_hearts.svg, etc.
 */
export const CardFace = memo(function CardFace({
  suit,
  rank,
  faceDown = false,
  width = 100,
  height: _height = 145,
  className = "",
}: CardFaceProps) {
  // Generate the file path for the card image
  const imagePath = faceDown 
    ? "/imgs/back.svg"
    : `/imgs/${rankFileMap[rank]}_of_${suit}.svg`;

  const altText = faceDown 
    ? "Card face down" 
    : `${rank} of ${suit}`;

  return (
    <div 
      className={`relative ${className}`}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <Image
        src={imagePath}
        alt={altText}
        fill
        sizes={`${width}px`}
        style={{ 
          objectFit: "contain",
        }}
        priority={rank === "A" && suit === "spades"}
        draggable={false}
      />
    </div>
  );
});

export default CardFace;
