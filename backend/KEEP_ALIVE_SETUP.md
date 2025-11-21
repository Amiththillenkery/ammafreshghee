# 🔄 Keep-Alive Service - Free Tier Solution

## ✅ **What This Does**

Keeps your **database and backend server active** on free-tier hosting by updating a counter every 3 minutes.

**Perfect for:**
- Render.com free tier
- Supabase free tier
- Heroku free tier
- Any hosting that sleeps after inactivity

---

## 📋 **How It Works**

```
Every 3 minutes:
    ↓
Update counter in database
    ↓
Counter: 1 → 2 → 3 → ... → 99 → 100 → RESET to 1
    ↓
Database stays active ✅
Server stays active ✅
```

---

## 🗄️ **Database Table**

### **Table: `keep_alive`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `count` | INTEGER | Counter (1-100, then resets) |
| `last_updated` | TIMESTAMP | Last update time |

### **Sample Data:**

```sql
id | count | last_updated
---|-------|-------------------------
 1 |   47  | 2025-01-20 10:33:00
```

---

## 🔧 **Implementation**

### **Files Created:**

1. **`keepAliveService.js`** - The service that updates the counter
2. **Updated `database.js`** - Added keep_alive table
3. **Updated `server.js`** - Starts service on server start

---

## 🚀 **What Happens**

### **On Server Start:**

```
╔════════════════════════════════════════╗
║   🔄 Keep-Alive Service Started      ║
╠════════════════════════════════════════╣
║  Update Frequency: Every 3 minutes    ║
║  Max Count: 100                        ║
║  Purpose: Prevent DB/Server sleep     ║
╚════════════════════════════════════════╝
```

### **Every 3 Minutes:**

```
⏰ Keep-alive: Counter updated to 47/100 at 10:33:00 AM
⏰ Keep-alive: Counter updated to 48/100 at 10:36:00 AM
⏰ Keep-alive: Counter updated to 49/100 at 10:39:00 AM
...
⏰ Keep-alive: Counter updated to 100/100 at 2:30:00 PM
⏰ Keep-alive: Counter RESET to 1/100 at 2:33:00 PM
```

---

## 📊 **Monitor Status**

### **Health Check API:**

```bash
GET https://ammafreshghee.onrender.com/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Amma Fresh API is running",
  "timestamp": "2025-01-20T10:33:00.000Z",
  "keepAlive": {
    "active": true,
    "count": 47,
    "maxCount": 100,
    "lastUpdated": "2025-01-20T10:33:00.000Z",
    "minutesSinceUpdate": 0,
    "nextUpdateIn": 3,
    "isHealthy": true
  }
}
```

---

## ✅ **Benefits**

### **Prevents:**
- ❌ Database sleeping (free tier timeout)
- ❌ Server sleeping (inactivity timeout)
- ❌ Cold starts (slow first requests)
- ❌ Connection timeouts

### **Ensures:**
- ✅ Database stays warm
- ✅ Server stays active
- ✅ Fast response times
- ✅ No manual intervention needed

---

## 🎯 **Configuration**

### **Default Settings:**

```javascript
updateFrequency: 3 minutes
maxCount: 100
```

### **To Change (if needed):**

Edit `keepAliveService.js`:

```javascript
// Change update frequency (in minutes)
this.updateFrequency = 5 * 60 * 1000; // 5 minutes

// Change max count before reset
this.maxCount = 200; // Reset at 200 instead of 100
```

---

## 🔍 **Checking It Works**

### **Method 1: Check Logs**

On Render dashboard → Logs → Look for:

```
⏰ Keep-alive: Counter updated to X/100 at HH:MM:SS
```

Should appear every 3 minutes.

### **Method 2: Check Database**

```sql
SELECT * FROM keep_alive;
```

Should show increasing count and recent timestamp.

### **Method 3: Check Health API**

```bash
curl https://ammafreshghee.onrender.com/api/health
```

Should show `keepAlive.isHealthy: true`

---

## 🐛 **Troubleshooting**

### **Problem: No keep-alive logs**

**Check:**
1. Server started successfully?
2. Database connection working?
3. `keep_alive` table created?

**Solution:**
```bash
# Check if table exists
SELECT * FROM keep_alive;

# If not, server will create it on next restart
```

### **Problem: Count not updating**

**Check:**
```bash
# Look at health endpoint
curl https://ammafreshghee.onrender.com/api/health
```

If `keepAlive.isHealthy: false`, database might be down.

### **Problem: Server still sleeps**

**Possible causes:**
- Free tier limits exceeded
- Server crashes (check logs)
- Database connection issues

**Solution:**
- Check Render free tier limits
- Check for error logs
- Verify database credentials

---

## 💰 **Cost & Resources**

### **Database Impact:**
- **Storage:** ~1KB (one row)
- **Queries:** ~480 per day (every 3 min)
- **Cost:** FREE ✅ (well within free tier limits)

### **Server Impact:**
- **CPU:** Negligible (~0.1% every 3 min)
- **Memory:** ~1MB
- **Network:** Minimal
- **Cost:** FREE ✅

---

## 📊 **Activity Pattern**

```
00:00 - Count: 1    (Start of day)
00:03 - Count: 2
00:06 - Count: 3
...
05:00 - Count: 100  (5 hours = 100 updates)
05:03 - Count: 1    (Reset)
...
(Continues 24/7)
```

**Daily Stats:**
- Updates per day: ~480
- Resets per day: ~4-5
- Database writes: ~480
- Zero manual intervention ✅

---

## 🎓 **How This Helps Free Tier**

### **Render.com Free Tier:**
```
Sleeps after 15 minutes of inactivity
    ↓
Keep-alive updates every 3 minutes
    ↓
Server never sleeps! ✅
```

### **Supabase Free Tier:**
```
Pauses after 1 week of inactivity
    ↓
Keep-alive queries every 3 minutes
    ↓
Database never pauses! ✅
```

---

## 🔄 **Auto-Restart**

Service automatically:
- ✅ Starts when server starts
- ✅ Stops when server stops (graceful shutdown)
- ✅ Creates table if doesn't exist
- ✅ Initializes counter if needed
- ✅ Handles errors without crashing server

---

## 📝 **SQL Queries Used**

### **Create Table:**
```sql
CREATE TABLE IF NOT EXISTS keep_alive (
  id SERIAL PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Update Counter:**
```sql
UPDATE keep_alive 
SET count = $1, last_updated = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### **Check Status:**
```sql
SELECT count, last_updated 
FROM keep_alive 
WHERE id = 1;
```

---

## ✅ **Deployment Checklist**

- [x] `keepAliveService.js` created
- [x] `database.js` updated (table schema)
- [x] `server.js` updated (service integration)
- [x] Graceful shutdown handlers added
- [x] Health check includes keep-alive status
- [ ] Deploy to Render ⏳
- [ ] Verify logs show updates ⏳
- [ ] Check health endpoint ⏳

---

## 🎉 **Summary**

**What you get:**
- ✅ Database stays active (no sleep)
- ✅ Server stays active (no sleep)
- ✅ Fast response times (no cold starts)
- ✅ Zero cost (within free tier)
- ✅ Zero maintenance (automatic)

**What it does:**
- Updates counter every 3 minutes
- Resets at 100
- Logs activity
- Reports health status

**Result:** Your free-tier hosting works like paid hosting! 🚀

---

## 🚀 **Deploy Now**

```bash
git add backend/keepAliveService.js backend/database.js backend/server.js
git commit -m "Add: Keep-alive service for free tier"
git push
```

**Render will:**
1. Deploy automatically
2. Create `keep_alive` table
3. Start updating every 3 minutes
4. Keep your app alive 24/7 ✅

---

**Your server will stay awake! 🔄**

