/**
 * @fileoverview Game constants and configuration values.
 * 
 * Centralizes all magic numbers, delays, and configuration values
 * used throughout the game engine to improve maintainability.
 * 
 * @module lib/game/constants
 */

/**
 * Game configuration constants.
 */
export const GAME_CONSTANTS = {
  /** Number of cards in a standard deck */
  DECK_SIZE: 52,
  /** Number of players in a game */
  PLAYER_COUNT: 4,
  /** Number of cards per player */
  CARDS_PER_PLAYER: 13,
  /** Number of tricks per round */
  TRICKS_PER_ROUND: 13,
  /** Number of cards per trick */
  CARDS_PER_TRICK: 4,
} as const;

/**
 * Animation and timing delays in milliseconds.
 */
export const ANIMATION_DELAYS = {
  /** Delay before dealing cards after game start */
  DEAL_DELAY: 100,
  /** Delay before processing AI turn */
  AI_TURN_DELAY: 500,
  /** Delay before finishing trick after last card played */
  TRICK_COMPLETE_DELAY: 1000,
  /** Delay before finishing round after round end */
  ROUND_END_DELAY: 1500,
  /** Delay before starting next round */
  NEXT_ROUND_DELAY: 500,
  /** Delay before auto-continuing after round end */
  AUTO_CONTINUE_DELAY: 3000,
  /** Delay for hint display */
  HINT_DISPLAY_DELAY: 3000,
  /** Delay for hint bid display */
  HINT_BID_DISPLAY_DELAY: 5000,
  /** Delay for saved message */
  SAVED_MESSAGE_DELAY: 2000,
} as const;

/**
 * Bid-related constants.
 */
export const BID_CONSTANTS = {
  /** Minimum valid bid */
  MIN_BID: 1,
  /** Maximum valid bid */
  MAX_BID: 13,
  /** Nil bid value */
  NIL_BID: 0,
  /** Blind nil bid value */
  BLIND_NIL_BID: -1,
  /** Team total threshold for medium AI adjustment */
  MEDIUM_AI_TEAM_TOTAL_THRESHOLD: 11,
  /** Team total threshold for hard AI adjustment (high) */
  HARD_AI_TEAM_TOTAL_HIGH: 12,
  /** Team total threshold for hard AI adjustment (low) */
  HARD_AI_TEAM_TOTAL_LOW: 6,
  /** Maximum bid adjustment for hard AI */
  HARD_AI_MAX_BID_ADJUSTMENT: 8,
} as const;

/**
 * AI strategy constants.
 */
export const AI_CONSTANTS = {
  /** Probability threshold for easy AI random play */
  EASY_AI_RANDOM_CHANCE: 0.7,
  /** Probability threshold for medium AI high card lead */
  MEDIUM_AI_HIGH_CARD_CHANCE: 0.6,
  /** Probability threshold for hard AI nil bid */
  HARD_AI_NIL_CHANCE: 0.3,
  /** Spade count threshold for bid adjustment */
  SPADE_COUNT_THRESHOLD_1: 4,
  /** Spade count threshold for additional bid adjustment */
  SPADE_COUNT_THRESHOLD_2: 6,
  /** Maximum spade count for nil consideration */
  NIL_MAX_SPADE_COUNT: 2,
  /** Void suit bid adjustment multiplier */
  VOID_SUIT_MULTIPLIER: 0.5,
  /** Singleton suit bid adjustment multiplier */
  SINGLETON_SUIT_MULTIPLIER: 0.3,
  /** Protected king bid adjustment multiplier */
  PROTECTED_KING_MULTIPLIER: 0.7,
  /** High spade bid adjustment multiplier */
  HIGH_SPADE_MULTIPLIER: 0.3,
} as const;

/**
 * Card evaluation constants.
 */
export const CARD_CONSTANTS = {
  /** Minimum rank value for high spades */
  HIGH_SPADE_RANK_THRESHOLD: 12,
} as const;

