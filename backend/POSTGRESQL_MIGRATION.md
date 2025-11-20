# 🐘 PostgreSQL Migration Guide

## Overview

This guide will help you migrate from SQLite to PostgreSQL.

---

## 📋 Prerequisites

1. **PostgreSQL Database** - Get one from:
   - **Render** (Free tier available): https://render.com/
   - **Supabase** (Free tier): https://supabase.com/
   - **Neon** (Free tier): https://neon.tech/
   - **ElephantSQL** (Free tier): https://www.elephantsql.com/
   - **Railway** (Free trial): https://railway.app/

2. **Node.js PostgreSQL Driver:**
   ```bash
   cd backend
   npm install pg
   ```

---

## 🚀 Quick Migration Steps

### Step 1: Install PostgreSQL Driver

```bash
cd backend
npm install pg
```

### Step 2: Get Your Database URL

Your PostgreSQL connection string looks like:
```
postgresql://user:password@host:port/database
```

Example from Render:
```
postgresql://amma_user:abc123@oregon-postgres.render.com/amma_fresh_db
```

### Step 3: Update Environment Variables

Add to `backend/.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Or for Render:
# DATABASE_URL=postgresql://amma_user:abc123@oregon-postgres.render.com/amma_fresh_db

# Other existing variables
PORT=3000
NODE_ENV=production
ADMIN_API_KEY=your-secret-admin-key
# ... rest of your config
```

### Step 4: Choose Migration Method

#### Option A: Automatic Migration (Recommended)

Use the new `databasePostgres.js` file:

**1. Rename files:**
```bash
# Backup SQLite version
mv backend/database.js backend/database.sqlite.backup.js

# Use PostgreSQL version
mv backend/databasePostgres.js backend/database.js
```

**2. Update server.js imports:**

No changes needed! The imports stay the same:
```javascript
import db, { initializeDatabase, seedProducts } from './database.js';
```

**3. Restart server:**
```bash
npm start
```

Done! ✅

#### Option B: Manual Migration (SQL File)

If you prefer running SQL directly:

**1. Run the migration SQL:**

Connect to your PostgreSQL database and run:
```bash
psql $DATABASE_URL -f migrations/postgresql_schema.sql
```

Or use a GUI tool (pgAdmin, DBeaver, TablePlus) to run the SQL from:
`backend/migrations/postgresql_schema.sql`

**2. Then follow Option A steps above**

---

## 📊 Database Comparison

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| **Type** | File-based | Client-server |
| **Concurrency** | Limited | Excellent |
| **Scalability** | Small apps | Enterprise-ready |
| **Deployment** | File on disk | Cloud database |
| **ACID** | ✅ Yes | ✅ Yes |
| **Triggers** | Basic | Advanced |
| **Best For** | Development | Production |

---

## 🔄 Schema Differences

### Data Types Mapping:

| SQLite | PostgreSQL |
|--------|-----------|
| `INTEGER` | `INTEGER` |
| `REAL` | `DECIMAL(10,2)` |
| `TEXT` | `VARCHAR` or `TEXT` |
| `DATETIME` | `TIMESTAMP` |
| `AUTOINCREMENT` | `SERIAL` |

### Auto-increment:

**SQLite:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

### Updated_at Trigger:

**SQLite:**
```sql
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

**PostgreSQL:**
```sql
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- Plus trigger function:
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 Testing Migration

### 1. Check Connection:

```bash
# In backend directory
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Error:', err);
  else console.log('✅ Connected! Time:', res.rows[0].now);
  pool.end();
});
"
```

### 2. Verify Tables:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show: products, orders, order_items
```

### 3. Check Data:

```sql
-- Count products
SELECT COUNT(*) as product_count FROM products;

-- Should show: 6 products

-- View products
SELECT id, name, grams, price FROM products ORDER BY grams;
```

### 4. Test API:

```bash
# Health check
curl https://ammafreshghee.onrender.com/api/health

# Get products
curl https://ammafreshghee.onrender.com/api/products
```

---

## 🔧 Code Changes Required

### No Changes Needed! ✅

The new `databasePostgres.js` maintains the same API:

**Before (SQLite):**
```javascript
const products = db.prepare('SELECT * FROM products').all();
```

**After (PostgreSQL):**
```javascript
const products = await db.all('SELECT * FROM products');
```

Both work the same in your server code!

---

## 🆘 Troubleshooting

### "Connection refused"

**Problem:** Can't connect to database

**Solutions:**
1. Check `DATABASE_URL` is correct
2. Verify database is running
3. Check firewall/network settings
4. Whitelist your IP (if required)

### "SSL required"

**Problem:** Database requires SSL

**Solution:** Already handled in code:
```javascript
ssl: process.env.NODE_ENV === 'production' ? {
  rejectUnauthorized: false
} : false
```

### "Table already exists"

**Problem:** Tables from previous migration

**Solution:** Drop and recreate:
```sql
DROP TABLE IF EXISTS order_items, orders, products CASCADE;
```

Then run migration again.

### "Cannot find module 'pg'"

**Problem:** PostgreSQL driver not installed

**Solution:**
```bash
cd backend
npm install pg
```

---

## 📦 Package.json Updates

Already added to scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "keep-alive": "node keepAlive.js",
    "migrate": "psql $DATABASE_URL -f migrations/postgresql_schema.sql"
  },
  "dependencies": {
    "pg": "^8.11.3",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.2.2",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.7"
  }
}
```

---

## 🔐 Security Best Practices

1. **Never commit DATABASE_URL**
   - Already in `.gitignore` ✅

2. **Use strong passwords**
   - Generated by hosting provider ✅

3. **Enable SSL in production**
   - Already configured ✅

4. **Regular backups**
   - Most providers auto-backup
   - Manual backup: `pg_dump $DATABASE_URL > backup.sql`

5. **Monitor connections**
   - Use connection pooling (already set up)
   - Close connections properly

---

## 🚀 Deployment to Render

### 1. Create PostgreSQL Database:

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Name: `amma-fresh-db`
4. Plan: Free
5. Click "Create Database"

### 2. Get Connection String:

1. Click on your database
2. Scroll to "Connections"
3. Copy "External Database URL"

### 3. Add to Backend Service:

1. Go to your backend service
2. Environment → Add Variable
3. Key: `DATABASE_URL`
4. Value: (paste the connection string)
5. Save

### 4. Deploy:

Render will auto-deploy with PostgreSQL!

---

## 📊 Performance Tips

1. **Use Connection Pooling** ✅ (already enabled)
2. **Create Indexes** ✅ (already created)
3. **Use Prepared Statements** ✅ (using parameterized queries)
4. **Monitor Slow Queries**
5. **Regular VACUUM** (PostgreSQL maintenance)

---

## 🔄 Rollback Plan

If you need to revert to SQLite:

```bash
# Restore backup
mv backend/database.sqlite.backup.js backend/database.js

# Restart server
npm start
```

Your SQLite database file (`amma-fresh.db`) remains untouched!

---

## ✅ Migration Checklist

- [ ] PostgreSQL database created
- [ ] `pg` package installed
- [ ] `DATABASE_URL` added to `.env`
- [ ] Backup SQLite database file
- [ ] Run migration SQL or use new database.js
- [ ] Test database connection
- [ ] Verify tables created
- [ ] Verify products seeded
- [ ] Test API endpoints
- [ ] Update Render environment variables
- [ ] Deploy to production
- [ ] Monitor logs for errors
- [ ] Test live site

---

## 📚 Files Created

1. **`backend/migrations/postgresql_schema.sql`**
   - Complete database schema
   - Indexes and triggers
   - Seed data

2. **`backend/databasePostgres.js`**
   - PostgreSQL database module
   - Drop-in replacement for database.js
   - Same API, works with existing code

3. **`backend/POSTGRESQL_MIGRATION.md`**
   - This file! Complete migration guide

---

## 🎯 Why Migrate?

**Benefits of PostgreSQL:**
- ✅ Better for production
- ✅ Handles concurrent requests
- ✅ Cloud-native
- ✅ Better performance at scale
- ✅ Advanced features (JSONB, full-text search)
- ✅ Better for Render deployment

**When SQLite is fine:**
- Small projects
- Single user
- Development only
- File-based simplicity

---

## 🆘 Need Help?

Check these resources:
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Render PostgreSQL: https://render.com/docs/databases
- node-postgres: https://node-postgres.com/

---

**You're ready to migrate! 🚀**

PostgreSQL will give you better performance and scalability for production!

