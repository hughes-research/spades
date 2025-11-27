# Game Engine Documentation

## Overview

The game engine (`src/lib/game/`) implements the complete Spades card game ruleset. It is designed to be framework-agnostic, pure TypeScript code that can be tested and reused independently of the UI layer.

## Module Structure

```
src/lib/game/
├── index.ts        # Module exports
├── types.ts        # Type definitions and constants
├── deck.ts         # Deck management
├── rules.ts        # Game rule enforcement
├── scoring.ts      # Score calculations
└── ai.ts           # AI opponent logic
```

---

## Types Module (`types.ts`)

### Card Representation

```typescript
interface Card {
  suit: Suit;       // "spades" | "hearts" | "diamonds" | "clubs"
  rank: Rank;       // "A" | "2" | "3" | ... | "K"
  id: string;       // Unique identifier: "spades-A", "hearts-7"
}
```

### Player Model

```typescript
interface Player {
  position: PlayerPosition;  // "south" | "west" | "north" | "east"
  name: string;              // Display name
  isHuman: boolean;          // Human vs AI flag
  team: Team;                // "player" | "opponent"
  hand: Card[];              // Current cards
  bid: number | null;        // Bid value (null = not bid, 0 = nil, -1 = blind nil)
  tricksWon: number;         // Tricks won this round
}
```

### Game Phase

```typescript
type GamePhase =
  | "waiting"      // Before game starts
  | "dealing"      // Cards being dealt
  | "bidding"      // Players making bids
  | "playing"      // Playing tricks
  | "round_end"    // Scoring a round
  | "game_over";   // Game finished
```

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `RANK_VALUES` | Object | Maps ranks to numeric values (Ace = 14) |
| `SUITS` | Array | Suit order: spades, hearts, diamonds, clubs |
| `RANKS` | Array | All 13 ranks in order |
| `PLAYER_ORDER` | Array | Clockwise: south, west, north, east |

### Utility Functions

```typescript
// Get next player in clockwise order
getNextPlayer(current: PlayerPosition): PlayerPosition

// Get player's partner (across the table)
getPartner(position: PlayerPosition): PlayerPosition
```

---

## Deck Module (`deck.ts`)

### Core Functions

#### `createDeck(): Card[]`

Creates a standard 52-card deck.

```typescript
const deck = createDeck();
// Returns 52 Card objects with unique IDs
```

#### `shuffle<T>(array: T[]): T[]`

Fisher-Yates shuffle algorithm. Returns new array without modifying original.

```typescript
const shuffled = shuffle(deck);
// Cryptographically fair random distribution
```

#### `dealCards(): Record<PlayerPosition, Card[]>`

Deals 13 cards to each player and sorts hands.

```typescript
const hands = dealCards();
// hands.south = [13 sorted cards]
// hands.west = [13 sorted cards]
// ...
```

#### `sortHand(cards: Card[]): Card[]`

Sorts cards by suit (spades first) then rank (high to low).

```typescript
const sorted = sortHand(hand);
// Spades: A, K, Q, J, 10... → Hearts... → Diamonds... → Clubs
```

### Helper Functions

| Function | Purpose |
|----------|---------|
| `countSuits(cards)` | Count cards per suit |
| `getCardsOfSuit(cards, suit)` | Filter cards by suit |
| `hasSuit(cards, suit)` | Check if hand has suit |
| `countSpades(cards)` | Count spades in hand |
| `countHighCards(cards)` | Count A, K, Q in hand |

---

## Rules Module (`rules.ts`)

### Trick Determination

#### `determineTrickWinner(trick: Trick): PlayerPosition`

Determines which player wins a completed trick.

**Rules Applied:**
1. Highest spade wins if any spades played
2. Otherwise, highest card of lead suit wins

```typescript
const winner = determineTrickWinner({
  cards: [
    { card: { suit: "hearts", rank: "K" }, player: "south" },
    { card: { suit: "hearts", rank: "A" }, player: "west" },
    { card: { suit: "spades", rank: "2" }, player: "north" },  // Wins!
    { card: { suit: "hearts", rank: "5" }, player: "east" },
  ],
  leadSuit: "hearts",
});
// Returns "north" (spades trump hearts)
```

### Valid Play Calculation

#### `getValidPlays(hand, currentTrick, spadesBroken, isLeading): Card[]`

Returns all cards that can legally be played.

**Rules Applied:**
1. Must follow suit if possible
2. Cannot lead spades until broken (unless only spades remain)
3. Spades broken when played off-suit

```typescript
// Leading with hearts broken
const validPlays = getValidPlays(hand, null, true, true);
// Returns all cards in hand

// Following hearts lead, has hearts
const validPlays = getValidPlays(hand, currentTrick, true, false);
// Returns only hearts from hand
```

#### `isValidPlay(card, hand, currentTrick, spadesBroken, isLeading): boolean`

Validates a specific card play.

#### `wouldBreakSpades(card, currentTrick, spadesBroken): boolean`

Checks if playing this card would break spades.

### Bid Validation

#### `isValidBid(bid: number, isBlindNil?: boolean): boolean`

Validates bid value.

| Bid Value | Meaning |
|-----------|---------|
| 0 | Nil (bid zero tricks) |
| 1-13 | Standard bid |
| -1 | Blind Nil |

#### `isTeamBidReasonable(bid1: number, bid2: number): boolean`

Checks if combined team bid ≤ 13 (informational only).

#### `estimateMinTricks(hand: Card[]): number`

Estimates minimum guaranteed tricks for a hand.

**Factors Considered:**
- Number of Aces (guaranteed winners)
- Protected Kings (with supporting cards)
- High spades (Q, K, A of spades)

---

## Scoring Module (`scoring.ts`)

### Constants

```typescript
const SCORING_CONSTANTS = {
  POINTS_PER_BID: 10,         // Points per bid trick made
  NIL_BONUS: 100,             // Nil success
  NIL_PENALTY: -100,          // Nil failure
  BLIND_NIL_BONUS: 200,       // Blind nil success
  BLIND_NIL_PENALTY: -200,    // Blind nil failure
  BAG_PENALTY_THRESHOLD: 10,  // Bags before penalty
  BAG_PENALTY: -100,          // Penalty for 10 bags
  WINNING_SCORE: 500,         // Score to win
};
```

### Score Calculation

#### `calculateRoundScore(player1Bid, player1Tricks, player2Bid, player2Tricks, currentBags): RoundScoreResult`

Calculates team score for a round.

**Returns:**
```typescript
interface RoundScoreResult {
  points: number;          // Total points earned/lost
  bags: number;            // New bag count
  bagPenalty: boolean;     // Whether bag penalty applied
  nilBonuses: number;      // Points from nil successes
  nilPenalties: number;    // Points from nil failures
  details: string[];       // Human-readable breakdown
}
```

**Scoring Rules:**

1. **Made Bid**: `bid × 10 points`
2. **Overtricks (Bags)**: `+1 point each`
3. **Set (Underbid)**: `-bid × 10 points`
4. **Nil Success**: `+100 points`
5. **Nil Failure**: `-100 points`
6. **Blind Nil Success**: `+200 points`
7. **Blind Nil Failure**: `-200 points`
8. **10 Bags Penalty**: `-100 points`, bags reset

### Winner Determination

#### `checkWinner(playerTeamScore, opponentTeamScore): Team | null`

Checks if game has ended.

**Rules:**
- First team to 500+ wins
- If both reach 500, higher score wins
- Tie at 500+ continues game

### Utility Functions

```typescript
// Format score with sign
formatScore(42)    // "+42"
formatScore(-30)   // "-30"

// Format bid for display
formatBid(null)    // "-"
formatBid(0)       // "Nil"
formatBid(-1)      // "Blind Nil"
formatBid(4)       // "4"
```

---

## AI Module (`ai.ts`)

### Difficulty Levels

| Level | Bidding | Play Style |
|-------|---------|------------|
| Easy | Random variation ±1 | 70% random, occasionally lowest |
| Medium | Conservative estimate | Tries to win, plays lowest winner |
| Hard | Card counting, partnership | Strategic leads, covers partner |

### Bidding Algorithm

#### `calculateAIBid(hand, partnerBid, difficulty): number`

**Base Calculation:**
1. Count Aces (high win probability)
2. Count protected Kings
3. Add bonus for 4+ spades
4. Adjust for voids and singletons
5. Consider partner's bid for team balance

**Difficulty Modifiers:**
- **Easy**: Adds random -1 to +1
- **Medium**: Rounds conservatively
- **Hard**: May bid Nil on weak hands

### Card Selection

#### `selectAICard(context: AIContext): Card`

**Context Provided:**
```typescript
interface AIContext {
  player: Player;           // Current AI player
  partner: Player;          // AI's partner
  currentTrick: Trick;      // Cards played so far
  spadesBroken: boolean;    // Whether spades broken
  difficulty: Difficulty;   // AI difficulty
  cardsPlayed: Card[];      // All cards played this round
  roundTricks: number;      // Tricks completed
}
```

**Easy AI Strategy:**
- 70% random from valid plays
- 30% plays lowest card

**Medium AI Strategy:**
- Leading: Play high non-spades
- Following: Win with lowest winning card
- Can't win: Play lowest card

**Hard AI Strategy:**
- Tracks remaining cards
- Leads from longest suit
- Considers partner's position
- Manages spades strategically
- Avoids overtricks when bid is made

### Hint System

#### `getHintCard(hand, validPlays, currentTrick, spadesBroken, bid, tricksWon): Card`

Suggests best card to play using hard AI logic.

#### `getHintBid(hand, partnerBid): number`

Suggests bid based on hand analysis.

### AI Timing

```typescript
const AI_DELAY_CONFIG = {
  easy: { base: 500, variance: 500 },    // 500-1000ms
  medium: { base: 800, variance: 700 },  // 800-1500ms
  hard: { base: 1000, variance: 1000 },  // 1000-2000ms
};
```

---

## Integration Example

```typescript
import {
  createDeck,
  dealCards,
  getValidPlays,
  determineTrickWinner,
  calculateRoundScore,
  calculateAIBid,
  selectAICard,
} from '@/lib/game';

// Start game
const hands = dealCards();

// Get player's valid plays
const validPlays = getValidPlays(
  hands.south,
  currentTrick,
  spadesBroken,
  isLeading
);

// AI makes a bid
const aiBid = calculateAIBid(
  hands.west,
  partnerBid,
  'medium'
);

// AI plays a card
const aiCard = selectAICard({
  player: westPlayer,
  partner: eastPlayer,
  currentTrick,
  spadesBroken,
  difficulty: 'medium',
  cardsPlayed: [],
  roundTricks: 0,
});

// Determine trick winner
const winner = determineTrickWinner(completedTrick);

// Calculate round score
const result = calculateRoundScore(
  southBid, southTricks,
  northBid, northTricks,
  currentBags
);
```

---

*Documentation Version: 1.0.0*
*Last Updated: November 2024*

