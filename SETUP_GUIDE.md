# Amma Fresh Ghee - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Amma Fresh Ghee e-commerce website.

## 📋 Prerequisites

Before you begin, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## 🚀 Quick Start (Development)

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
# Go back to root directory
cd ..
npm install
```

### Step 3: Start Backend Server

Open a new terminal window:

```bash
cd backend
npm run dev
```

You should see:
```
🧈 Amma Fresh Backend API Server
Server running on: http://localhost:3000
```

**Keep this terminal running!**

### Step 4: Start Frontend Development Server

Open another terminal window:

```bash
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173
```

### Step 5: Open in Browser

Visit: **http://localhost:5173**

✅ Your website is now running with full database functionality!

---

## 🗄️ Database Information

### SQLite Database

The backend automatically creates a SQLite database at:
```
backend/amma-fresh.db
```

### What's Stored in the Database?

1. **Products Table**
   - Product details (name, price, weight, description)
   - Images and badges
   - Delivery charges

2. **Orders Table**
   - Customer information
   - Delivery addresses
   - Order totals and status

3. **Order Items Table**
   - Individual items in each order
   - Quantities and prices

### Initial Data

When you first run the backend, it automatically:
- Creates all database tables
- Seeds 6 ghee products (100g, 250g, 500g, 750g, 1kg, 2kg)

---

## 🔒 Security Features

### Price Protection

**✅ Users CANNOT modify prices** - Here's how it works:

1. **Frontend displays prices** from the database (read-only)
2. **Users add items to cart** with displayed prices
3. **On checkout**, frontend sends only:
   - Product IDs
   - Quantities
   - Customer details
4. **Backend verifies prices** from database
5. **Backend calculates totals** using verified prices
6. **Order is saved** with correct prices

**Even if someone modifies prices in browser dev tools, the backend will ignore it and use database prices!**

### Admin Protection

Only authorized admins can modify prices:
- Requires API key in request headers
- API key stored in `.env` file
- Not accessible from frontend

---

## 🔐 Admin Access

### Changing Product Prices (Admin Only)

To update a product price, you need the admin API key from `backend/.env`:

```bash
# Using curl
curl -X PUT http://localhost:3000/api/admin/products/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: amma-fresh-admin-2024-secure-key" \
  -d '{
    "price": 150,
    "description": "Updated description"
  }'
```

### Viewing All Orders (Admin Only)

```bash
curl -X GET http://localhost:3000/api/admin/orders \
  -H "X-API-Key: amma-fresh-admin-2024-secure-key"
```

**IMPORTANT**: Change the `ADMIN_API_KEY` in `backend/.env` to a secure random string!

---

## 📦 Production Deployment

### Backend Deployment

1. **Set environment variables**:
```bash
cd backend
cp .env.example .env
# Edit .env and set secure values
```

2. **Install dependencies**:
```bash
npm install --production
```

3. **Start with PM2** (recommended):
```bash
npm install -g pm2
pm2 start server.js --name amma-fresh-api
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Build for production**:
```bash
npm run build
```

2. **Deploy the `dist` folder** to:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static hosting service

3. **Update API URL**:
Create `.env` in root directory:
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🧪 Testing the System

### Test 1: View Products

Open browser to: http://localhost:5173

You should see 6 ghee products with prices.

### Test 2: Add to Cart

1. Click "Add to Cart" on any product
2. Click cart icon (should show count)
3. Cart sidebar should open

### Test 3: Place Order

1. Add items to cart
2. Click "Proceed to Checkout"
3. Fill in delivery details
4. Click "Place Order"
5. You should see success message with order number

### Test 4: Check Database

```bash
# Install sqlite3 command line tool
npm install -g sqlite3

# Open database
cd backend
sqlite3 amma-fresh.db

# View orders
SELECT * FROM orders;

# View order items
SELECT * FROM order_items;

# Exit
.exit
```

---

## 🛠️ Troubleshooting

### Backend won't start?

**Error**: `Cannot find module 'better-sqlite3'`

**Solution**:
```bash
cd backend
npm install
```

### Frontend shows "Using offline product data"?

**Check**:
1. Is backend running? (http://localhost:3000/api/health)
2. Check browser console for errors
3. Try restarting both servers

### Products not loading from database?

**Solution**:
1. Stop backend (Ctrl+C)
2. Delete `backend/amma-fresh.db`
3. Restart backend (it will recreate database)

### Port 3000 already in use?

**Solution**: Change port in `backend/.env`:
```env
PORT=3001
```

Also update `vite.config.ts` proxy target.

---

## 📂 Project Structure

```
HomemadeGhee/
├── backend/                  # Backend API server
│   ├── server.js            # Express server
│   ├── database.js          # SQLite database setup
│   ├── amma-fresh.db        # SQLite database file (auto-created)
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend configuration
│
├── src/                     # Vue.js frontend
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables (cart logic)
│   ├── services/            # API service
│   │   └── api.ts          # Backend API calls
│   ├── data/               # Product data
│   └── types/              # TypeScript types
│
├── public/                  # Static assets
│   ├── logo.png            # Amma Fresh logo
│   └── bottle-*.svg        # Bottle images
│
└── package.json            # Frontend dependencies
```

---

## 🎯 Next Steps

1. ✅ Test the complete order flow
2. ✅ Verify orders are saved in database
3. 🔧 Customize product prices (admin only)
4. 📱 Test WhatsApp integration
5. 🚀 Deploy to production

---

## 📞 Support

For questions or issues:
- **Email**: anithamith@gmail.com
- **Phone**: +91 9961757294

---

## 🎉 You're All Set!

Your Amma Fresh Ghee website is now running with:
- ✅ Secure backend API with SQLite database
- ✅ Protected pricing (users cannot modify)
- ✅ Order management system
- ✅ Beautiful Vue.js frontend
- ✅ Complete e-commerce flow

Happy selling! 🧈

