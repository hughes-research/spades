/**
 * @fileoverview Game rules enforcement for Spades.
 * 
 * This module implements all the official Spades rules including:
 * - Trick determination (who wins each trick)
 * - Valid play calculation (what cards can be legally played)
 * - Spades breaking rules (when spades can be led)
 * - Bid validation
 * 
 * @module lib/game/rules
 * @see {@link ../doc/GAME_ENGINE.md} for detailed documentation
 */

import {
  Card,
  Trick,
  PlayerPosition,
  RANK_VALUES,
} from "./types";
import { getCardsOfSuit } from "./deck";

/**
 * Determines which player wins a completed trick.
 * 
 * Spades Card Game Rules Applied:
 * 1. If any spades were played, the highest spade wins
 * 2. Otherwise, the highest card of the lead suit wins
 * 3. Cards that don't follow suit and aren't spades cannot win
 * 
 * @param {Trick} trick - A completed trick with exactly 4 cards
 * @returns {PlayerPosition} The position of the winning player
 * @throws {Error} If trick doesn't have exactly 4 cards
 * 
 * @example
 * // Spade trumps hearts
 * const winner = determineTrickWinner({
 *   cards: [
 *     { card: { suit: "hearts", rank: "A" }, player: "south" },
 *     { card: { suit: "spades", rank: "2" }, player: "west" }
 *   ],
 *   leadSuit: "hearts"
 * });
 * // Returns "west" (spade beats ace of hearts)
 */
export function determineTrickWinner(trick: Trick): PlayerPosition {
  if (trick.cards.length !== 4) {
    throw new Error("Trick must have exactly 4 cards");
  }

  const leadSuit = trick.leadSuit;
  let winningCard = trick.cards[0];
  
  for (const play of trick.cards) {
    const currentWinnerIsSpade = winningCard.card.suit === "spades";
    const playIsSpade = play.card.suit === "spades";
    
    if (playIsSpade && !currentWinnerIsSpade) {
      // Spade beats non-spade
      winningCard = play;
    } else if (playIsSpade && currentWinnerIsSpade) {
      // Both spades - higher rank wins
      if (RANK_VALUES[play.card.rank] > RANK_VALUES[winningCard.card.rank]) {
        winningCard = play;
      }
    } else if (!playIsSpade && !currentWinnerIsSpade) {
      // Neither is a spade
      if (
        play.card.suit === leadSuit &&
        winningCard.card.suit === leadSuit &&
        RANK_VALUES[play.card.rank] > RANK_VALUES[winningCard.card.rank]
      ) {
        // Both follow suit - higher rank wins
        winningCard = play;
      } else if (
        play.card.suit === leadSuit &&
        winningCard.card.suit !== leadSuit
      ) {
        // Play follows suit, winner doesn't - play wins
        winningCard = play;
      }
    }
    // If winner is spade and play is not, winner stays
  }
  
  return winningCard.player;
}

/**
 * Calculates all valid cards that can be legally played from a hand.
 * 
 * Spades Rules Enforced:
 * 1. Must follow the lead suit if you have any cards of that suit
 * 2. Cannot lead with spades until spades have been "broken"
 * 3. Exception: Can lead spades if you only have spades in hand
 * 4. Spades are broken when a player plays a spade while not leading
 * 
 * @param {Card[]} hand - The player's current hand
 * @param {Trick|null} currentTrick - The trick in progress, or null if leading
 * @param {boolean} spadesBroken - Whether spades have been broken this round
 * @param {boolean} isLeading - Whether this player is leading the trick
 * @returns {Card[]} Array of cards that can legally be played
 * 
 * @example
 * // Must follow hearts if able
 * const hand = [{ suit: "hearts", rank: "5" }, { suit: "spades", rank: "A" }];
 * const trick = { leadSuit: "hearts", cards: [...] };
 * getValidPlays(hand, trick, true, false); // Returns only hearts
 */
export function getValidPlays(
  hand: Card[],
  currentTrick: Trick | null,
  spadesBroken: boolean,
  isLeading: boolean
): Card[] {
  if (hand.length === 0) return [];

  // If leading
  if (isLeading || currentTrick === null || currentTrick.cards.length === 0) {
    if (spadesBroken) {
      // Can lead anything
      return hand;
    } else {
      // Can't lead spades unless only have spades
      const nonSpades = hand.filter((card) => card.suit !== "spades");
      return nonSpades.length > 0 ? nonSpades : hand;
    }
  }

  // Not leading - must follow suit if possible
  const leadSuit = currentTrick.leadSuit;
  const cardsOfLeadSuit = getCardsOfSuit(hand, leadSuit);
  
  if (cardsOfLeadSuit.length > 0) {
    // Must follow suit
    return cardsOfLeadSuit;
  }
  
  // Can't follow suit - can play anything
  return hand;
}

/**
 * Checks if a specific card is a valid play.
 */
export function isValidPlay(
  card: Card,
  hand: Card[],
  currentTrick: Trick | null,
  spadesBroken: boolean,
  isLeading: boolean
): boolean {
  const validPlays = getValidPlays(hand, currentTrick, spadesBroken, isLeading);
  return validPlays.some((c) => c.id === card.id);
}

/**
 * Checks if playing this card would break spades.
 */
export function wouldBreakSpades(
  card: Card,
  currentTrick: Trick | null,
  spadesBroken: boolean
): boolean {
  if (spadesBroken) return false;
  if (card.suit !== "spades") return false;
  
  // Only breaks spades if not leading (i.e., can't follow suit)
  return currentTrick !== null && currentTrick.cards.length > 0;
}

/**
 * Gets the team's total bid for the round.
 */
export function getTeamBid(
  player1Bid: number | null,
  player2Bid: number | null
): number {
  const bid1 = player1Bid === null ? 0 : Math.max(0, player1Bid);
  const bid2 = player2Bid === null ? 0 : Math.max(0, player2Bid);
  return bid1 + bid2;
}

/**
 * Gets the team's total tricks won.
 */
export function getTeamTricks(
  player1Tricks: number,
  player2Tricks: number
): number {
  return player1Tricks + player2Tricks;
}

/**
 * Validates a bid.
 * Standard bids: 0-13 (0 = nil)
 * Blind nil: -1 (must be declared before seeing cards)
 */
export function isValidBid(bid: number, isBlindNil: boolean = false): boolean {
  if (isBlindNil) {
    return bid === -1;
  }
  return bid >= 0 && bid <= 13;
}

/**
 * Checks if the combined team bids are reasonable (not over 13).
 * This is informational only - players can still bid any valid amount.
 */
export function isTeamBidReasonable(bid1: number, bid2: number): boolean {
  const total = Math.max(0, bid1) + Math.max(0, bid2);
  return total <= 13;
}

/**
 * Gets the minimum guaranteed tricks based on hand strength.
 * Used by AI to estimate bids.
 */
export function estimateMinTricks(hand: Card[]): number {
  let tricks = 0;
  
  // Count aces (usually winners)
  tricks += hand.filter((c) => c.rank === "A").length;
  
  // Count protected kings (with another card of same suit)
  const suitCounts: Record<string, number> = {};
  hand.forEach((c) => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });
  
  tricks += hand.filter(
    (c) => c.rank === "K" && suitCounts[c.suit] >= 2
  ).length * 0.7;
  
  // High spades are especially valuable
  const highSpades = hand.filter(
    (c) => c.suit === "spades" && RANK_VALUES[c.rank] >= 12
  ).length;
  tricks += highSpades * 0.3;
  
  return Math.floor(tricks);
}


