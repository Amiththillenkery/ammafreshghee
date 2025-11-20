# Amma Fresh Backend API

Backend API server for Amma Fresh Ghee e-commerce platform with SQLite database.

## Features

- 🔒 **Secure**: Admin-only access for price modifications
- 💾 **SQLite Database**: Lightweight, file-based database
- 📦 **Order Management**: Track all customer orders
- 💰 **Price Security**: Prices verified server-side, customers cannot manipulate
- 🛡️ **API Protection**: Admin routes protected with API key

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with secure values:
```env
PORT=3000
NODE_ENV=development
ADMIN_API_KEY=your-secure-random-key-here
```

**IMPORTANT**: Change `ADMIN_API_KEY` to a secure random string in production!

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Products
```http
GET /api/products
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "customerEmail": "john@example.com",
  "deliveryAddress": "123 Main St, Apartment 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "landmark": "Near Central Mall",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "subtotal": 240,
  "deliveryCharge": 49,
  "totalAmount": 289
}
```

#### Get Order by Order Number
```http
GET /api/orders/:orderNumber
```

### Admin Endpoints (Require API Key)

All admin endpoints require the `X-API-Key` header:
```http
X-API-Key: your-admin-api-key
```

#### Update Product Price
```http
PUT /api/admin/products/:id
Content-Type: application/json
X-API-Key: your-admin-api-key

{
  "price": 150,
  "deliveryCharge": 49,
  "description": "Updated description",
  "badge": "New"
}
```

#### Get All Orders
```http
GET /api/admin/orders
X-API-Key: your-admin-api-key
```

#### Update Order Status
```http
PUT /api/admin/orders/:id/status
Content-Type: application/json
X-API-Key: your-admin-api-key

{
  "status": "confirmed"
}
```

Valid status values: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grams INTEGER NOT NULL,
  liter REAL NOT NULL,
  price REAL NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  badge TEXT,
  delivery_charge REAL NOT NULL DEFAULT 49,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Orders Table
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  landmark TEXT,
  subtotal REAL NOT NULL,
  delivery_charge REAL NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_unit REAL NOT NULL,
  total_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
)
```

## Security Features

### Price Protection
- **Server-side Validation**: All prices are verified against the database
- **Cannot Be Manipulated**: Frontend prices are read-only
- **Calculated on Server**: Subtotals and totals calculated server-side

### Admin Protection
- **API Key Required**: Admin endpoints require authentication
- **Environment Variables**: Credentials stored securely
- **No Public Access**: Prices can only be changed by admin

### How Price Security Works

1. Frontend sends order with product IDs and quantities
2. Backend fetches actual prices from database
3. Backend calculates totals using database prices (ignoring client-sent prices)
4. Order is saved with verified prices
5. Users cannot modify pricing in browser dev tools

## Testing with curl

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerPhone": "9876543210",
    "deliveryAddress": "123 Test St",
    "city": "Mumbai",
    "pincode": "400001",
    "items": [{"productId": 1, "quantity": 2}],
    "subtotal": 240,
    "deliveryCharge": 49,
    "totalAmount": 289
  }'
```

### Update Price (Admin)
```bash
curl -X PUT http://localhost:3000/api/admin/products/1 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-admin-api-key" \
  -d '{"price": 150}'
```

## Database Location

The SQLite database file is created at:
```
backend/amma-fresh.db
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Change `ADMIN_API_KEY` to a secure random string
3. Use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name amma-fresh-api
```

## Support

For issues or questions, contact: anithamith@gmail.com

