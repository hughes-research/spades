# Security Documentation

## Overview

The Spades application implements multiple layers of security to protect against common web vulnerabilities. This document outlines the security measures, their implementation, and best practices.

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Layers                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐    ┌────────────────────┐              │
│  │   Next.js          │    │   Rate Limiting    │              │
│  │   Middleware       │    │   (In-Memory)      │              │
│  │   (Security        │    │                    │              │
│  │    Headers)        │    │   60 req/min       │              │
│  └────────┬───────────┘    └────────┬───────────┘              │
│           │                         │                           │
│           ▼                         ▼                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │              Input Validation                    │           │
│  │   (Type Guards, Sanitization, Size Limits)      │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │              Logging & Monitoring                │           │
│  │   (Structured Logs, Sensitive Data Masking)     │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Headers

### Middleware Implementation

**File:** `src/middleware.ts`

The middleware adds security headers to all responses:

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set("Content-Security-Policy", cspDirectives);
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // XSS filter
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=()...");

  return response;
}
```

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | 'self' | Default to same-origin only |
| `script-src` | 'self' 'unsafe-inline' 'unsafe-eval' | Allow Next.js scripts |
| `style-src` | 'self' 'unsafe-inline' | Allow Framer Motion styles |
| `img-src` | 'self' data: blob: | Allow SVG data URIs |
| `frame-ancestors` | 'none' | Prevent embedding |

### Path Exclusions

Static files bypass middleware:

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|imgs/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## Rate Limiting

### Implementation

**File:** `src/lib/rateLimit.ts`

In-memory rate limiting protects API endpoints:

```typescript
const RATE_LIMIT_WINDOW_MS = 60 * 1000;  // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;       // 60 requests
const MAX_STORE_SIZE = 10000;             // Prevent memory exhaustion
```

### Algorithm

1. Extract client identifier from request
2. Check request count in current window
3. If under limit, increment and allow
4. If over limit, return 429 response

### Client Identification

```typescript
function getClientIdentifier(request: Request): string {
  // Check X-Forwarded-For (behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  // Check X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  
  // Fallback
  return "anonymous";
}
```

### Response Headers

Successful requests include rate limit info:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1700000000000
```

Rate limited responses:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Remaining: 0
```

### Memory Management

Automatic cleanup prevents memory leaks:

```typescript
// Cleanup runs every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupExpiredEntries(): void {
  // Remove expired entries
  // Enforce max store size
}
```

---

## Input Validation

### Validation Utilities

**File:** `src/lib/validation.ts`

Type-safe validation functions:

```typescript
// Type guards
function isValidDifficulty(value: unknown): value is Difficulty
function isValidStatus(value: unknown): value is string
function isValidWinner(value: unknown): value is string | null
function isValidAnimationSpeed(value: unknown): value is string

// Numeric validation
function isNonNegativeInteger(value: unknown): value is number
function isInteger(value: unknown): value is number

// String validation
function isValidString(value: unknown, maxLength?: number): value is string
```

### Allowed Values

```typescript
export const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const VALID_GAME_STATUSES = ["in_progress", "completed"] as const;
export const VALID_WINNERS = ["you", "ai"] as const;
export const VALID_ANIMATION_SPEEDS = ["slow", "normal", "fast"] as const;
```

### Request Size Limits

```typescript
export const MAX_REQUEST_BODY_SIZE = 1024 * 1024; // 1 MB
export const MAX_JSON_DEPTH = 10;

function validateRequestSize(contentLength: string | null): string | null {
  if (!contentLength) return null;
  
  const size = parseInt(contentLength, 10);
  if (isNaN(size)) return "Invalid Content-Length header";
  if (size > MAX_REQUEST_BODY_SIZE) return "Request body too large";
  
  return null;
}
```

### API Field Sanitization

```typescript
const ALLOWED_UPDATE_FIELDS = new Set([
  "status", "difficulty", "yourTeamScore", "aiTeamScore",
  "yourTeamBags", "aiTeamBags", "winner", "currentRound",
]);

function sanitizeGameUpdates(updates: Record<string, unknown>) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(updates)) {
    if (!ALLOWED_UPDATE_FIELDS.has(key)) continue;
    
    // Type-specific validation
    switch (key) {
      case "difficulty":
        if (!isValidDifficulty(value)) return null;
        break;
      // ... other validations
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}
```

---

## Logging Security

### Implementation

**File:** `src/lib/logger.ts`

Structured logging with sensitive data protection:

```typescript
const sensitiveFields = [
  "password", "token", "secret", 
  "apiKey", "authorization", "cookie"
];

function sanitizeContext(context: Record<string, unknown>) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

### Log Levels

```typescript
type LogLevel = "debug" | "info" | "warn" | "error";

// Production: info and above
// Development: all levels
const MIN_LOG_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug";
```

### Output Formats

**Development (text):**
```
[2024-11-15T10:30:00.000Z] [INFO] Game created {"gameId": "abc123"}
```

**Production (JSON):**
```json
{"timestamp":"2024-11-15T10:30:00.000Z","level":"info","message":"Game created","gameId":"abc123"}
```

---

## Threat Mitigation

### Cross-Site Scripting (XSS)

| Protection | Implementation |
|------------|----------------|
| CSP | Restricts script sources |
| X-XSS-Protection | Browser filter enabled |
| React escaping | Automatic HTML escaping |

### Cross-Site Request Forgery (CSRF)

| Protection | Implementation |
|------------|----------------|
| SameSite cookies | Default browser behavior |
| Origin validation | Implicit via CSP |
| State changes | Require POST/PUT/DELETE |

### Clickjacking

| Protection | Implementation |
|------------|----------------|
| X-Frame-Options | DENY |
| CSP frame-ancestors | 'none' |

### Denial of Service (DoS)

| Protection | Implementation |
|------------|----------------|
| Rate limiting | 60 req/min per IP |
| Request size limits | 1 MB max body |
| Memory management | Store cleanup |

### Injection Attacks

| Protection | Implementation |
|------------|----------------|
| Prisma ORM | Parameterized queries |
| Type validation | Input type guards |
| Field allowlisting | Explicit field sets |

---

## Security Best Practices

### 1. Input Validation

```typescript
// Always validate user input
const body = await request.json();
const { difficulty } = body;

if (!isValidDifficulty(difficulty)) {
  return NextResponse.json(
    { error: "Invalid difficulty value" },
    { status: 400 }
  );
}
```

### 2. Error Handling

```typescript
// Never expose internal errors
try {
  await prisma.game.create({ ... });
} catch (error) {
  logger.error("Failed to create game", { error: String(error) });
  return NextResponse.json(
    { error: "Failed to create game" }, // Generic message
    { status: 500 }
  );
}
```

### 3. Secure Defaults

```typescript
// Default to most restrictive
const game = await prisma.game.create({
  data: {
    difficulty: difficulty || "medium", // Safe default
    status: "in_progress",              // Known state
  },
});
```

### 4. Least Privilege

```typescript
// Only select needed fields
const games = await prisma.game.findMany({
  select: {
    id: true,
    status: true,
    winner: true,
  },
  take: 20, // Limit results
});
```

---

## Security Checklist

### API Routes

- [ ] Rate limiting applied
- [ ] Request size validated
- [ ] Input sanitized
- [ ] Allowed fields whitelisted
- [ ] Errors logged (not exposed)
- [ ] Type validation complete

### Database Operations

- [ ] Using Prisma (parameterized)
- [ ] Field validation before insert
- [ ] Query limits applied
- [ ] Cascade deletes configured

### Headers

- [ ] CSP configured
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] Referrer-Policy set
- [ ] Permissions-Policy set

### Logging

- [ ] Sensitive data masked
- [ ] Appropriate log levels
- [ ] Structured format

---

## Incident Response

### Rate Limit Exceeded

1. Check `X-RateLimit-*` headers
2. Wait for reset time
3. If persistent, investigate abuse

### Validation Errors

1. Check request format
2. Verify field types
3. Review allowed values

### Server Errors

1. Check server logs
2. Review database status
3. Verify environment config

---

## Future Enhancements

### Recommended Additions

1. **Redis Rate Limiting**: For distributed deployments
2. **JWT Authentication**: For user accounts
3. **CORS Configuration**: For API consumers
4. **Audit Logging**: For compliance
5. **WAF Integration**: For production deployment

### Not Required (Current Scope)

- Authentication (single-player game)
- Session management (no user accounts)
- Data encryption at rest (local game data)

---

*Security Documentation Version: 1.0.0*
*Last Updated: November 2024*

