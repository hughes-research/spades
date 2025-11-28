# Glossary

## Terms and Definitions

This glossary defines key terms used throughout the Spades application documentation and codebase.

---

## Game Terms

### Bag
An overtrick - a trick won beyond the team's bid. Each bag is worth 1 point. Accumulating 10 bags results in a -100 point penalty.

### Bid
A player's declaration of how many tricks they expect to win in a round. Valid bids range from 0 (Nil) to 13.

### Blind Nil
A special bid of -1 made before seeing one's cards. Success awards +200 points; failure costs -200 points.

### Break Spades
When a spade is played off-suit (not following the lead suit), spades are considered "broken" and can then be led.

### Dealer
The player who deals cards for a round. In this implementation, dealing is automated.

### Lead
The first card played in a trick, which determines the suit that must be followed.

### Nil
A bid of 0 tricks. Success awards +100 points; failure costs -100 points.

### Overtrick
See **Bag**.

### Partner
The player on your team. In Spades, teams are:
- You (South) + Partner (North)
- Opponents: West + East

### Round
A complete cycle of dealing, bidding, playing 13 tricks, and scoring. Multiple rounds make up a game.

### Set
Failing to make your bid. Results in -10 points per trick bid.

### Spades
The trump suit. Spades always beat other suits, regardless of rank. The lowest spade beats the highest card of any other suit.

### Trick
A set of four cards, one from each player. The highest card (or highest spade if any spades are played) wins the trick.

### Trump
A suit that outranks all others. In Spades, spades are always trump.

---

## Technical Terms

### API Route
A server-side endpoint in Next.js that handles HTTP requests. Located in `src/app/api/`.

### Component
A reusable React element that encapsulates UI and behavior. Can be functional or class-based.

### Game Engine
The core business logic layer (`src/lib/game/`) that implements Spades rules independently of the UI.

### Game Phase
The current state of the game: `waiting`, `dealing`, `bidding`, `playing`, `round_end`, or `game_over`.

### Hand
The 13 cards held by a player during a round.

### Player Position
One of four positions at the table: `south` (You), `west`, `north` (Partner), or `east`.

### State Management
The system for managing and updating application state. This project uses Zustand.

### Store
The Zustand store (`src/lib/store.ts`) that holds all game state and provides actions to modify it.

### Team
A partnership of two players. Teams compete against each other to reach 500 points first.

### Trick State
Information about the current trick in progress, including cards played and the lead suit.

---

## Data Terms

### Game
A complete game session, consisting of multiple rounds until a team reaches 500 points.

### Round Record
A database record tracking a single round's bids, tricks won, and resulting scores.

### Settings
Global application preferences stored in the database (difficulty, animation speed, etc.).

### Statistics
Player performance metrics tracked across all games (wins, losses, streaks, etc.).

---

## AI Terms

### Difficulty Level
The AI's skill level: `easy`, `medium`, or `hard`. Affects bidding strategy and card play decisions.

### Hint System
A feature that suggests optimal card plays or bids using the Hard AI's logic.

### Thinking Delay
An artificial delay before AI actions to simulate human thinking time. Varies by difficulty.

---

## UI/UX Terms

### Animation
Visual transitions and effects powered by Framer Motion for card dealing, playing, and UI interactions.

### Bid Selector
The interactive UI component for placing bids during the bidding phase.

### Card Face
The visible side of a card showing suit and rank, as opposed to the card back.

### Hand Component
The React component that renders a player's cards in a fan or stack layout.

### Trick Area
The central display area showing cards currently in play for the active trick.

---

## Security Terms

### Content Security Policy (CSP)
HTTP headers that restrict which resources can be loaded to prevent XSS attacks.

### Rate Limiting
Protection against API abuse by limiting requests per time window (60 req/min).

### Input Validation
Checking and sanitizing user input before processing to prevent injection attacks.

### Sensitive Data Masking
Redacting passwords, tokens, and other sensitive information from logs.

---

## Database Terms

### Migration
A script that modifies the database schema. Managed by Prisma Migrate.

### Model
A Prisma schema definition representing a database table and its relationships.

### ORM
Object-Relational Mapping. Prisma provides type-safe database access.

### Schema
The Prisma schema file (`prisma/schema.prisma`) defining all data models.

---

## Development Terms

### App Router
Next.js 13+ routing system using the `app/` directory structure.

### Barrel Export
A file (typically `index.ts`) that re-exports multiple modules for cleaner imports.

### Type Guard
A TypeScript function that narrows a type at runtime (e.g., `isValidDifficulty`).

### Zustand Selector
A function that extracts specific state from the store to minimize re-renders.

---

*Glossary Version: 1.0.0*
*Last Updated: November 2024*

