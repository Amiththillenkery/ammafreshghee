# ⚡ Admin Panel - Quick Start Guide

## ✅ Setup Complete!

Your admin panel is **fully functional** and ready to use!

---

## 🚀 How to Use

### Start the Server
```bash
cd admin-panel
npm start
```

### Open Admin Panel
Visit: **http://localhost:3001**

---

## 📊 What You Can Do

### 1. View Dashboard
- See total orders (Currently: **14 orders**)
- View revenue (Currently: **₹5,006**)
- See status breakdown (Currently: **2 pending orders**)

### 2. Filter Orders
- **By Date:** Select start and end dates
- **By Status:** Choose from dropdown (Pending, Confirmed, etc.)

### 3. Manage Orders
- **View Details:** Click any order to see customer info and items
- **Confirm Order:** Click "Confirm Order" button on pending orders
- **Update Status:** Progress orders through: Confirmed → Processing → Shipped → Delivered
- **Cancel Order:** Click "Cancel Order" if needed

### 4. Search Orders
- Type in search box to find orders by:
  - Customer name
  - Phone number
  - Order number

---

## 🎯 Common Tasks

### Confirm a Pending Order
1. Find the order with status "Pending" (yellow badge)
2. Click **"Confirm Order"** button
3. Order status changes to "Confirmed" (green badge)

### Process an Order
1. Find confirmed order
2. Click **"Mark Processing"** → Changes to "Processing" (cyan badge)
3. Click **"Mark Shipped"** → Changes to "Shipped" (blue badge)
4. Click **"Mark Delivered"** → Changes to "Delivered" (gray badge)

### Cancel an Order
1. Find the order you want to cancel
2. Click **"Cancel Order"** button
3. Confirm the cancellation
4. Order status changes to "Cancelled" (red badge)

---

## 🖨️ Print PDF Invoice

### Generate PDF for Order

1. Find the order in the table
2. Click the **"📄 PDF"** button
3. PDF will open in new tab (or download)
4. Print the PDF

### PDF Layout

- **Top Half:** Delivery slip with addresses
- **Bottom Half:** Invoice with items and prices
- **Cut Line:** Dashed line in the middle with ✂ scissors

### Print Settings

- Paper: A4
- Orientation: Portrait
- Scale: 100%
- After printing: Cut paper in half

---

## 🔗 API Endpoints (For Testing)

You can also use these URLs directly in your browser:

### View Statistics
```
http://localhost:3001/api/stats
```

### View All Orders
```
http://localhost:3001/api/orders
```

### Generate PDF
```
http://localhost:3001/api/orders/:id/pdf
```

### View Orders by Date
```
http://localhost:3001/api/orders?startDate=2025-11-01&endDate=2025-11-21
```

### View Orders by Status
```
http://localhost:3001/api/orders?status=pending
```

### Health Check
```
http://localhost:3001/api/health
```

---

## 🎨 Order Status Colors

- 🟡 **Pending** - Awaiting confirmation
- 🟢 **Confirmed** - Order confirmed by admin
- 🔵 **Processing** - Order being prepared
- 🟣 **Shipped** - Out for delivery
- ⚫ **Delivered** - Successfully delivered
- 🔴 **Cancelled** - Order cancelled

---

## ⚠️ Important Notes

1. **Keep Server Running:** Don't close the terminal window where `npm start` is running
2. **Local Only:** Admin panel runs on your computer only (localhost:3001)
3. **No Authentication:** This panel has no password protection yet
4. **Database Connection:** Uses your Supabase PostgreSQL database directly

---

## 🛑 Stop the Server

Press `Ctrl + C` in the terminal to stop the admin panel server.

---

## 📱 Access from Other Devices

To access from another device on the same network:

1. Find your computer's local IP address
   ```bash
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. On the other device, visit:
   ```
   http://YOUR_IP:3001
   # Example: http://192.168.1.100:3001
   ```

---

## 🎉 That's It!

Your admin panel is ready to manage orders. Just keep the server running and access it at **http://localhost:3001**

**Need help?** Check the full `README.md` for detailed documentation.

