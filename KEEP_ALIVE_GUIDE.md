# 🔄 Keep-Alive Service Guide

## Problem

Render's free tier spins down services after 15 minutes of inactivity. This causes:
- Slow first request (cold start)
- Poor user experience
- Backend appears offline

## Solution

Automatic health check pings every 2 minutes to keep the backend awake.

---

## ✅ Implemented Solutions

### 1. **Frontend Keep-Alive (Automatic)** ⭐ RECOMMENDED

The frontend automatically pings the backend every 2 minutes when users visit your site.

**How it works:**
- When someone visits your website
- Frontend starts pinging `/api/health` every 2 minutes
- Backend stays awake as long as someone is on the site

**Files:**
- `src/utils/keepAlive.ts` - Keep-alive service
- `src/main.ts` - Auto-starts on app load

**Advantages:**
- ✅ No extra setup needed
- ✅ Automatic when users visit
- ✅ No separate service to manage
- ✅ Works in production automatically

**Configuration:**
Already enabled in `src/main.ts`:
```typescript
import { startKeepAlive } from './utils/keepAlive'
startKeepAlive() // Pings every 2 minutes
```

---

### 2. **Standalone Keep-Alive Service (Optional)**

A separate Node.js service that runs 24/7 to keep the backend alive.

**File:** `backend/keepAlive.js`

**Usage:**

```bash
# Run locally
cd backend
npm run keep-alive

# Or specify custom URL
BACKEND_URL=https://your-backend-url.com npm run keep-alive
```

**When to use:**
- If you want backend always ready (even with no visitors)
- For critical applications
- During testing/development

**Where to run:**
- On your local machine (24/7)
- On a separate always-on server
- On Render as a separate background worker

---

## 🚀 Production Setup

### Option A: Frontend Only (FREE) ⭐

**Already configured!** Just deploy:

```bash
npm run build
```

The frontend will automatically keep the backend alive when users visit.

**Pros:**
- ✅ Free
- ✅ No setup needed
- ✅ Already working

**Cons:**
- ⚠️ Backend sleeps if no visitors for 15+ minutes
- ⚠️ First visitor after sleep gets cold start

---

### Option B: Use External Service (FREE)

Use a free monitoring service like **UptimeRobot**:

1. **Sign up:** https://uptimerobot.com/ (Free)
2. **Add Monitor:**
   - Type: HTTP(s)
   - URL: `https://ammafreshghee.onrender.com/api/health`
   - Interval: 5 minutes (free tier)
3. **Done!**

**Pros:**
- ✅ Free
- ✅ Backend always ready
- ✅ Email alerts if down
- ✅ No code changes

**Cons:**
- ⚠️ 5-minute interval (longer than 2 minutes)

---

### Option C: Standalone Service

Run `keepAlive.js` on:

**1. Render Background Worker:**
- Add new service on Render
- Type: Background Worker
- Command: `npm run keep-alive`
- Cost: Extra service (may not be free)

**2. Your Computer (24/7):**
```bash
cd backend
npm run keep-alive
```

Keep terminal open 24/7.

**3. Separate Always-On Server:**
Deploy `keepAlive.js` to any always-on service.

---

## 📊 Comparison

| Method | Cost | Setup | Backend Always Ready? |
|--------|------|-------|----------------------|
| **Frontend Keep-Alive** | FREE | ✅ Done | Only when visitors |
| **UptimeRobot** | FREE | 5 min | ✅ Yes (5min interval) |
| **Standalone Service** | $ or DIY | Medium | ✅ Yes (2min interval) |

---

## 🧪 Testing

### Test Frontend Keep-Alive:

1. Open your website
2. Open browser console (F12)
3. You'll see logs every 2 minutes:
   ```
   ✅ Backend keep-alive ping successful at 10:30:45 AM
   ```

### Test Standalone Service:

```bash
cd backend
npm run keep-alive
```

You'll see:
```
╔════════════════════════════════════════╗
║   🔄 Keep-Alive Service Started       ║
╠════════════════════════════════════════╣
║  Backend: https://ammafreshghee.onrender.com
║  Interval: Every 2 minutes
╚════════════════════════════════════════╝

✅ [10:30:45 AM] Health check OK - 245ms - Status: ok
✅ [10:32:45 AM] Health check OK - 198ms - Status: ok
```

---

## 🔧 Configuration

### Change Ping Interval:

**Frontend** (`src/utils/keepAlive.ts`):
```typescript
const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
// Change to 1 minute:
const PING_INTERVAL = 1 * 60 * 1000; // 1 minute
```

**Backend** (`backend/keepAlive.js`):
```javascript
const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
```

### Change Backend URL:

**Frontend** (`src/utils/keepAlive.ts`):
```typescript
const BACKEND_URL = 'https://your-backend.com';
```

**Standalone** (environment variable):
```bash
BACKEND_URL=https://your-backend.com npm run keep-alive
```

---

## ⚠️ Important Notes

### Render Free Tier Limits:
- 750 hours/month for free services
- Keep-alive pings count as activity
- Monitor your usage on Render dashboard

### Best Practice:
1. **Use frontend keep-alive** (already enabled) ✅
2. **Add UptimeRobot** for 24/7 monitoring
3. **Upgrade to paid tier** if you need guaranteed uptime

### Cold Start Times:
- Without keep-alive: 10-30 seconds first request
- With keep-alive: < 1 second (backend always ready)

---

## 🎯 Recommended Setup

**For Most Cases:**
1. ✅ Frontend keep-alive (already enabled)
2. ✅ UptimeRobot monitoring (5 minutes)
3. ✅ Total cost: FREE

**For Critical Apps:**
1. Upgrade to Render paid tier ($7/month)
2. No sleep, guaranteed uptime
3. No keep-alive needed

---

## 📝 Status

**Currently Enabled:**
- ✅ Frontend keep-alive service (2-minute interval)
- ✅ Standalone service available (`npm run keep-alive`)
- ✅ Ready for production

**To Enable UptimeRobot:**
1. Go to https://uptimerobot.com/
2. Sign up (free)
3. Add monitor for your health endpoint
4. Done!

---

## 🆘 Troubleshooting

### Backend still sleeping?

**Check:**
1. Is frontend keep-alive running? (Check console logs)
2. Browser console errors?
3. Backend health endpoint working? Visit: https://ammafreshghee.onrender.com/api/health

### Keep-alive not working?

**Solutions:**
1. Clear browser cache
2. Check CORS on backend
3. Verify backend URL is correct
4. Check browser console for errors

### High Render usage?

**Options:**
1. Increase ping interval (3-5 minutes)
2. Stop standalone service if running
3. Rely only on UptimeRobot
4. Upgrade to paid tier

---

**Your backend is now configured to stay alive! 🎉**

The frontend automatically keeps it awake when users visit your site.

