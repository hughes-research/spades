/**
 * @fileoverview Deck management utilities for Spades.
 * 
 * This module handles all deck-related operations:
 * - Creating a standard 52-card deck
 * - Shuffling using Fisher-Yates algorithm
 * - Dealing cards to players
 * - Hand sorting and analysis
 * 
 * @module lib/game/deck
 * @see {@link ../doc/GAME_ENGINE.md} for detailed documentation
 */

import { Card, SUITS, RANKS, PlayerPosition, PLAYER_ORDER, RANK_VALUES, Suit } from "./types";
import { GAME_CONSTANTS, PLAYER_POSITIONS } from "./constants";

/**
 * Creates a standard 52-card deck with all suits and ranks.
 * 
 * @returns {Card[]} Array of 52 Card objects, each with unique id
 * 
 * @example
 * const deck = createDeck();
 * console.log(deck.length); // 52
 * console.log(deck[0]); // { suit: "spades", rank: "2", id: "spades-2" }
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}`,
      });
    }
  }
  
  return deck;
}

/**
 * Shuffles an array using the Fisher-Yates (Knuth) algorithm.
 * 
 * This algorithm provides a cryptographically fair shuffle by ensuring
 * each permutation has an equal probability. The original array is
 * not modified; a new shuffled array is returned.
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 * 
 * @template T - Type of array elements
 * @param {T[]} array - Array to shuffle
 * @returns {T[]} New array with elements in random order
 * 
 * @example
 * const deck = createDeck();
 * const shuffled = shuffle(deck);
 * // Original deck unchanged, shuffled is randomized
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

/**
 * Deals a full hand of 13 cards to each of the 4 players.
 * 
 * Process:
 * 1. Creates and shuffles a new deck
 * 2. Deals cards one at a time in clockwise order
 * 3. Sorts each hand by suit (spades first) then rank (high to low)
 * 
 * @returns {Record<PlayerPosition, Card[]>} Object with hands for each position
 * 
 * @example
 * const hands = dealCards();
 * console.log(hands.south.length); // 13
 * console.log(hands.north.length); // 13
 */
export function dealCards(): Record<PlayerPosition, Card[]> {
  const deck = shuffle(createDeck());
  const hands: Record<PlayerPosition, Card[]> = {
    [PLAYER_POSITIONS.SOUTH]: [],
    [PLAYER_POSITIONS.WEST]: [],
    [PLAYER_POSITIONS.NORTH]: [],
    [PLAYER_POSITIONS.EAST]: [],
  };
  
  // Deal cards one at a time, rotating through players
  for (let i = 0; i < GAME_CONSTANTS.DECK_SIZE; i++) {
    const playerIndex = i % GAME_CONSTANTS.PLAYER_COUNT;
    const player = PLAYER_ORDER[playerIndex];
    hands[player].push(deck[i]);
  }
  
  // Sort each hand by suit then rank
  for (const position of PLAYER_ORDER) {
    hands[position] = sortHand(hands[position]);
  }
  
  return hands;
}

/**
 * Suit ordering for hand sorting.
 * Spades first (trump suit), then hearts, diamonds, clubs.
 * 
 * @constant
 */
const SUIT_ORDER: Record<Suit, number> = {
  spades: 0,
  hearts: 1,
  diamonds: 2,
  clubs: 3,
};

/**
 * Sorts a hand for optimal display and playability.
 * 
 * Sorting Order:
 * 1. By suit: Spades, Hearts, Diamonds, Clubs
 * 2. Within suit: High to low (A, K, Q, J, 10, ... 2)
 * 
 * @param {Card[]} cards - Cards to sort
 * @returns {Card[]} New array with cards sorted
 * 
 * @example
 * const sorted = sortHand(hand);
 * // Result: [Spade A, Spade K, ..., Heart A, ..., Club 2]
 */
export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    // First sort by suit
    const suitDiff = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    if (suitDiff !== 0) return suitDiff;
    
    // Then by rank (high to low)
    return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
  });
}

/**
 * Counts the number of cards of each suit in a hand.
 * Useful for bidding strategy and void detection.
 * 
 * @param {Card[]} cards - Cards to analyze
 * @returns {Record<Suit, number>} Count of cards per suit
 * 
 * @example
 * const counts = countSuits(hand);
 * // { spades: 3, hearts: 4, diamonds: 2, clubs: 4 }
 */
export function countSuits(cards: Card[]): Record<Suit, number> {
  const counts: Record<Suit, number> = {
    spades: 0,
    hearts: 0,
    diamonds: 0,
    clubs: 0,
  };
  
  for (const card of cards) {
    counts[card.suit]++;
  }
  
  return counts;
}

/**
 * Filters cards to only those of a specific suit.
 * Used for determining valid plays when following suit.
 * 
 * @param {Card[]} cards - Cards to filter
 * @param {Suit} suit - Suit to filter for
 * @returns {Card[]} Cards matching the specified suit
 */
export function getCardsOfSuit(cards: Card[], suit: Suit): Card[] {
  return cards.filter((card) => card.suit === suit);
}

/**
 * Counts spades in a hand.
 * Important for bidding strategy (spades are trump).
 * 
 * @param {Card[]} cards - Cards to count
 * @returns {number} Number of spades
 */
export function countSpades(cards: Card[]): number {
  return cards.filter((card) => card.suit === "spades").length;
}

/**
 * Counts high cards (Ace, King, Queen) in a hand.
 * Used for hand strength evaluation in bidding.
 * 
 * @param {Card[]} cards - Cards to count
 * @returns {number} Count of A, K, Q cards
 */
export function countHighCards(cards: Card[]): number {
  const highRanks = ["A", "K", "Q"];
  return cards.filter((card) => highRanks.includes(card.rank)).length;
}
