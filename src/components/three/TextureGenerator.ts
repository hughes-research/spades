import * as THREE from "three";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

// Texture dimensions (matches 2.5:3.5 ratio)
const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 716;

// Colors
const SUIT_COLORS: Record<Suit, string> = {
  spades: "#1a1a1a",
  clubs: "#1a1a1a",
  hearts: "#d32f2f",
  diamonds: "#d32f2f",
};

// Suit symbol paths (scaled for canvas drawing)
const SUIT_PATHS: Record<Suit, Path2D> = {
  spades: new Path2D("M12 1C12 1 4 8 4 13C4 16.3 6.7 19 10 19C10.8 19 11.5 18.7 12 18.3C12.5 18.7 13.2 19 14 19C17.3 19 20 16.3 20 13C20 8 12 1 12 1ZM10 19.5L10 22C10 22.5 10.5 23 11 23H13C13.5 23 14 22.5 14 22V19.5H10Z"),
  hearts: new Path2D("M12 21L11.3 20.4C6.4 16 3 12.8 3 8.9C3 5.8 5.4 3.5 8.5 3.5C10.2 3.5 11.8 4.2 12 5.5C12.2 4.2 13.8 3.5 15.5 3.5C18.6 3.5 21 5.8 21 8.9C21 12.8 17.6 16 12.7 20.4L12 21Z"),
  diamonds: new Path2D("M12 1L22 12L12 23L2 12L12 1Z"),
  clubs: new Path2D("M12 2C9.8 2 8 3.8 8 6C8 7.5 8.8 8.8 10 9.5C7.5 9.7 5 11.7 5 14.5C5 17 7 19 9.5 19C10.6 19 11.6 18.5 12 17.8C12.4 18.5 13.4 19 14.5 19C17 19 19 17 19 14.5C19 11.7 16.5 9.7 14 9.5C15.2 8.8 16 7.5 16 6C16 3.8 14.2 2 12 2ZM10 19.5V22C10 22.5 10.5 23 11 23H13C13.5 23 14 22.5 14 22V19.5H10Z"),
};

// Pip positions for number cards (normalized 0-1)
const PIP_POSITIONS: Record<Rank, Array<{ x: number; y: number; flip?: boolean }>> = {
  A: [{ x: 0.5, y: 0.5 }],
  "2": [{ x: 0.5, y: 0.22 }, { x: 0.5, y: 0.78, flip: true }],
  "3": [{ x: 0.5, y: 0.22 }, { x: 0.5, y: 0.5 }, { x: 0.5, y: 0.78, flip: true }],
  "4": [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, { x: 0.3, y: 0.78, flip: true }, { x: 0.7, y: 0.78, flip: true }],
  "5": [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.78, flip: true }, { x: 0.7, y: 0.78, flip: true }],
  "6": [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 0.78, flip: true }, { x: 0.7, y: 0.78, flip: true }],
  "7": [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, { x: 0.5, y: 0.36 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 0.78, flip: true }, { x: 0.7, y: 0.78, flip: true }],
  "8": [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, { x: 0.5, y: 0.36 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.5, y: 0.64, flip: true }, { x: 0.3, y: 0.78, flip: true }, { x: 0.7, y: 0.78, flip: true }],
  "9": [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.3, y: 0.38 }, { x: 0.7, y: 0.38 }, { x: 0.5, y: 0.5 }, { x: 0.3, y: 0.62, flip: true }, { x: 0.7, y: 0.62, flip: true }, { x: 0.3, y: 0.8, flip: true }, { x: 0.7, y: 0.8, flip: true }],
  "10": [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.5, y: 0.3 }, { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.4 }, { x: 0.3, y: 0.6, flip: true }, { x: 0.7, y: 0.6, flip: true }, { x: 0.5, y: 0.7, flip: true }, { x: 0.3, y: 0.8, flip: true }, { x: 0.7, y: 0.8, flip: true }],
  J: [],
  Q: [],
  K: [],
};

// Cache for generated textures
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Draw a suit symbol at the given position
 */
function drawSuit(
  ctx: CanvasRenderingContext2D,
  suit: Suit,
  x: number,
  y: number,
  size: number,
  flip: boolean = false
) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) {
    ctx.rotate(Math.PI);
  }
  ctx.scale(size / 24, size / 24);
  ctx.translate(-12, -12);
  ctx.fillStyle = SUIT_COLORS[suit];
  ctx.fill(SUIT_PATHS[suit]);
  ctx.restore();
}

/**
 * Generate a card face texture
 */
function generateCardFace(suit: Suit, rank: Rank): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Card background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.5, "#fefefe");
  gradient.addColorStop(1, "#f8f6f4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // Border
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, TEXTURE_WIDTH - 16, TEXTURE_HEIGHT - 16);

  const color = SUIT_COLORS[suit];
  ctx.fillStyle = color;

  // Top-left rank
  ctx.font = "bold 72px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(rank, 50, 80);
  
  // Top-left suit
  drawSuit(ctx, suit, 50, 130, 40);

  // Bottom-right rank (rotated)
  ctx.save();
  ctx.translate(TEXTURE_WIDTH - 50, TEXTURE_HEIGHT - 50);
  ctx.rotate(Math.PI);
  ctx.fillStyle = color;
  ctx.font = "bold 72px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(rank, 0, 30);
  ctx.restore();
  
  // Bottom-right suit (rotated)
  drawSuit(ctx, suit, TEXTURE_WIDTH - 50, TEXTURE_HEIGHT - 130, 40, true);

  // Center content
  const isFaceCard = rank === "J" || rank === "Q" || rank === "K";
  const isAce = rank === "A";

  if (isFaceCard) {
    // Face card: large letter in center with decorative frame
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(100, 180, TEXTURE_WIDTH - 200, TEXTURE_HEIGHT - 360);
    
    ctx.fillStyle = color;
    ctx.font = "bold 180px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rank, TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2);
    
    // Decorative suits on sides
    drawSuit(ctx, suit, 130, TEXTURE_HEIGHT / 2, 50);
    drawSuit(ctx, suit, TEXTURE_WIDTH - 130, TEXTURE_HEIGHT / 2, 50);
  } else if (isAce) {
    // Ace: large suit in center
    drawSuit(ctx, suit, TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2, 180);
  } else {
    // Number card: pips in standard positions
    const pipSize = rank === "10" ? 55 : 60;
    const positions = PIP_POSITIONS[rank];
    const pipAreaTop = 160;
    const pipAreaHeight = TEXTURE_HEIGHT - 320;
    
    for (const pos of positions) {
      const x = pos.x * TEXTURE_WIDTH;
      const y = pipAreaTop + pos.y * pipAreaHeight;
      drawSuit(ctx, suit, x, y, pipSize, pos.flip);
    }
  }

  return canvas;
}

/**
 * Generate the card back texture
 */
function generateCardBack(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // Blue gradient background
  const gradient = ctx.createLinearGradient(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
  gradient.addColorStop(0, "#3b82f6");
  gradient.addColorStop(0.3, "#2563eb");
  gradient.addColorStop(0.7, "#1d4ed8");
  gradient.addColorStop(1, "#1e40af");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

  // Diamond pattern overlay
  ctx.fillStyle = "rgba(30, 64, 175, 0.3)";
  const patternSize = 40;
  for (let y = 0; y < TEXTURE_HEIGHT; y += patternSize) {
    for (let x = 0; x < TEXTURE_WIDTH; x += patternSize) {
      ctx.beginPath();
      ctx.moveTo(x + patternSize / 2, y);
      ctx.lineTo(x + patternSize, y + patternSize / 2);
      ctx.lineTo(x + patternSize / 2, y + patternSize);
      ctx.lineTo(x, y + patternSize / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  // White inner border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, TEXTURE_WIDTH - 60, TEXTURE_HEIGHT - 60);

  // Inner decorative border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, TEXTURE_WIDTH - 100, TEXTURE_HEIGHT - 100);

  // Center emblem area
  ctx.fillStyle = "rgba(30, 64, 175, 0.6)";
  const emblemWidth = 200;
  const emblemHeight = 280;
  ctx.fillRect(
    (TEXTURE_WIDTH - emblemWidth) / 2,
    (TEXTURE_HEIGHT - emblemHeight) / 2,
    emblemWidth,
    emblemHeight
  );

  // Center diamond
  ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
  ctx.beginPath();
  ctx.moveTo(TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2 - 80);
  ctx.lineTo(TEXTURE_WIDTH / 2 + 50, TEXTURE_HEIGHT / 2);
  ctx.lineTo(TEXTURE_WIDTH / 2, TEXTURE_HEIGHT / 2 + 80);
  ctx.lineTo(TEXTURE_WIDTH / 2 - 50, TEXTURE_HEIGHT / 2);
  ctx.closePath();
  ctx.fill();

  // Diamond border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 3;
  ctx.stroke();

  return canvas;
}

/**
 * Generate a simple normal map for paper texture
 */
function generateNormalMap(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  // Base normal (pointing up: RGB = 128, 128, 255)
  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, 256, 256);

  // Add subtle noise for paper texture
  const imageData = ctx.getImageData(0, 0, 256, 256);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    data[i] = Math.min(255, Math.max(0, 128 + noise));     // R
    data[i + 1] = Math.min(255, Math.max(0, 128 + noise)); // G
    // B stays at 255 (pointing up)
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Get or create a texture for a card face
 */
export function getCardFaceTexture(suit: Suit, rank: Rank): THREE.CanvasTexture | null {
  // Only works in browser environment
  if (typeof document === "undefined") {
    return null;
  }
  
  const key = `${suit}-${rank}`;
  
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  
  const canvas = generateCardFace(suit, rank);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  
  textureCache.set(key, texture);
  return texture;
}

/**
 * Get or create the card back texture
 */
export function getCardBackTexture(): THREE.CanvasTexture | null {
  // Only works in browser environment
  if (typeof document === "undefined") {
    return null;
  }
  
  const key = "card-back";
  
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  
  const canvas = generateCardBack();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  
  textureCache.set(key, texture);
  return texture;
}

/**
 * Get or create the normal map texture
 */
export function getNormalMapTexture(): THREE.CanvasTexture | null {
  // Only works in browser environment
  if (typeof document === "undefined") {
    return null;
  }
  
  const key = "normal-map";
  
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }
  
  const canvas = generateNormalMap();
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  
  textureCache.set(key, texture);
  return texture;
}

/**
 * Pre-generate all textures (call on app init for smoother experience)
 */
export function preloadAllTextures(): void {
  const suits: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      getCardFaceTexture(suit, rank);
    }
  }
  
  getCardBackTexture();
  getNormalMapTexture();
}

/**
 * Clear texture cache (for cleanup)
 */
export function clearTextureCache(): void {
  for (const texture of textureCache.values()) {
    texture.dispose();
  }
  textureCache.clear();
}

