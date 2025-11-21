import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database.js';
import pdfService from './pdfService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic auth middleware (optional - uncomment if you want password protection)
/*
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
*/

// Helper function to format numbers
const formatOrder = (order) => ({
  ...order,
  total_amount: parseFloat(order.total_amount),
  delivery_charge: parseFloat(order.delivery_charge)
});

const formatOrderItem = (item) => ({
  ...item,
  price_per_unit: parseFloat(item.price_per_unit),
  total_price: parseFloat(item.total_price),
  quantity: parseInt(item.quantity)
});

// ==================== API ENDPOINTS ====================

// Get all orders (with optional date filter)
app.get('/api/orders', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    // Add date filters
    if (startDate) {
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate + ' 23:59:59'); // Include entire day
      paramCount++;
    }
    
    // Add status filter
    if (status && status !== 'all') {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    console.log('Fetching orders with query:', query);
    console.log('Params:', params);
    
    const orders = await db.all(query, params);
    
    console.log(`Found ${orders.length} orders`);
    
    // Get items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      try {
        const items = await db.all(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        
        return {
          ...formatOrder(order),
          items: items.map(formatOrderItem)
        };
      } catch (itemError) {
        console.error(`Error fetching items for order ${order.id}:`, itemError);
        return {
          ...formatOrder(order),
          items: []
        };
      }
    }));
    
    res.json({
      success: true,
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

// Get single order details
app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await db.get('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }
    
    const items = await db.all(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    
    res.json({
      success: true,
      order: {
        ...formatOrder(order),
        items: items.map(formatOrderItem)
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch order' 
    });
  }
});

// Update order status
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_pending', 'payment_failed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid status' 
      });
    }
    
    await db.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
    
    const updatedOrder = await db.get('SELECT * FROM orders WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: formatOrder(updatedOrder)
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update order' 
    });
  }
});

// Get order statistics
app.get('/api/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
      params.push(startDate, endDate + ' 23:59:59');
    }
    
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END), 0) as confirmed,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END), 0) as processing,
        COALESCE(SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), 0) as shipped,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
        COALESCE(SUM(CAST(total_amount AS DECIMAL)), 0) as total_revenue
      FROM orders
      ${dateFilter}
    `, params);
    
    res.json({
      success: true,
      stats: {
        total_orders: parseInt(stats.total_orders) || 0,
        pending: parseInt(stats.pending) || 0,
        confirmed: parseInt(stats.confirmed) || 0,
        processing: parseInt(stats.processing) || 0,
        shipped: parseInt(stats.shipped) || 0,
        delivered: parseInt(stats.delivered) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        total_revenue: parseFloat(stats.total_revenue) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Search orders by customer phone or order number
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query required' 
      });
    }
    
    const orders = await db.all(`
      SELECT * FROM orders 
      WHERE order_number ILIKE $1 
         OR customer_phone ILIKE $1 
         OR customer_name ILIKE $1
      ORDER BY created_at DESC
    `, [`%${query}%`]);
    
    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(formatOrder)
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to search orders' 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Amma Fresh Admin Panel is running',
    timestamp: new Date().toISOString()
  });
});

// Serve admin panel HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate PDF for order (delivery slip + invoice)
app.get('/api/orders/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Generating PDF for order ${id}`);
    
    // Get order details
    const order = await db.get('SELECT * FROM orders WHERE id = $1', [id]);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order not found' 
      });
    }
    
    // Get order items
    const items = await db.all(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );
    
    if (!items || items.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Order items not found' 
      });
    }
    
    // Generate PDF
    const pdfDoc = pdfService.generateOrderPDF(order, items);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Order_${order.order_number}.pdf"`);
    
    // Pipe PDF to response
    pdfDoc.pipe(res);
    
    console.log(`✓ PDF generated for order ${order.order_number}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   👨‍💼 Amma Fresh Admin Panel         ║
  ╠════════════════════════════════════════╣
  ║  Admin Panel: http://localhost:${PORT}
  ║  API: http://localhost:${PORT}/api
  ║  
  ║  Features:
  ║  • View all orders
  ║  • Filter by date
  ║  • Confirm orders
  ║  • Update order status
  ║  • Search orders
  ║  • View statistics
  ║  • Generate PDF invoices
  ╚════════════════════════════════════════╝
  `);
  
  // Test database connection
  console.log('\n🔍 Testing database connection...');
  const connected = await db.testConnection();
  
  if (!connected) {
    console.error('\n⚠️  Warning: Database connection failed!');
    console.error('   Please check your DATABASE_URL in .env file');
  } else {
    console.log('✅ Admin panel ready!\n');
  }
});

export default app;

