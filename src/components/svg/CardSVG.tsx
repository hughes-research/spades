"use client";

import { memo } from "react";
import { Suit, suitPaths, suitColors } from "./SuitIcon";

export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

interface CardSVGProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const CARD_RADIUS = 8;

// Shared filter definitions
const CardFilters = memo(function CardFilters() {
  return (
    <defs>
      {/* Card drop shadow */}
      <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.4" />
      </filter>
      
      {/* Inner shadow for depth */}
      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="2" />
        <feOffset dx="1" dy="2" result="offsetblur" />
        <feFlood floodColor="#000000" floodOpacity="0.15" result="color" />
        <feComposite in2="offsetblur" operator="in" />
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
      
      {/* Glossy highlight */}
      <linearGradient id="cardGloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
        <stop offset="20%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      
      {/* Card back gradient */}
      <linearGradient id="cardBackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="30%" stopColor="#2563eb" />
        <stop offset="70%" stopColor="#1d4ed8" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      
      {/* Card face gradient - subtle cream tint */}
      <linearGradient id="cardFaceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#fefefe" />
        <stop offset="100%" stopColor="#f8f8f6" />
      </linearGradient>
      
      {/* Pattern for card back */}
      <pattern id="cardBackPattern" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
        <rect width="6" height="12" fill="#1e40af" opacity="0.25"/>
      </pattern>
    </defs>
  );
});

// Card back with classic blue design
const CardBack = memo(function CardBack() {
  return (
    <g filter="url(#cardShadow)">
      {/* Card base */}
      <rect
        x="1"
        y="1"
        width={CARD_WIDTH - 2}
        height={CARD_HEIGHT - 2}
        rx={CARD_RADIUS}
        fill="url(#cardBackGradient)"
        stroke="#1e3a8a"
        strokeWidth="1.5"
      />
      
      {/* Pattern overlay */}
      <rect
        x="6"
        y="6"
        width={CARD_WIDTH - 12}
        height={CARD_HEIGHT - 12}
        rx={CARD_RADIUS - 2}
        fill="url(#cardBackPattern)"
      />
      
      {/* Inner decorative border */}
      <rect
        x="8"
        y="8"
        width={CARD_WIDTH - 16}
        height={CARD_HEIGHT - 16}
        rx={CARD_RADIUS - 3}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.35"
      />
      
      {/* Center emblem area */}
      <rect
        x="25"
        y="40"
        width="50"
        height="60"
        rx="6"
        fill="#1e40af"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Center diamond decoration */}
      <path
        d="M50 50 L60 70 L50 90 L40 70 Z"
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.8"
      />
      
      {/* Gloss effect */}
      <rect
        x="1"
        y="1"
        width={CARD_WIDTH - 2}
        height={CARD_HEIGHT / 3}
        rx={CARD_RADIUS}
        fill="url(#cardGloss)"
      />
    </g>
  );
});

// Pip positions for each rank
const pipPositions: Record<Rank, Array<{ x: number; y: number; flip?: boolean }>> = {
  A: [{ x: 0.5, y: 0.5 }],
  "2": [
    { x: 0.5, y: 0.2 },
    { x: 0.5, y: 0.8, flip: true },
  ],
  "3": [
    { x: 0.5, y: 0.2 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.8, flip: true },
  ],
  "4": [
    { x: 0.3, y: 0.2 },
    { x: 0.7, y: 0.2 },
    { x: 0.3, y: 0.8, flip: true },
    { x: 0.7, y: 0.8, flip: true },
  ],
  "5": [
    { x: 0.3, y: 0.2 },
    { x: 0.7, y: 0.2 },
    { x: 0.5, y: 0.5 },
    { x: 0.3, y: 0.8, flip: true },
    { x: 0.7, y: 0.8, flip: true },
  ],
  "6": [
    { x: 0.3, y: 0.2 },
    { x: 0.7, y: 0.2 },
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
    { x: 0.3, y: 0.8, flip: true },
    { x: 0.7, y: 0.8, flip: true },
  ],
  "7": [
    { x: 0.3, y: 0.2 },
    { x: 0.7, y: 0.2 },
    { x: 0.5, y: 0.35 },
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
    { x: 0.3, y: 0.8, flip: true },
    { x: 0.7, y: 0.8, flip: true },
  ],
  "8": [
    { x: 0.3, y: 0.2 },
    { x: 0.7, y: 0.2 },
    { x: 0.5, y: 0.35 },
    { x: 0.3, y: 0.5 },
    { x: 0.7, y: 0.5 },
    { x: 0.5, y: 0.65, flip: true },
    { x: 0.3, y: 0.8, flip: true },
    { x: 0.7, y: 0.8, flip: true },
  ],
  "9": [
    { x: 0.3, y: 0.18 },
    { x: 0.7, y: 0.18 },
    { x: 0.3, y: 0.38 },
    { x: 0.7, y: 0.38 },
    { x: 0.5, y: 0.5 },
    { x: 0.3, y: 0.62, flip: true },
    { x: 0.7, y: 0.62, flip: true },
    { x: 0.3, y: 0.82, flip: true },
    { x: 0.7, y: 0.82, flip: true },
  ],
  "10": [
    { x: 0.3, y: 0.18 },
    { x: 0.7, y: 0.18 },
    { x: 0.5, y: 0.28 },
    { x: 0.3, y: 0.38 },
    { x: 0.7, y: 0.38 },
    { x: 0.3, y: 0.62, flip: true },
    { x: 0.7, y: 0.62, flip: true },
    { x: 0.5, y: 0.72, flip: true },
    { x: 0.3, y: 0.82, flip: true },
    { x: 0.7, y: 0.82, flip: true },
  ],
  J: [],
  Q: [],
  K: [],
};

// Face card center design
const FaceCardCenter = memo(function FaceCardCenter({
  rank,
  suit,
  color,
}: {
  rank: "J" | "Q" | "K";
  suit: Suit;
  color: string;
}) {
  const labels: Record<string, string> = {
    J: "JACK",
    Q: "QUEEN", 
    K: "KING",
  };
  
  return (
    <g>
      {/* Decorative frame */}
      <rect
        x="20"
        y="38"
        width={CARD_WIDTH - 40}
        height={CARD_HEIGHT - 76}
        rx="4"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Inner frame */}
      <rect
        x="24"
        y="42"
        width={CARD_WIDTH - 48}
        height={CARD_HEIGHT - 84}
        rx="2"
        fill={color}
        opacity="0.05"
      />
      
      {/* Large rank letter */}
      <text
        x={CARD_WIDTH / 2}
        y={CARD_HEIGHT / 2 + 8}
        textAnchor="middle"
        fontSize="52"
        fontWeight="900"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill={color}
      >
        {rank}
      </text>
      
      {/* Decorative suit symbols */}
      <g transform={`translate(28, ${CARD_HEIGHT / 2 - 8}) scale(0.6)`}>
        <path d={suitPaths[suit]} fill={color} opacity="0.7" />
      </g>
      <g transform={`translate(56, ${CARD_HEIGHT / 2 - 8}) scale(0.6)`}>
        <path d={suitPaths[suit]} fill={color} opacity="0.7" />
      </g>
    </g>
  );
});

// Card face component
const CardFace = memo(function CardFace({
  suit,
  rank,
}: {
  suit: Suit;
  rank: Rank;
}) {
  const color = suitColors[suit];
  const isFaceCard = rank === "J" || rank === "Q" || rank === "K";
  
  const pipScale = rank === "A" ? 2.5 : 0.65;
  const pipAreaX = 20;
  const pipAreaY = 40;
  const pipAreaWidth = CARD_WIDTH - 40;
  const pipAreaHeight = CARD_HEIGHT - 80;

  return (
    <g filter="url(#cardShadow)">
      {/* Card base with subtle gradient */}
      <rect
        x="1"
        y="1"
        width={CARD_WIDTH - 2}
        height={CARD_HEIGHT - 2}
        rx={CARD_RADIUS}
        fill="url(#cardFaceGradient)"
        stroke="#cccccc"
        strokeWidth="1"
      />
      
      {/* Inner edge shadow effect */}
      <rect
        x="2"
        y="2"
        width={CARD_WIDTH - 4}
        height={CARD_HEIGHT - 4}
        rx={CARD_RADIUS - 1}
        fill="none"
        stroke="#e8e8e8"
        strokeWidth="1"
      />

      {/* Top-left corner rank */}
      <text
        x="8"
        y="22"
        fontSize="20"
        fontWeight="bold"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill={color}
        style={{ letterSpacing: "-1px" }}
      >
        {rank}
      </text>
      <g transform="translate(7, 24) scale(0.5)">
        <path d={suitPaths[suit]} fill={color} />
      </g>

      {/* Bottom-right corner (rotated) */}
      <g transform={`translate(${CARD_WIDTH}, ${CARD_HEIGHT}) rotate(180)`}>
        <text
          x="8"
          y="22"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill={color}
          style={{ letterSpacing: "-1px" }}
        >
          {rank}
        </text>
        <g transform="translate(7, 24) scale(0.5)">
          <path d={suitPaths[suit]} fill={color} />
        </g>
      </g>

      {/* Center content */}
      {isFaceCard ? (
        <FaceCardCenter rank={rank as "J" | "Q" | "K"} suit={suit} color={color} />
      ) : (
        pipPositions[rank].map((pos, idx) => (
          <g
            key={idx}
            transform={`translate(${pipAreaX + pos.x * pipAreaWidth - 8 * pipScale}, ${
              pipAreaY + pos.y * pipAreaHeight - 8 * pipScale
            }) scale(${pipScale}) ${pos.flip ? "rotate(180, 10, 10)" : ""}`}
          >
            <path d={suitPaths[suit]} fill={color} />
          </g>
        ))
      )}
      
      {/* Glossy highlight overlay */}
      <rect
        x="1"
        y="1"
        width={CARD_WIDTH - 2}
        height={CARD_HEIGHT / 4}
        rx={CARD_RADIUS}
        fill="url(#cardGloss)"
        opacity="0.5"
      />
    </g>
  );
});

export const CardSVG = memo(function CardSVG({
  suit,
  rank,
  faceDown = false,
  className = "",
  width,
  height,
}: CardSVGProps) {
  const aspectRatio = CARD_WIDTH / CARD_HEIGHT;
  const computedWidth = width || (height ? height * aspectRatio : CARD_WIDTH);
  const computedHeight = height || (width ? width / aspectRatio : CARD_HEIGHT);

  return (
    <svg
      viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
      width={computedWidth}
      height={computedHeight}
      className={className}
      aria-label={faceDown ? "Card face down" : `${rank} of ${suit}`}
      style={{ overflow: "visible" }}
    >
      <CardFilters />
      {faceDown ? <CardBack /> : <CardFace suit={suit} rank={rank} />}
    </svg>
  );
});

export default CardSVG;
