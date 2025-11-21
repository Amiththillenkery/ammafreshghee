# 🛡️ Amma Fresh Admin Panel

A standalone admin panel application for managing orders for the **Amma Fresh Ghee** e-commerce platform. This panel connects directly to your PostgreSQL database to fetch and update order information in real-time.

---

## ✨ Features

- 📊 **Dashboard with Real-time Statistics**
  - Total orders count
  - Order status breakdown (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
  - Total revenue calculation
  
- 📦 **Order Management**
  - View all orders with complete details
  - Filter orders by date range
  - Filter orders by status
  - Search orders by customer name, phone, or order number
  - View order items and quantities

- 🔄 **Order Status Updates**
  - Confirm pending orders
  - Mark orders as processing
  - Mark orders as shipped
  - Mark orders as delivered
  - Cancel orders

cls- 🖨️ **PDF Invoice & Delivery Slip Generation**
  - Generate printable PDFs for each order
  - A4 format split into two halves (top: delivery slip, bottom: invoice)
  - Professional layout with company branding
  - One-click print from admin panel
  - Includes all order details, customer info, and items
  - Cut-ready format for easy separation

- 📱 **Responsive Design**
  - Works on desktop, tablet, and mobile devices
  - Modern, clean interface with smooth animations

---

## 🚀 Quick Start

### 1. Navigate to the admin-panel directory
```bash
cd admin-panel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` file
The `.env` file is already configured with your database connection:

```env
DATABASE_URL=postgresql://postgres.uggqnfwdhbcvqyjssivw:Amith@154698738@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
PORT=3001
NODE_ENV=development
```

### 4. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   👨‍💼 Amma Fresh Admin Panel         ║
╠════════════════════════════════════════╣
║  Admin Panel: http://localhost:3001
║  API: http://localhost:3001/api
║  ...
╚════════════════════════════════════════╝
```

### 5. Access the Admin Panel
Open your browser and visit:
```
http://localhost:3001
```

---

## 🌐 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and uptime.

**Response:**
```json
{
  "status": "ok",
  "message": "Amma Fresh Admin Panel is running",
  "timestamp": "2025-11-21T09:04:12.494Z"
}
```

### Get Statistics
```
GET /api/stats
GET /api/stats?startDate=2025-01-01&endDate=2025-12-31
```
Returns order statistics for the specified date range.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_orders": 14,
    "pending": 2,
    "confirmed": 0,
    "processing": 0,
    "shipped": 0,
    "delivered": 0,
    "cancelled": 0,
    "total_revenue": 5006
  }
}
```

### Get All Orders
```
GET /api/orders
GET /api/orders?startDate=2025-01-01&endDate=2025-12-31&status=pending
```
Fetch all orders with optional date and status filters.

**Query Parameters:**
- `startDate` (optional): Filter orders from this date (YYYY-MM-DD)
- `endDate` (optional): Filter orders until this date (YYYY-MM-DD)
- `status` (optional): Filter by order status

**Response:**
```json
{
  "success": true,
  "count": 14,
  "orders": [...]
}
```

### Get Single Order
```
GET /api/orders/:id
```
Get details of a specific order including items.

### Update Order Status
```
PUT /api/orders/:id/status
```
Update the status of an order.

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

### Search Orders
```
GET /api/orders/search?q=search_term
```
Search orders by customer name, phone, or order number.

### Generate PDF (NEW!)
```
GET /api/orders/:id/pdf
```
Generate a printable PDF with delivery slip and invoice.

**Features:**
- A4 format, split into two halves
- Top half: Delivery address slip (attach to package)
- Bottom half: Invoice (for customer/accounting)
- Dashed cutting line in the middle
- Professional layout with company branding

**Response:**
- Content-Type: `application/pdf`
- Downloads as: `Order_{order_number}.pdf`

**Usage:**
```bash
# Download PDF for order ID 14
curl -o invoice.pdf http://localhost:3001/api/orders/14/pdf

# Or open in browser
http://localhost:3001/api/orders/14/pdf
```

**Print Settings:**
- Paper: A4
- Orientation: Portrait
- Scale: 100%
- After printing: Cut along the dashed line

See `PDF_PRINTING_GUIDE.md` for detailed instructions.

---

## 📋 Order Status Flow

```
payment_pending → pending → confirmed → processing → shipped → delivered
                    ↓
                cancelled
```

1. **payment_pending**: Order created, awaiting online payment
2. **pending**: Payment successful (or COD order placed), awaiting admin confirmation
3. **confirmed**: Admin has confirmed the order
4. **processing**: Order is being prepared
5. **shipped**: Order has been dispatched for delivery
6. **delivered**: Order has been successfully delivered
7. **cancelled**: Order has been cancelled (can happen at any stage)

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **pdfkit** - PDF generation library
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (with modern features like Grid, Flexbox, Animations)
- **JavaScript (Vanilla)** - No frameworks, pure JavaScript
- **Fetch API** - API communication

---

## 🔒 Security Notes

- The admin panel currently has no authentication. **Do not expose it to the public internet.**
- For production use, implement authentication middleware (basic auth or JWT)
- Keep your `.env` file secure and never commit it to version control
- The `.env` file is already in `.gitignore`

---

## 🐛 Troubleshooting

### Server won't start
- Make sure `.env` file exists and has correct DATABASE_URL
- Check if port 3001 is already in use
- Verify Node.js version (v14+ required)

### Database connection failed
- Verify your PostgreSQL database is running
- Check Supabase dashboard to ensure database is active
- Check server logs for connection errors

### 500 Internal Server Error
- Check server console logs for error details
- Verify database schema matches expected structure
- Ensure all required environment variables are set

---

## 📈 Current Status

✅ **Database Connected:** PostgreSQL on Supabase  
✅ **Total Orders:** 14  
✅ **API Endpoints:** All working  
✅ **Statistics:** Real-time updates  
✅ **Order Management:** Fully functional  
✅ **PDF Generation:** Delivery slips + invoices ready  

---

## 📚 Additional Documentation

- **PDF Printing Guide:** See `PDF_PRINTING_GUIDE.md` for comprehensive PDF documentation
- **Quick Start:** See `QUICKSTART.md` for common tasks
- **API Reference:** See API Endpoints section above

---

## 📞 Support

For issues or questions, check the server logs in the console where you ran `npm start`.

**PDF Issues?** 
- See `PDF_PRINTING_GUIDE.md` for troubleshooting
- Check server logs for PDF generation errors
- Verify order has items before generating PDF

---

**Admin Panel URL:** http://localhost:3001  
**Made for:** Amma Fresh Ghee E-commerce Platform
