import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initializeDatabase, seedProducts } from './database.js';
import { notificationService } from './notificationService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();
seedProducts();

// Middleware to verify admin access for price modifications
const verifyAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ 
      error: 'Unauthorized: Admin access required',
      message: 'You do not have permission to modify prices'
    });
  }
  
  next();
};

// ==================== PUBLIC ROUTES ====================

// GET all products (read-only for customers)
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY grams ASC').all();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new order
app.post('/api/orders', (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      city,
      pincode,
      landmark,
      items,
      subtotal,
      deliveryCharge,
      totalAmount
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress || !city || !pincode || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify prices from database (security check)
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      // Use database price, not user-submitted price
      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        pricePerUnit: product.price,
        totalPrice: itemTotal
      });
    }

    // Calculate delivery charge based on products
    const hasFreeDelivery = verifiedItems.some(item => {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      return product.delivery_charge === 0;
    });
    
    const calculatedDeliveryCharge = hasFreeDelivery ? 0 : 49;
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryCharge;

    // Generate unique order number
    const orderNumber = `AFK${Date.now()}`;

    // Insert order
    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, city, pincode, landmark,
        subtotal, delivery_charge, total_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const orderResult = insertOrder.run(
      orderNumber,
      customerName,
      customerPhone,
      customerEmail || null,
      deliveryAddress,
      city,
      pincode,
      landmark || null,
      calculatedSubtotal,
      calculatedDeliveryCharge,
      calculatedTotal
    );

    const orderId = orderResult.lastInsertRowid;

    // Insert order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, product_id, product_name, quantity, price_per_unit, total_price
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertItems = db.transaction((items) => {
      for (const item of items) {
        insertItem.run(
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.pricePerUnit,
          item.totalPrice
        );
      }
    });

    insertItems(verifiedItems);

    // Send notification (WhatsApp/Email) to customer (async, don't block response)
    notificationService.sendOrderConfirmation({
      customerName,
      customerPhone,
      customerEmail,
      orderNumber,
      totalAmount: calculatedTotal,
      items: verifiedItems
    }).then(result => {
      if (result.success) {
        console.log(`✅ Order confirmation sent to customer`);
        if (result.details) {
          if (result.details.whatsapp) console.log(`  📱 WhatsApp:`, result.details.whatsapp.message);
          if (result.details.email) console.log(`  📧 Email:`, result.details.email.message);
        }
      } else {
        console.warn(`⚠️  Notification failed: ${result.message}`);
      }
    }).catch(error => {
      console.error('❌ Notification error:', error.message);
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderNumber,
      orderId,
      totalAmount: calculatedTotal
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET order by order number (Public - for order tracking)
app.get('/api/orders/:orderNumber', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT * FROM orders WHERE order_number = ?
    `).get(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(order.id);

    res.json({
      ...order,
      items
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET orders by phone number (Public - for order tracking)
// Only returns non-delivered orders
app.get('/api/track/phone/:phoneNumber', (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    
    // Get all non-delivered orders for this phone number
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE customer_phone = ? 
      AND status != 'delivered'
      AND status != 'cancelled'
      ORDER BY created_at DESC
    `).all(phoneNumber);

    if (orders.length === 0) {
      return res.json({ 
        message: 'No pending orders found for this phone number',
        orders: [] 
      });
    }

    // Get items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT * FROM order_items WHERE order_id = ?
      `).all(order.id);
      
      return {
        ...order,
        items
      };
    });

    res.json({
      message: 'Orders found',
      count: ordersWithItems.length,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders by phone:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order tracking by order number (with detailed status)
app.get('/api/track/:orderNumber', (req, res) => {
  try {
    const order = db.prepare(`
      SELECT * FROM orders WHERE order_number = ?
    `).get(req.params.orderNumber);

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: 'Please check your order ID and try again' 
      });
    }

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(order.id);

    // Calculate order progress
    const statusProgress = {
      'pending': { step: 1, message: 'Order placed successfully', percentage: 20 },
      'confirmed': { step: 2, message: 'Order confirmed, preparing for delivery', percentage: 40 },
      'processing': { step: 3, message: 'Order is being prepared', percentage: 60 },
      'shipped': { step: 4, message: 'Order shipped, on the way', percentage: 80 },
      'delivered': { step: 5, message: 'Order delivered successfully', percentage: 100 },
      'cancelled': { step: 0, message: 'Order cancelled', percentage: 0 }
    };

    const progress = statusProgress[order.status] || statusProgress['pending'];

    res.json({
      order: {
        ...order,
        items
      },
      tracking: {
        currentStatus: order.status,
        currentStep: progress.step,
        statusMessage: progress.message,
        progressPercentage: progress.percentage,
        isDelivered: order.status === 'delivered',
        isCancelled: order.status === 'cancelled',
        canTrack: order.status !== 'cancelled'
      }
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// ==================== ADMIN ROUTES (Protected) ====================

// UPDATE product price (admin only)
app.put('/api/admin/products/:id', verifyAdmin, (req, res) => {
  try {
    const { price, deliveryCharge, description, badge } = req.body;
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const update = db.prepare(`
      UPDATE products 
      SET price = COALESCE(?, price),
          delivery_charge = COALESCE(?, delivery_charge),
          description = COALESCE(?, description),
          badge = COALESCE(?, badge),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(price, deliveryCharge, description, badge, req.params.id);

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// GET all orders (admin only)
app.get('/api/admin/orders', verifyAdmin, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// UPDATE order status (admin only)
app.put('/api/admin/orders/:id/status', verifyAdmin, (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const update = db.prepare(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(status, req.params.id);

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Amma Fresh API is running',
    timestamp: new Date().toISOString()
  });
});

// Test notification configuration (admin only)
app.post('/api/admin/test-notification', verifyAdmin, async (req, res) => {
  try {
    const { phoneNumber, email, name } = req.body;
    
    if (!phoneNumber && !email) {
      return res.status(400).json({ error: 'Phone number or email is required' });
    }

    // Test with a sample order
    const result = await notificationService.sendOrderConfirmation({
      customerName: name || 'Test Customer',
      customerPhone: phoneNumber,
      customerEmail: email,
      orderNumber: 'TEST' + Date.now(),
      totalAmount: 999,
      items: [
        {
          productName: 'Pure Cow Ghee 500g',
          quantity: 1,
          pricePerUnit: 600,
          totalPrice: 600
        }
      ]
    });

    res.json({
      success: result.success,
      message: result.message,
      method: notificationService.method,
      details: result.details
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Notification test failed',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🧈 Amma Fresh Backend API Server   ║
  ╠════════════════════════════════════════╣
  ║  Server running on: http://0.0.0.0:${PORT}
  ║  Local: http://localhost:${PORT}
  ║  Network: http://<your-ip>:${PORT}
  ║  Environment: ${process.env.NODE_ENV || 'development'}
  ║  Notifications: ${process.env.NOTIFICATION_METHOD || 'none'}
  ║  
  ║  API Endpoints:
  ║  • GET  /api/products
  ║  • GET  /api/products/:id
  ║  • POST /api/orders (sends notifications 📧📱)
  ║  • GET  /api/orders/:orderNumber
  ║  
  ║  Order Tracking (Public):
  ║  • GET  /api/track/:orderNumber
  ║  • GET  /api/track/phone/:phoneNumber
  ║  
  ║  Admin Endpoints (require API key):
  ║  • PUT  /api/admin/products/:id
  ║  • GET  /api/admin/orders
  ║  • PUT  /api/admin/orders/:id/status
  ║  • POST /api/admin/test-notification
  ╚════════════════════════════════════════╝
  `);
  
  // Test notification configuration on startup
  notificationService.testConfiguration();
});

export default app;

