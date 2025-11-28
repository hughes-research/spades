# Troubleshooting Guide

## Overview

This guide helps diagnose and resolve common issues when developing, deploying, or using the Spades application.

---

## Development Issues

### Build Failures

#### Prisma Client Not Generated

**Symptoms:**
```
Error: Cannot find module '@prisma/client'
```

**Solution:**
```bash
npx prisma generate
```

#### TypeScript Compilation Errors

**Symptoms:**
```
Type errors in build output
```

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Migration Issues

**Symptoms:**
```
Migration failed or database locked
```

**Solution:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Or check migration status
npx prisma migrate status
```

---

## Runtime Issues

### Database Connection Errors

**Symptoms:**
```
Error: Can't reach database server
```

**Solutions:**

1. **Check database file exists:**
   ```bash
   ls -la prisma/spades.db
   ```

2. **Verify DATABASE_URL in .env:**
   ```env
   DATABASE_URL="file:./prisma/spades.db"
   ```

3. **Regenerate Prisma client:**
   ```bash
   npx prisma generate
   ```

### API Rate Limiting

**Symptoms:**
```
429 Too Many Requests
```

**Solution:**
- Wait for rate limit window to reset (60 seconds)
- Check `X-RateLimit-Reset` header for exact time
- Reduce request frequency in development

### Game State Issues

**Symptoms:**
- Game state becomes inconsistent
- Cards not displaying correctly
- Scores not updating

**Solutions:**

1. **Clear browser cache and localStorage:**
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

2. **Reset game state:**
   - Navigate to home page
   - Start a new game

3. **Check browser console for errors**

---

## Deployment Issues

### Build Fails on Vercel/Railway

**Symptoms:**
```
Build command failed
```

**Solutions:**

1. **Ensure Prisma generates before build:**
   ```json
   {
     "buildCommand": "prisma generate && next build"
   }
   ```

2. **Check Node.js version:**
   - Ensure Node.js 20+ is specified
   - Update `package.json` engines if needed

3. **Verify environment variables:**
   - `DATABASE_URL` must be set
   - Check platform-specific requirements

### Database Not Persisting

**Symptoms:**
- Data lost after deployment
- Database resets on restart

**Solutions:**

1. **Use persistent storage:**
   - For Docker: Use volumes
   - For Vercel: Consider external database (Turso, PlanetScale)

2. **Check file permissions:**
   ```bash
   chmod 644 prisma/spades.db
   ```

### Static Assets Not Loading

**Symptoms:**
- Card images missing
- SVG icons not displaying

**Solutions:**

1. **Verify public directory structure:**
   ```
   public/
   └── imgs/
       └── *.svg
   ```

2. **Check Next.js config:**
   ```typescript
   // next.config.ts
   images: {
     domains: [],
   }
   ```

---

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Initial load takes > 3 seconds
- Cards render slowly

**Solutions:**

1. **Enable production optimizations:**
   ```bash
   npm run build
   npm start
   ```

2. **Check bundle size:**
   ```bash
   npm run build
   # Check .next/analyze output
   ```

3. **Optimize images:**
   - Ensure SVGs are optimized
   - Consider lazy loading for cards

### Memory Leaks

**Symptoms:**
- Application slows down over time
- Browser becomes unresponsive

**Solutions:**

1. **Check for event listener leaks:**
   - Ensure cleanup in `useEffect` hooks
   - Remove listeners on unmount

2. **Monitor Zustand store:**
   - Check for unnecessary subscriptions
   - Use selectors to limit re-renders

---

## Browser Compatibility

### Features Not Working

**Symptoms:**
- Animations don't play
- Cards don't display

**Solutions:**

1. **Check browser support:**
   - Chrome/Edge: Full support
   - Firefox: Full support
   - Safari: Full support (12+)
   - Mobile browsers: Limited testing

2. **Enable JavaScript:**
   - Ensure JavaScript is enabled
   - Check for ad blockers interfering

### Console Errors

**Symptoms:**
- Errors in browser console
- Warnings about deprecated APIs

**Solutions:**

1. **Update dependencies:**
   ```bash
   npm update
   ```

2. **Check for breaking changes:**
   - Review CHANGELOG.md
   - Check dependency release notes

---

## Common Error Messages

### "Invalid bid value"

**Cause:** Bid outside allowed range (0-13, or -1 for Blind Nil)

**Solution:** Validate bid before submission

### "Card not in hand"

**Cause:** Attempting to play a card that's already been played

**Solution:** Refresh game state or start new game

### "Spades not broken"

**Cause:** Attempting to lead with spades before they're broken

**Solution:** Play a non-spade card first, or wait for spades to be broken

### "Must follow suit"

**Cause:** Attempting to play wrong suit when following

**Solution:** Play a card matching the lead suit

---

## Getting Help

### Debug Mode

Enable detailed logging:

```env
LOG_LEVEL=debug
LOG_FORMAT=text
```

### Check Logs

**Development:**
- Browser console (F12)
- Terminal output

**Production:**
- Platform logs (Vercel, Railway)
- Application logs if configured

### Report Issues

When reporting issues, include:

1. **Environment:**
   - Node.js version
   - Browser and version
   - Operating system

2. **Steps to reproduce:**
   - Detailed steps
   - Expected vs actual behavior

3. **Error messages:**
   - Full error text
   - Stack traces
   - Console logs

4. **Screenshots:**
   - Visual issues
   - Error dialogs

---

## Prevention

### Best Practices

1. **Keep dependencies updated:**
   ```bash
   npm audit
   npm update
   ```

2. **Test before deploying:**
   ```bash
   npm run build
   npm start
   # Test locally
   ```

3. **Monitor production:**
   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Review logs regularly

4. **Backup database:**
   ```bash
   cp prisma/spades.db backups/spades-$(date +%Y%m%d).db
   ```

---

*Troubleshooting Guide Version: 1.0.0*
*Last Updated: November 2024*

