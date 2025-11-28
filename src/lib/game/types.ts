/**
 * @fileoverview Core type definitions for the Spades card game.
 * 
 * This module defines all TypeScript interfaces, types, and constants used
 * throughout the game engine. It serves as the single source of truth for
 * the game's data structures.
 * 
 * @module lib/game/types
 * @see {@link ../doc/GAME_ENGINE.md} for detailed documentation
 */

import { Suit, Rank } from "@/components/svg";
import { PLAYER_POSITIONS } from "./constants";

// Re-export Suit and Rank for use in other game modules
export type { Suit, Rank };

/**
 * Represents a single playing card.
 * 
 * @interface Card
 * @property {Suit} suit - The card's suit (spades, hearts, diamonds, clubs)
 * @property {Rank} rank - The card's rank (A, 2-10, J, Q, K)
 * @property {string} id - Unique identifier in format "suit-rank" (e.g., "spades-A")
 * 
 * @example
 * const aceOfSpades: Card = {
 *   suit: "spades",
 *   rank: "A",
 *   id: "spades-A"
 * };
 */
export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

/**
 * Player positions around the table in clockwise order.
 * - south: Human player (bottom of screen)
 * - west: AI opponent (left)
 * - north: AI partner (top)
 * - east: AI opponent (right)
 */
export type PlayerPosition = typeof PLAYER_POSITIONS[keyof typeof PLAYER_POSITIONS];

/**
 * Team designations.
 * - player: Human player and their AI partner (south/north)
 * - opponent: AI opponents (west/east)
 */
export type Team = "player" | "opponent";

/**
 * Represents a player's complete state during a game.
 * 
 * @interface Player
 * @property {PlayerPosition} position - Player's table position
 * @property {string} name - Display name shown in UI
 * @property {boolean} isHuman - True for human player, false for AI
 * @property {Team} team - Team assignment (player or opponent)
 * @property {Card[]} hand - Current cards in hand
 * @property {number|null} bid - Bid for current round:
 *   - null: Has not bid yet
 *   - 0: Nil bid (aiming for zero tricks)
 *   - -1: Blind Nil bid (declared before seeing cards)
 *   - 1-13: Standard bid
 * @property {number} tricksWon - Tricks won in current round
 */
export interface Player {
  position: PlayerPosition;
  name: string;
  isHuman: boolean;
  team: Team;
  hand: Card[];
  bid: number | null;
  tricksWon: number;
}

/**
 * Types of bids available in Spades.
 * - normal: Standard 1-13 bid
 * - nil: Bid zero tricks (+100/-100 points)
 * - blind_nil: Bid zero before seeing cards (+200/-200 points)
 */
export type BidType = "normal" | "nil" | "blind_nil";

/**
 * Structured bid representation with type classification.
 * @interface Bid
 */
export interface Bid {
  value: number;
  type: BidType;
}

/**
 * Represents a single trick (one card from each of 4 players).
 * 
 * @interface Trick
 * @property {Array} cards - Cards played in order, each with card data and player
 * @property {Suit} leadSuit - The suit of the first card played (must be followed if possible)
 * @property {PlayerPosition} [winner] - Position of the player who won this trick
 * 
 * @example
 * const trick: Trick = {
 *   cards: [
 *     { card: { suit: "hearts", rank: "7", id: "hearts-7" }, player: "south" },
 *     { card: { suit: "hearts", rank: "K", id: "hearts-K" }, player: "west" },
 *     { card: { suit: "spades", rank: "2", id: "spades-2" }, player: "north" },
 *     { card: { suit: "hearts", rank: "5", id: "hearts-5" }, player: "east" }
 *   ],
 *   leadSuit: "hearts",
 *   winner: "north"  // Spade trumps hearts
 * };
 */
export interface Trick {
  cards: Array<{
    card: Card;
    player: PlayerPosition;
  }>;
  leadSuit: Suit;
  winner?: PlayerPosition;
}

/**
 * Game phases representing the current state of play.
 * 
 * Phase Transitions:
 * waiting → dealing → bidding → playing → round_end → playing (or game_over)
 */
export type GamePhase =
  | "waiting"     // Initial state, before game starts
  | "dealing"     // Cards being dealt to players
  | "bidding"     // Players making their bids
  | "playing"     // Active trick-taking gameplay
  | "round_end"   // Round complete, showing score summary
  | "game_over";  // Game finished, winner determined

/**
 * AI difficulty levels affecting bid accuracy and play strategy.
 * - easy: Random play with occasional mistakes
 * - medium: Basic strategy, reasonable bids
 * - hard: Card counting, partnership coordination
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * State of the current round being played.
 * 
 * @interface RoundState
 * @property {number} roundNumber - Current round (1-indexed)
 * @property {Trick[]} tricks - Completed tricks this round
 * @property {Trick|null} currentTrick - Trick in progress, or null if between tricks
 * @property {PlayerPosition} currentPlayer - Whose turn it is
 * @property {boolean} spadesBroken - True once spades have been played off-suit
 * @property {boolean} bidsComplete - True once all 4 players have bid
 */
export interface RoundState {
  roundNumber: number;
  tricks: Trick[];
  currentTrick: Trick | null;
  currentPlayer: PlayerPosition;
  spadesBroken: boolean;
  bidsComplete: boolean;
}

/**
 * Tracks a team's score across rounds.
 * 
 * @interface TeamScore
 * @property {number} score - Cumulative score across all rounds
 * @property {number} bags - Current bag count (resets to 0 after penalty)
 * @property {number} roundScore - Points earned/lost in the last round
 * @property {number} roundBags - Bags earned in the last round
 */
export interface TeamScore {
  score: number;
  bags: number;
  roundScore: number;
  roundBags: number;
}

/**
 * Complete game state containing all information needed to render and play.
 * 
 * @interface GameState
 * @property {string|null} id - Unique game identifier (null before start)
 * @property {GamePhase} phase - Current phase of the game
 * @property {Difficulty} difficulty - AI difficulty level
 * @property {Record<PlayerPosition, Player>} players - All four players
 * @property {RoundState} round - Current round state
 * @property {TeamScore} playerTeamScore - Human player's team score
 * @property {TeamScore} opponentTeamScore - AI opponents' team score
 * @property {Team|null} winner - Winning team, or null if game ongoing
 * @property {boolean} isAnimating - Lock flag to prevent actions during animations
 */
export interface GameState {
  id: string | null;
  phase: GamePhase;
  difficulty: Difficulty;
  
  players: Record<PlayerPosition, Player>;
  round: RoundState;
  
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
  
  winner: Team | null;
  isAnimating: boolean;
}

/**
 * Numeric values for card ranks, used for comparison.
 * Ace is high (14), face cards follow standard ordering.
 * 
 * @constant
 * @example
 * RANK_VALUES["A"] // 14
 * RANK_VALUES["K"] // 13
 * RANK_VALUES["2"] // 2
 */
export const RANK_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

/**
 * All four suits in display order.
 * Spades first as they are the trump suit.
 * 
 * @constant
 */
export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

/**
 * All thirteen ranks from lowest to highest.
 * 
 * @constant
 */
export const RANKS: Rank[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];

/**
 * Player positions in clockwise order starting from the human player.
 * Used for turn sequencing and dealing.
 * 
 * @constant
 */
export const PLAYER_ORDER: PlayerPosition[] = [
  PLAYER_POSITIONS.SOUTH,
  PLAYER_POSITIONS.WEST,
  PLAYER_POSITIONS.NORTH,
  PLAYER_POSITIONS.EAST,
];

/**
 * Maps each position to their team.
 * Partners sit across from each other (south/north vs west/east).
 * 
 * @constant
 */
export const TEAM_ASSIGNMENTS: Record<PlayerPosition, Team> = {
  [PLAYER_POSITIONS.SOUTH]: "player",    // Human player
  [PLAYER_POSITIONS.NORTH]: "player",    // AI partner
  [PLAYER_POSITIONS.WEST]: "opponent",   // AI opponent
  [PLAYER_POSITIONS.EAST]: "opponent",   // AI opponent
};

/**
 * Gets the next player in clockwise turn order.
 * 
 * @param {PlayerPosition} current - Current player's position
 * @returns {PlayerPosition} Next player's position
 * 
 * @example
 * getNextPlayer("south") // "west"
 * getNextPlayer("east")  // "south"
 */
export const getNextPlayer = (current: PlayerPosition): PlayerPosition => {
  const idx = PLAYER_ORDER.indexOf(current);
  return PLAYER_ORDER[(idx + 1) % 4];
};

/**
 * Gets a player's partner (seated across the table).
 * 
 * @param {PlayerPosition} position - Player's position
 * @returns {PlayerPosition} Partner's position
 * 
 * @example
 * getPartner("south") // "north"
 * getPartner("west")  // "east"
 */
export const getPartner = (position: PlayerPosition): PlayerPosition => {
  const partners: Record<PlayerPosition, PlayerPosition> = {
    [PLAYER_POSITIONS.SOUTH]: PLAYER_POSITIONS.NORTH,
    [PLAYER_POSITIONS.NORTH]: PLAYER_POSITIONS.SOUTH,
    [PLAYER_POSITIONS.EAST]: PLAYER_POSITIONS.WEST,
    [PLAYER_POSITIONS.WEST]: PLAYER_POSITIONS.EAST,
  };
  return partners[position];
};


