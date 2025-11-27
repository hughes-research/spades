# Components Documentation

## Overview

The Spades application uses a modular component architecture built with React 19 and TypeScript. Components are organized by function: game-specific, SVG graphics, 3D rendering, and reusable UI primitives.

## Component Organization

```
src/components/
├── game/              # Game-specific components
│   ├── index.ts       # Barrel exports
│   ├── BidSelector.tsx
│   ├── Card.tsx
│   ├── CardFace.tsx
│   ├── GameOverModal.tsx
│   ├── GameStatusOverlay.tsx
│   ├── GameTable.tsx
│   ├── Hand.tsx
│   ├── PlayerLabel.tsx
│   ├── RoundEndModal.tsx
│   ├── Scoreboard.tsx
│   ├── ScoreDisplay.tsx
│   ├── TopBar.tsx
│   └── TrickArea.tsx
├── svg/               # SVG-based graphics
│   ├── index.ts
│   ├── CardSVG.tsx
│   ├── Logo.tsx
│   └── SuitIcon.tsx
├── three/             # 3D rendering (Three.js)
│   ├── index.ts
│   ├── Card3D.tsx
│   ├── CardCanvas.tsx
│   └── TextureGenerator.ts
└── ui/                # Reusable UI primitives
    ├── index.ts
    ├── Breadcrumbs.tsx
    └── Button.tsx
```

---

## Game Components

### GameTable

**File:** `src/components/game/GameTable.tsx`

The main game orchestrator component that manages the entire game UI.

```typescript
interface GameTableProps {}

export const GameTable: React.FC = () => { ... }
```

**Responsibilities:**
- Renders the poker table layout
- Manages player positions (North, South, East, West)
- Orchestrates AI turns via `useEffect`
- Handles bid selection and card play
- Displays overlays for various game phases

**Key Features:**
- Memoized with `memo()` for performance
- Subscribes to Zustand store for state
- Coordinates hint system
- Auto-advances rounds

**Usage:**
```tsx
import { GameTable } from "@/components/game";

function GamePage() {
  return <GameTable />;
}
```

---

### Hand

**File:** `src/components/game/Hand.tsx`

Renders a player's hand of cards with position-specific layouts.

```typescript
interface HandProps {
  cards: CardType[];
  validPlays?: CardType[];
  isCurrentPlayer?: boolean;
  isHuman?: boolean;
  position: "south" | "west" | "north" | "east";
  onPlayCard?: (card: CardType) => void;
  showCards?: boolean;
  size?: "sm" | "md" | "lg";
}
```

**Layouts by Position:**

| Position | Layout | Card Display |
|----------|--------|--------------|
| South (Human) | Fan spread, large | Face up |
| North (Partner) | Horizontal stack | Face down |
| East/West | Vertical stack | Face down |

**Animation:**
- Entry animation with staggered delays
- Hover lift effect for playable cards
- Spring physics for natural feel

**Usage:**
```tsx
<Hand
  cards={player.hand}
  validPlays={validPlays}
  isCurrentPlayer={isMyTurn}
  isHuman={true}
  position="south"
  onPlayCard={handlePlay}
  size="lg"
/>
```

---

### Card

**File:** `src/components/game/Card.tsx`

Individual card component with 3D effects and animations.

```typescript
interface CardProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
  total?: number;
  size?: "sm" | "md" | "lg";
  animationDelay?: number;
  className?: string;
  force2D?: boolean;
}
```

**Size Map:**

| Size | Width | Height |
|------|-------|--------|
| sm | 60px | 84px |
| md | 80px | 112px |
| lg | 105px | 147px |

**Features:**
- Multi-layer drop shadows for depth
- Selection glow animation
- Specular highlight effect
- Playable indicator on hover
- Spring-based motion

**Animation Variants:**
```typescript
const cardVariants = {
  initial: { opacity: 0, y: 50, rotateY: 180, scale: 0.8 },
  animate: { opacity: 1, y: 0, rotateY: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5 },
  hover: { y: -20, rotateX: 5, scale: 1.08 },
  tap: { scale: 0.95 },
  disabled: { opacity: 0.5, filter: "grayscale(50%)" },
};
```

---

### CardFace

**File:** `src/components/game/CardFace.tsx`

Wrapper for CardSVG that handles sizing.

```typescript
interface CardFaceProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  width?: number;
  height?: number;
  className?: string;
}
```

---

### BidSelector

**File:** `src/components/game/BidSelector.tsx`

Interactive bidding interface for the human player.

```typescript
interface BidSelectorProps {
  onBid: (bid: number) => void;
  partnerBid: number | null;
  disabled?: boolean;
  playerHand?: Card[];
}
```

**Features:**
- Special bid buttons (Nil, Blind Nil)
- Numbered bid grid (1-13)
- Partner bid display
- Team total calculation
- Warning for overbids (>13)
- Hint system integration
- Confirmation dialog

**Bid Types:**

| Button | Value | Description |
|--------|-------|-------------|
| Blind Nil | -1 | Before seeing cards |
| Nil | 0 | Bid zero tricks |
| 1-13 | 1-13 | Standard bid |

---

### TrickArea

**File:** `src/components/game/TrickArea.tsx`

Displays the current trick in the center of the table.

```typescript
interface TrickAreaProps {
  currentTrick: Trick | null;
  lastTrickWinner?: PlayerPosition;
}
```

**Card Positions:**
- Cards arranged in cardinal directions
- Position offset based on player

---

### PlayerLabel

**File:** `src/components/game/PlayerLabel.tsx`

Displays player information during gameplay.

```typescript
interface PlayerLabelProps {
  name: string;
  bid: number | null;
  tricks: number;
  isCurrentPlayer: boolean;
  isHuman?: boolean;
}
```

**Displays:**
- Player name
- Current bid
- Tricks won
- Active turn indicator

---

### ScoreDisplay

**File:** `src/components/game/ScoreDisplay.tsx`

Compact score display for the top bar.

```typescript
interface ScoreDisplayProps {
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
  roundNumber: number;
}
```

---

### TopBar

**File:** `src/components/game/TopBar.tsx`

Navigation and action bar during gameplay.

```typescript
interface TopBarProps {
  children?: React.ReactNode;
  onHint?: () => void;
}
```

**Actions:**
- Back to menu
- Get hint button
- Score display slot

---

### GameStatusOverlay

**File:** `src/components/game/GameStatusOverlay.tsx`

Overlay components for various game states.

**Components:**
- `HintDisplay` - Shows suggested card
- `WaitingForBidOverlay` - AI bidding indicator
- `AIThinkingOverlay` - AI play indicator

---

### RoundEndModal

**File:** `src/components/game/RoundEndModal.tsx`

Modal showing round summary.

```typescript
interface RoundEndModalProps {
  roundNumber: number;
  playerTeamScore: TeamScore;
  opponentTeamScore: TeamScore;
}
```

---

### GameOverModal

**File:** `src/components/game/GameOverModal.tsx`

End game modal with final results.

```typescript
interface GameOverModalProps {
  isOpen: boolean;
  winner: Team | null;
  playerScore: TeamScore;
  opponentScore: TeamScore;
  onPlayAgain: () => void;
}
```

---

## SVG Components

### CardSVG

**File:** `src/components/svg/CardSVG.tsx`

Complete SVG card rendering with pip layouts.

```typescript
interface CardSVGProps {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  className?: string;
  width?: number;
  height?: number;
}
```

**Features:**
- Custom SVG filters (shadows, gradients)
- Pip layout for number cards
- Face card designs (J, Q, K)
- Card back pattern
- Glossy highlight overlay

**Pip Positions:**
Defined for each rank with x/y percentages and flip flags.

---

### SuitIcon

**File:** `src/components/svg/SuitIcon.tsx`

Individual suit symbol rendering.

```typescript
type Suit = "spades" | "hearts" | "diamonds" | "clubs";

interface SuitIconProps {
  suit: Suit;
  size?: number;
  className?: string;
}
```

**Exports:**
- `Suit` type
- `suitPaths` - SVG path data
- `suitColors` - Color mapping

**Colors:**

| Suit | Color |
|------|-------|
| Spades | #1a1a2e |
| Hearts | #e63946 |
| Diamonds | #e63946 |
| Clubs | #1a1a2e |

---

### Logo

**File:** `src/components/svg/Logo.tsx`

Animated game logo with suit symbols.

```typescript
interface LogoProps {
  size?: number;
  animated?: boolean;
}
```

---

## UI Components

### Button

**File:** `src/components/ui/Button.tsx`

Styled button with variants.

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Variants:**

| Variant | Style |
|---------|-------|
| primary | Gold background, dark text |
| secondary | Transparent, gold border |
| ghost | No background, subtle hover |
| danger | Red accent |

---

### Breadcrumbs

**File:** `src/components/ui/Breadcrumbs.tsx`

Navigation breadcrumb trail.

```typescript
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}
```

**Usage:**
```tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Settings" },
  ]}
/>
```

---

## Three.js Components

### Card3D

**File:** `src/components/three/Card3D.tsx`

3D card mesh for future enhancement.

### CardCanvas

**File:** `src/components/three/CardCanvas.tsx`

React Three Fiber canvas wrapper.

### TextureGenerator

**File:** `src/components/three/TextureGenerator.ts`

Utility for generating card textures.

---

## Animation Patterns

### Spring Physics

Most animations use Framer Motion spring physics:

```typescript
transition: {
  type: "spring",
  stiffness: 300,
  damping: 25,
}
```

### Staggered Entry

Lists use staggered animations:

```typescript
transition={{ delay: index * 0.05 }}
```

### AnimatePresence

For enter/exit animations:

```tsx
<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

---

## Performance Optimization

### Memoization

All game components use `memo()`:

```typescript
export const Card = memo(function Card(props) {
  // ...
});
```

### Selective Re-renders

Use Zustand selectors:

```typescript
// Only re-render when phase changes
const phase = useGameStore((s) => s.phase);
```

### Lazy Loading

Components can be lazy loaded:

```typescript
const GameTable = lazy(() => import("@/components/game/GameTable"));
```

---

## Styling

### CSS Variables

Components use CSS custom properties:

```typescript
style={{ fontFamily: "var(--font-cinzel)" }}
style={{ color: "var(--gold)" }}
```

### Tailwind Classes

Combined with Tailwind utilities:

```tsx
<div className="glass-panel p-4 rounded-xl">
```

### Conditional Classes

Dynamic styling:

```tsx
className={`
  ${isActive ? "bg-gold text-black" : "bg-transparent"}
  ${isDisabled ? "opacity-50" : "opacity-100"}
`}
```

---

## Accessibility

### ARIA Labels

```tsx
<svg aria-label={`${rank} of ${suit}`}>
```

### Keyboard Navigation

Buttons are focusable and respond to Enter/Space.

### Color Contrast

Text meets WCAG AA contrast requirements.

---

*Components Version: 1.0.0*
*Last Updated: November 2024*

