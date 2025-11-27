# Deployment Guide

## Overview

This guide covers deploying the Spades application to various environments, from local development to production hosting.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or pnpm
- Git

## Environment Setup

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./spades.db"

# Logging (optional)
LOG_LEVEL="info"
LOG_FORMAT="json"

# Node environment
NODE_ENV="production"
```

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Development Features

- Hot module replacement
- Turbopack enabled
- Debug logging
- Prisma Studio (`npx prisma studio`)

---

## Production Build

### 1. Build Application

```bash
npm run build
```

This command:
1. Generates Prisma client
2. Compiles TypeScript
3. Bundles React components
4. Optimizes for production

### 2. Start Production Server

```bash
npm start
```

### Build Output

```
.next/
├── cache/         # Build cache
├── server/        # Server-side code
├── static/        # Static assets
└── standalone/    # Standalone output (if configured)
```

---

## Platform Deployments

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Setup

1. Connect GitHub repository
2. Configure environment variables
3. Deploy

#### Configuration

```json
// vercel.json (optional)
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

#### SQLite Considerations

For Vercel, consider using:
- Turso (SQLite edge)
- PlanetScale (MySQL)
- Supabase (PostgreSQL)

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Docker

#### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Database initialization
RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  spades:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prisma/spades.db
      - NODE_ENV=production
    volumes:
      - spades-data:/app/prisma

volumes:
  spades-data:
```

#### Build and Run

```bash
docker build -t spades-game .
docker run -p 3000:3000 spades-game
```

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy

Railway auto-detects Next.js projects.

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
```

---

## Database Migration

### Development

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Production

```bash
# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Database Seeding

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default settings
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      difficulty: 'medium',
      animationSpeed: 'normal',
      showTutorial: true,
    },
  });

  // Create default stats
  await prisma.stats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seeding:

```bash
npx prisma db seed
```

---

## Performance Optimization

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  
  // Bundle analyzer (development)
  experimental: {
    turbo: {
      // Turbopack configuration
    },
  },
};

export default nextConfig;
```

### Caching Headers

Configure in `next.config.ts` or middleware:

```typescript
// Static assets
headers: [
  {
    source: '/imgs/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
]
```

### Database Optimization

For production SQLite:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

---

## Monitoring

### Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

### Logging Configuration

Production logging:

```env
LOG_LEVEL=info
LOG_FORMAT=json
```

### Metrics

Consider integrating:
- Vercel Analytics
- Datadog
- New Relic
- Sentry (error tracking)

---

## Security Hardening

### Production Checklist

- [ ] Environment variables secured
- [ ] Database not exposed publicly
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Error messages sanitized

### HTTPS

Most platforms provide automatic HTTPS. For custom domains:

1. Obtain SSL certificate
2. Configure reverse proxy
3. Enable HSTS

### Firewall Rules

```
Allow: 80, 443 (HTTP/HTTPS)
Block: 5555 (Prisma Studio)
Block: Direct database access
```

---

## Backup Strategy

### Database Backup

```bash
# Manual backup
cp prisma/spades.db backups/spades-$(date +%Y%m%d).db

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cp prisma/spades.db "$BACKUP_DIR/spades-$DATE.db"
find "$BACKUP_DIR" -mtime +7 -delete  # Keep 7 days
```

### Restore

```bash
cp backups/spades-20241115.db prisma/spades.db
npx prisma migrate deploy
```

---

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection

```bash
# Verify database file
ls -la prisma/spades.db

# Regenerate client
npx prisma generate

# Check migrations
npx prisma migrate status
```

#### Memory Issues

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Logs

```bash
# View application logs
npm run start 2>&1 | tee app.log

# Filter errors
grep -i error app.log
```

---

## Rollback Procedure

### Application Rollback

1. Identify last working deployment
2. Revert to previous version
3. Verify functionality

```bash
git checkout <previous-commit>
npm run build
npm start
```

### Database Rollback

```bash
# Restore backup
cp backups/spades-$BACKUP_DATE.db prisma/spades.db

# Verify data
npx prisma studio
```

---

## Scaling Considerations

### Horizontal Scaling

For multiple instances:

1. Use external database (PostgreSQL)
2. Implement Redis for rate limiting
3. Configure load balancer

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Enable caching

### CDN Configuration

For static assets:

```typescript
// next.config.ts
const nextConfig = {
  assetPrefix: 'https://cdn.example.com',
};
```

---

*Deployment Guide Version: 1.0.0*
*Last Updated: November 2024*

