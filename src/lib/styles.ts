/**
 * Shared style constants for consistent theming across the application.
 * Centralizes font families, colors, and common style patterns.
 */

export const FONTS = {
  display: "var(--font-cinzel)",
  mono: "var(--font-fira-code)",
} as const;

export const COLORS = {
  gold: "#ffd700",
  white: "#ffffff",
  muted: "#cccccc",
  danger: "#ef4444",
  success: "#22c55e",
  midnight: "#0a0a0a",
} as const;

/**
 * Common animation variants for Framer Motion.
 */
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
} as const;

/**
 * Standard delay for staggered animations.
 */
export const STAGGER_DELAY = 0.1;

