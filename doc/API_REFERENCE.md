# API Reference

## Overview

The Spades application provides a RESTful API for game management, settings persistence, and player statistics. All endpoints are protected by rate limiting and security headers.

## Base URL

```
/api
```

## Authentication

Currently, the API does not require authentication. All game data is stored locally per client.

## Rate Limiting

All endpoints are subject to rate limiting:

| Parameter | Value |
|-----------|-------|
| Window | 60 seconds |
| Max Requests | 60 per window |
| Response Headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

### Rate Limit Response

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

HTTP Status: `429 Too Many Requests`

---

## Game Endpoints

### List Games

Retrieves recent games ordered by creation date.

```http
GET /api/game
```

#### Response

```json
[
  {
    "id": "clm1234567890",
    "createdAt": "2024-11-15T10:30:00Z",
    "updatedAt": "2024-11-15T10:45:00Z",
    "status": "completed",
    "difficulty": "medium",
    "yourTeamScore": 520,
    "aiTeamScore": 380,
    "yourTeamBags": 3,
    "aiTeamBags": 5,
    "winner": "you",
    "currentRound": 8
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique game identifier (CUID) |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last update timestamp |
| `status` | string | `"in_progress"` or `"completed"` |
| `difficulty` | string | `"easy"`, `"medium"`, or `"hard"` |
| `yourTeamScore` | number | Player team's cumulative score |
| `aiTeamScore` | number | AI team's cumulative score |
| `yourTeamBags` | number | Player team's bag count |
| `aiTeamBags` | number | AI team's bag count |
| `winner` | string | `"you"`, `"ai"`, or `null` |
| `currentRound` | number | Current round number |

---

### Create Game

Creates a new game record.

```http
POST /api/game
```

#### Request Body

```json
{
  "difficulty": "medium"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `difficulty` | string | No | `"medium"` | AI difficulty level |

#### Response

```json
{
  "id": "clm1234567890",
  "createdAt": "2024-11-15T10:30:00Z",
  "updatedAt": "2024-11-15T10:30:00Z",
  "status": "in_progress",
  "difficulty": "medium",
  "yourTeamScore": 0,
  "aiTeamScore": 0,
  "yourTeamBags": 0,
  "aiTeamBags": 0,
  "winner": null,
  "currentRound": 1
}
```

HTTP Status: `200 OK`

#### Errors

| Status | Condition |
|--------|-----------|
| `400` | Invalid difficulty value |
| `413` | Request body too large |
| `500` | Database error |

---

### Update Game

Updates an existing game's state.

```http
PUT /api/game
```

#### Request Body

```json
{
  "id": "clm1234567890",
  "status": "completed",
  "yourTeamScore": 520,
  "aiTeamScore": 380,
  "winner": "you"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Game identifier |
| `status` | string | No | Game status |
| `difficulty` | string | No | Difficulty level |
| `yourTeamScore` | number | No | Player team score |
| `aiTeamScore` | number | No | AI team score |
| `yourTeamBags` | number | No | Player team bags |
| `aiTeamBags` | number | No | AI team bags |
| `winner` | string | No | Game winner |
| `currentRound` | number | No | Current round |

#### Response

```json
{
  "id": "clm1234567890",
  "createdAt": "2024-11-15T10:30:00Z",
  "updatedAt": "2024-11-15T10:45:00Z",
  "status": "completed",
  "difficulty": "medium",
  "yourTeamScore": 520,
  "aiTeamScore": 380,
  "yourTeamBags": 3,
  "aiTeamBags": 5,
  "winner": "you",
  "currentRound": 8
}
```

#### Side Effects

When updating `status` to `"completed"` with a `winner`:
- Player statistics are automatically updated
- Win streak is calculated

#### Errors

| Status | Condition |
|--------|-----------|
| `400` | Missing or invalid game ID |
| `400` | Invalid update data |
| `400` | No valid fields to update |
| `413` | Request body too large |
| `500` | Database error |

---

## Settings Endpoints

### Get Settings

Retrieves global application settings.

```http
GET /api/settings
```

#### Response

```json
{
  "id": "global",
  "difficulty": "medium",
  "animationSpeed": "normal",
  "showTutorial": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Always `"global"` |
| `difficulty` | string | Default difficulty for new games |
| `animationSpeed` | string | `"slow"`, `"normal"`, or `"fast"` |
| `showTutorial` | boolean | Show tutorial for new players |

---

### Update Settings

Updates global application settings.

```http
POST /api/settings
```

#### Request Body

```json
{
  "difficulty": "hard",
  "animationSpeed": "fast",
  "showTutorial": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `difficulty` | string | No | Default difficulty |
| `animationSpeed` | string | No | Animation speed preference |
| `showTutorial` | boolean | No | Tutorial visibility |

#### Response

```json
{
  "id": "global",
  "difficulty": "hard",
  "animationSpeed": "fast",
  "showTutorial": false
}
```

#### Errors

| Status | Condition |
|--------|-----------|
| `400` | Invalid field values |
| `413` | Request body too large |
| `500` | Database error |

---

## Statistics Endpoints

### Get Statistics

Retrieves player statistics.

```http
GET /api/stats
```

#### Response

```json
{
  "id": "global",
  "gamesPlayed": 42,
  "gamesWon": 28,
  "gamesLost": 14,
  "totalRounds": 320,
  "highScore": 645,
  "winStreak": 3,
  "bestStreak": 7
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Always `"global"` |
| `gamesPlayed` | number | Total games completed |
| `gamesWon` | number | Games won by player |
| `gamesLost` | number | Games lost to AI |
| `totalRounds` | number | Total rounds played |
| `highScore` | number | Highest score achieved |
| `winStreak` | number | Current winning streak |
| `bestStreak` | number | Best winning streak ever |

---

### Update Statistics

Manually updates player statistics (usually handled automatically).

```http
POST /api/stats
```

#### Request Body

```json
{
  "gamesPlayed": 43,
  "gamesWon": 29,
  "highScore": 680
}
```

#### Response

Updated statistics object.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `413` | Payload Too Large - Body exceeds 1MB |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error - Database/server issue |

---

## Security Headers

All API responses include security headers:

```http
Content-Security-Policy: default-src 'self'...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()...
```

---

## Data Validation

### Allowed Values

| Field | Allowed Values |
|-------|---------------|
| `difficulty` | `"easy"`, `"medium"`, `"hard"` |
| `status` | `"in_progress"`, `"completed"` |
| `winner` | `"you"`, `"ai"`, `null` |
| `animationSpeed` | `"slow"`, `"normal"`, `"fast"` |

### Numeric Constraints

| Field | Constraint |
|-------|-----------|
| Scores | Integer (can be negative) |
| Bags | Non-negative integer |
| Round | Positive integer |

### Request Size

Maximum request body size: **1 MB**

---

## Examples

### Complete Game Flow

```javascript
// 1. Create new game
const createResponse = await fetch('/api/game', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ difficulty: 'medium' }),
});
const game = await createResponse.json();

// 2. Update game progress
await fetch('/api/game', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: game.id,
    yourTeamScore: 280,
    aiTeamScore: 150,
    currentRound: 4,
  }),
});

// 3. Complete game
await fetch('/api/game', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: game.id,
    status: 'completed',
    yourTeamScore: 520,
    aiTeamScore: 480,
    winner: 'you',
  }),
});

// 4. Check updated stats
const statsResponse = await fetch('/api/stats');
const stats = await statsResponse.json();
```

---

*API Version: 1.0.0*
*Last Updated: November 2024*

