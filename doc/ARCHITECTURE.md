# Spades Game Architecture

## Overview

The Spades card game is a modern, full-stack web application built with Next.js 16, React 19, and TypeScript. The architecture follows a clean separation of concerns with distinct layers for game logic, state management, UI components, and data persistence.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     React Components                        ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │GameTable│ │  Hand   │ │  Card   │ │  SVG    │          ││
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          ││
│  └───────┼───────────┼───────────┼───────────┼────────────────┘│
│          │           │           │           │                  │
│  ┌───────┴───────────┴───────────┴───────────┴────────────────┐│
│  │                    Zustand Store                            ││
│  │           (Global State Management)                         ││
│  └─────────────────────────┬──────────────────────────────────┘│
│                            │                                    │
│  ┌─────────────────────────┴──────────────────────────────────┐│
│  │                    Game Engine                              ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │  Rules  │ │   AI    │ │ Scoring │ │  Deck   │          ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Server Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    API Routes                               ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                       ││
│  │  │  /game  │ │/settings│ │ /stats  │                       ││
│  │  └────┬────┘ └────┬────┘ └────┬────┘                       ││
│  └───────┼───────────┼───────────┼────────────────────────────┘│
│          │           │           │                              │
│  ┌───────┴───────────┴───────────┴────────────────────────────┐│
│  │                    Prisma ORM                               ││
│  └─────────────────────────┬──────────────────────────────────┘│
│                            │                                    │
│  ┌─────────────────────────┴──────────────────────────────────┐│
│  │                    SQLite Database                          ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │  Game   │ │  Round  │ │Settings │ │  Stats  │          ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Game Engine (`src/lib/game/`)

The game engine contains all the business logic for the Spades card game:

| Module | Responsibility |
|--------|---------------|
| `types.ts` | TypeScript interfaces, constants, and utility functions |
| `rules.ts` | Game rules enforcement (trick determination, valid plays) |
| `scoring.ts` | Score calculation, nil handling, bag penalties |
| `ai.ts` | Multi-difficulty AI opponent logic |
| `deck.ts` | Deck creation, shuffling, and dealing |

### 2. State Management (`src/lib/store.ts`)

Uses Zustand for lightweight, performant global state management:

- **Game State**: Phase, players, tricks, scores
- **Actions**: Start game, play card, place bid
- **Derived State**: Valid plays, current player

### 3. UI Layer (`src/components/`)

Component hierarchy:

```
components/
├── game/           # Game-specific components
│   ├── GameTable   # Main game orchestrator
│   ├── Hand        # Card hand rendering
│   ├── Card        # Individual card with animations
│   ├── TrickArea   # Central trick display
│   └── BidSelector # Bidding interface
├── svg/            # SVG-based graphics
│   ├── CardSVG     # Full card rendering
│   ├── SuitIcon    # Suit symbols
│   └── Logo        # Game branding
└── ui/             # Reusable UI components
    ├── Button      # Styled buttons
    └── Breadcrumbs # Navigation breadcrumbs
```

### 4. API Layer (`src/app/api/`)

RESTful API endpoints:

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/game` | GET, POST, PUT | Game CRUD operations |
| `/api/settings` | GET, POST | User settings persistence |
| `/api/stats` | GET, POST | Player statistics |

### 5. Security Layer

- **Middleware**: Security headers (CSP, XSS protection)
- **Rate Limiting**: In-memory request throttling
- **Validation**: Input sanitization utilities

## Data Flow

### Game Initialization

```
User clicks "New Game"
       │
       ▼
startNewGame(difficulty)
       │
       ▼
Create initial state
       │
       ▼
dealCards() → Fisher-Yates shuffle
       │
       ▼
Phase: "bidding"
       │
       ▼
AI/Player bidding sequence
       │
       ▼
Phase: "playing"
```

### Card Play Flow

```
Player/AI selects card
       │
       ▼
getValidPlays() check
       │
       ▼
playCard(position, card)
       │
       ▼
Update trick state
       │
       ▼
Check spades broken
       │
       ▼
Trick complete? → determineTrickWinner()
       │
       ▼
Round complete? → calculateRoundScore()
       │
       ▼
Game over? → checkWinner()
```

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| State | Zustand 5 |
| Animations | Framer Motion 12 |
| 3D Graphics | Three.js / React Three Fiber |
| Styling | Tailwind CSS 4 |
| Database | SQLite via Prisma 6 |
| Runtime | Node.js 20+ |

## Design Principles

### 1. Separation of Concerns
- Game logic is completely isolated from UI
- State management is centralized and predictable
- API routes handle only data operations

### 2. Type Safety
- Full TypeScript coverage
- Strict type checking enabled
- No use of `any` types

### 3. Performance
- Memoized components with `memo()`
- Efficient re-renders via Zustand selectors
- Animation optimization with Framer Motion

### 4. Security
- Input validation on all API endpoints
- Rate limiting to prevent abuse
- Security headers via middleware

## File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── game/              # Game page
│   ├── settings/          # Settings page
│   ├── tutorial/          # Tutorial page
│   ├── history/           # Game history page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── game/             # Game components
│   ├── svg/              # SVG components
│   ├── three/            # 3D components
│   └── ui/               # UI primitives
├── hooks/                 # Custom React hooks
└── lib/                   # Core libraries
    ├── game/             # Game engine
    ├── store.ts          # Zustand store
    ├── db.ts             # Prisma client
    ├── logger.ts         # Logging utility
    ├── rateLimit.ts      # Rate limiting
    └── validation.ts     # Input validation
```

## Extensibility

The architecture supports easy extension:

- **New AI Difficulties**: Add to `Difficulty` type and `ai.ts`
- **Alternative Rulesets**: Extend `rules.ts`
- **New UI Themes**: Modify CSS variables
- **Additional Persistence**: Add Prisma models

---

*Architecture Version: 1.0.0*
*Last Updated: November 2024*

