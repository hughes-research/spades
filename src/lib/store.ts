/**
 * @fileoverview Global state management for the Spades game.
 * 
 * Uses Zustand for lightweight, performant state management with:
 * - Full TypeScript support
 * - Minimal re-renders via selectors
 * - Direct access for non-React code
 * 
 * The store manages:
 * - Game lifecycle (start, play, end)
 * - Player states and hands
 * - Round progression and scoring
 * - AI turn processing
 * 
 * @module lib/store
 * @see {@link ../doc/STATE_MANAGEMENT.md} for detailed documentation
 */

"use client";

import { create } from "zustand";
import {
  GameState,
  Difficulty,
  PlayerPosition,
  Player,
  Card,
  TeamScore,
  PLAYER_ORDER,
  getNextPlayer,
  getPartner,
} from "./game/types";
import { dealCards } from "./game/deck";
import { determineTrickWinner, getValidPlays, wouldBreakSpades } from "./game/rules";
import { calculateRoundScore, updateTeamScore, checkWinner } from "./game/scoring";
import { calculateAIBid, selectAICard, getAIThinkingDelay } from "./game/ai";
import { ANIMATION_DELAYS, GAME_CONSTANTS } from "./game/constants";

/**
 * Default team score state for new games.
 * @constant
 */
const initialTeamScore: TeamScore = {
  score: 0,
  bags: 0,
  roundScore: 0,
  roundBags: 0,
};

/**
 * Creates the initial player configuration.
 * Human player at south, AI partner at north, AI opponents at east/west.
 * 
 * @returns {Record<PlayerPosition, Player>} Initial player states
 */
const createInitialPlayers = (): Record<PlayerPosition, Player> => ({
  south: {
    position: "south",
    name: "You",
    isHuman: true,
    team: "player",
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  west: {
    position: "west",
    name: "West",
    isHuman: false,
    team: "opponent",
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  north: {
    position: "north",
    name: "Partner",
    isHuman: false,
    team: "player",
    hand: [],
    bid: null,
    tricksWon: 0,
  },
  east: {
    position: "east",
    name: "East",
    isHuman: false,
    team: "opponent",
    hand: [],
    bid: null,
    tricksWon: 0,
  },
});

const createInitialState = (): GameState => ({
  id: null,
  phase: "waiting",
  difficulty: "medium",
  players: createInitialPlayers(),
  round: {
    roundNumber: 1,
    tricks: [],
    currentTrick: null,
    currentPlayer: "west", // Left of dealer (south)
    spadesBroken: false,
    bidsComplete: false,
  },
  playerTeamScore: { ...initialTeamScore },
  opponentTeamScore: { ...initialTeamScore },
  winner: null,
  isAnimating: false,
});

/**
 * Complete store interface extending GameState with actions.
 * 
 * @interface GameStore
 * @extends GameState
 */
interface GameStore extends GameState {
  /** Initializes a new game with specified difficulty */
  startNewGame: (difficulty: Difficulty) => void;
  
  /** Loads a saved game state */
  loadGame: (state: Partial<GameState>) => void;
  
  /** Deals cards to all players and starts bidding */
  dealHands: () => void;
  
  /** Records a player's bid */
  placeBid: (position: PlayerPosition, bid: number) => void;
  
  /** Plays a card from a player's hand */
  playCard: (position: PlayerPosition, card: Card) => void;
  
  /** Processes AI player's turn (bid or play) */
  processAITurn: () => Promise<void>;
  
  /** Completes current trick and awards to winner */
  finishTrick: () => void;
  
  /** Calculates and applies round scores */
  finishRound: () => void;
  
  /** Starts the next round */
  nextRound: () => void;
  
  /** Sets animation lock state */
  setAnimating: (isAnimating: boolean) => void;
  
  /** Gets valid plays for a player */
  getValidPlaysForPlayer: (position: PlayerPosition) => Card[];
  
  /** Resets to initial state */
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  startNewGame: (difficulty: Difficulty) => {
    const state = createInitialState();
    state.difficulty = difficulty;
    state.phase = "dealing";
    // Use crypto.randomUUID() for unpredictable game IDs
    state.id = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID()
      : `game-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    set(state);
    
    // Deal cards after a short delay for animation
    setTimeout(() => {
      get().dealHands();
    }, ANIMATION_DELAYS.DEAL_DELAY);
  },

  loadGame: (loadedState: Partial<GameState>) => {
    set((state) => ({
      ...state,
      ...loadedState,
    }));
  },

  dealHands: () => {
    const hands = dealCards();
    
    set((state) => ({
      ...state,
      phase: "bidding",
      players: {
        south: { ...state.players.south, hand: hands.south, bid: null, tricksWon: 0 },
        west: { ...state.players.west, hand: hands.west, bid: null, tricksWon: 0 },
        north: { ...state.players.north, hand: hands.north, bid: null, tricksWon: 0 },
        east: { ...state.players.east, hand: hands.east, bid: null, tricksWon: 0 },
      },
      round: {
        ...state.round,
        currentPlayer: "west", // Left of dealer starts
        bidsComplete: false,
        spadesBroken: false,
        tricks: [],
        currentTrick: null,
      },
    }));
  },

  placeBid: (position: PlayerPosition, bid: number) => {
    set((state) => {
      const newPlayers = { ...state.players };
      newPlayers[position] = { ...newPlayers[position], bid };
      
      // Check if all bids are complete
      const allBidsIn = PLAYER_ORDER.every(
        (pos) => newPlayers[pos].bid !== null
      ) && PLAYER_ORDER.length === GAME_CONSTANTS.PLAYER_COUNT;
      
      // Move to next player or start playing
      const nextPlayer = getNextPlayer(position);
      
      return {
        ...state,
        players: newPlayers,
        phase: allBidsIn ? "playing" : "bidding",
        round: {
          ...state.round,
          currentPlayer: allBidsIn ? "west" : nextPlayer,
          bidsComplete: allBidsIn,
        },
      };
    });
  },

  playCard: (position: PlayerPosition, card: Card) => {
    set((state) => {
      const player = state.players[position];
      
      // Remove card from hand
      const newHand = player.hand.filter((c) => c.id !== card.id);
      
      // Update or create current trick
      let currentTrick = state.round.currentTrick;
      const isLeading = !currentTrick || currentTrick.cards.length === 0;
      
      if (isLeading) {
        currentTrick = {
          cards: [{ card, player: position }],
          leadSuit: card.suit,
        };
      } else {
        currentTrick = {
          ...currentTrick!,
          cards: [...currentTrick!.cards, { card, player: position }],
        };
      }
      
      // Check if spades are broken
      const spadesBroken =
        state.round.spadesBroken ||
        wouldBreakSpades(card, state.round.currentTrick, state.round.spadesBroken);
      
      // Check if trick is complete
      const trickComplete = currentTrick.cards.length === GAME_CONSTANTS.CARDS_PER_TRICK;
      
      return {
        ...state,
        players: {
          ...state.players,
          [position]: { ...player, hand: newHand },
        },
        round: {
          ...state.round,
          currentTrick,
          spadesBroken,
          currentPlayer: trickComplete ? position : getNextPlayer(position),
        },
      };
    });
  },

  processAITurn: async () => {
    const initialState = get();
    const { phase: initialPhase, round: initialRound, players: initialPlayers, difficulty, id: gameId } = initialState;
    const initialCurrentPlayer = initialPlayers[initialRound.currentPlayer];
    
    // Early exit checks
    if (initialCurrentPlayer.isHuman || initialState.isAnimating) return;
    if (initialPhase !== "bidding" && initialPhase !== "playing") return;
    
    // Add thinking delay
    const delay = getAIThinkingDelay(difficulty);
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Re-check state after delay - game state may have changed
    const state = get();
    const { phase, round, players, id: currentGameId } = state;
    
    // Verify we're still in the same game (prevents stale updates after new game)
    if (currentGameId !== gameId) return;
    
    const currentPlayer = players[round.currentPlayer];
    
    // Verify the turn is still valid after the delay
    if (currentPlayer.isHuman || state.isAnimating) return;
    if (phase !== "bidding" && phase !== "playing") return;
    
    if (phase === "bidding") {
      // AI bidding - check hand exists
      if (currentPlayer.hand.length === 0) return;
      
      const partnerPos = getPartner(round.currentPlayer);
      const partnerBid = players[partnerPos].bid;
      const bid = calculateAIBid(currentPlayer.hand, partnerBid, difficulty);
      get().placeBid(round.currentPlayer, bid);
    } else if (phase === "playing") {
      // AI playing a card - check hand has cards
      if (currentPlayer.hand.length === 0) return;
      
      const partner = players[getPartner(round.currentPlayer)];
      const context = {
        player: currentPlayer,
        partner,
        currentTrick: round.currentTrick,
        spadesBroken: round.spadesBroken,
        difficulty,
        cardsPlayed: round.tricks.flatMap((t) => t.cards.map((c) => c.card)),
        roundTricks: round.tricks.length,
      };
      
      const card = selectAICard(context);
      get().playCard(round.currentPlayer, card);
      
      // Check if trick is complete with validation
      const newState = get();
      if (newState.id === gameId && newState.round.currentTrick?.cards.length === GAME_CONSTANTS.CARDS_PER_TRICK) {
        setTimeout(() => {
          // Validate state hasn't changed before finishing trick
          const checkState = get();
          if (checkState.id === gameId && checkState.round.currentTrick?.cards.length === GAME_CONSTANTS.CARDS_PER_TRICK) {
            get().finishTrick();
          }
        }, ANIMATION_DELAYS.TRICK_COMPLETE_DELAY);
      }
    }
  },

  finishTrick: () => {
    set((state) => {
      const trick = state.round.currentTrick;
      if (!trick || trick.cards.length !== GAME_CONSTANTS.CARDS_PER_TRICK) return state;
      
      const winner = determineTrickWinner(trick);
      const completedTrick = { ...trick, winner };
      
      // Update winner's trick count
      const newPlayers = { ...state.players };
      newPlayers[winner] = {
        ...newPlayers[winner],
        tricksWon: newPlayers[winner].tricksWon + 1,
      };
      
      const newTricks = [...state.round.tricks, completedTrick];
      const roundComplete = newTricks.length === GAME_CONSTANTS.TRICKS_PER_ROUND;
      
      return {
        ...state,
        players: newPlayers,
        phase: roundComplete ? "round_end" : "playing",
        round: {
          ...state.round,
          tricks: newTricks,
          currentTrick: null,
          currentPlayer: winner, // Winner leads next trick
        },
      };
    });
    
    // Check if round is over
    const state = get();
    if (state.phase === "round_end") {
      setTimeout(() => get().finishRound(), ANIMATION_DELAYS.ROUND_END_DELAY);
    }
  },

  finishRound: () => {
    set((state) => {
      const { players, playerTeamScore, opponentTeamScore } = state;
      
      // Calculate player team score (south + north)
      const playerResult = calculateRoundScore(
        players.south.bid ?? 0,
        players.south.tricksWon,
        players.north.bid ?? 0,
        players.north.tricksWon,
        playerTeamScore.bags
      );
      
      // Calculate opponent team score (west + east)
      const opponentResult = calculateRoundScore(
        players.west.bid ?? 0,
        players.west.tricksWon,
        players.east.bid ?? 0,
        players.east.tricksWon,
        opponentTeamScore.bags
      );
      
      const newPlayerScore = updateTeamScore(playerTeamScore, playerResult);
      const newOpponentScore = updateTeamScore(opponentTeamScore, opponentResult);
      
      // Check for winner
      const winner = checkWinner(newPlayerScore.score, newOpponentScore.score);
      
      return {
        ...state,
        playerTeamScore: newPlayerScore,
        opponentTeamScore: newOpponentScore,
        phase: winner ? "game_over" : "round_end",
        winner,
      };
    });
  },

  nextRound: () => {
    set((state) => ({
      ...state,
      phase: "dealing",
      round: {
        ...state.round,
        roundNumber: state.round.roundNumber + 1,
        tricks: [],
        currentTrick: null,
        spadesBroken: false,
        bidsComplete: false,
      },
    }));
    
    setTimeout(() => get().dealHands(), ANIMATION_DELAYS.NEXT_ROUND_DELAY);
  },

  setAnimating: (isAnimating: boolean) => {
    set({ isAnimating });
  },

  getValidPlaysForPlayer: (position: PlayerPosition) => {
    const state = get();
    const player = state.players[position];
    const isLeading =
      !state.round.currentTrick ||
      state.round.currentTrick.cards.length === 0;
    
    return getValidPlays(
      player.hand,
      state.round.currentTrick,
      state.round.spadesBroken,
      isLeading
    );
  },

  reset: () => {
    set(createInitialState());
  },
}));

export default useGameStore;

