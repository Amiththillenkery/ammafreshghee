import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initializeDatabase, seedProducts } from './database.js';
import { notificationService } from './notificationService.js';
import { phonePeService } from './phonePeService.js';
import { keepAliveService } from './keepAliveService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
await initializeDatabase();
await seedProducts();

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

// Helper function to convert PostgreSQL numeric strings to JavaScript numbers
const formatProduct = (product) => ({
  ...product,
  price: parseFloat(product.price),
  delivery_charge: parseFloat(product.delivery_charge),
  grams: parseInt(product.grams)
});

const formatOrderItem = (item) => ({
  ...item,
  price: parseFloat(item.price),
  quantity: parseInt(item.quantity),
  subtotal: parseFloat(item.subtotal)
});

const formatOrder = (order) => ({
  ...order,
  total_amount: parseFloat(order.total_amount),
  delivery_charge: parseFloat(order.delivery_charge)
});

// ==================== PUBLIC ROUTES ====================

// GET all products (read-only for customers)
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products ORDER BY grams ASC');
    res.json(products.map(formatProduct));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(formatProduct(product));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create new order
app.post('/api/orders', async (req, res) => {
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
      const product = await db.get('SELECT * FROM products WHERE id = $1', [item.productId]);
      
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
    const hasFreeDel = verifiedItems.some(item => {
      const product = verifiedItems.find(v => v.productId === item.productId);
      return product && product.pricePerUnit >= 1200; // Free delivery for 1kg+ products
    });
    
    const calculatedDeliveryCharge = hasFreeDel ? 0 : 49;
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryCharge;

    // Generate unique order number
    const orderNumber = `AFK${Date.now()}`;

    // Insert order
    const orderResult = await db.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, city, pincode, landmark,
        subtotal, delivery_charge, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
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
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of verifiedItems) {
      await db.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, quantity, price_per_unit, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.pricePerUnit,
          item.totalPrice
        ]
      );
    }

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
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const order = await db.get(
      'SELECT * FROM orders WHERE order_number = $1',
      [req.params.orderNumber]
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db.all(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({
      ...formatOrder(order),
      items: items.map(formatOrderItem)
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET orders by phone number (Public - for order tracking)
// Only returns non-delivered orders
app.get('/api/track/phone/:phoneNumber', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    
    // Get all non-delivered orders for this phone number
    const orders = await db.all(
      `SELECT * FROM orders 
       WHERE customer_phone = $1 
       AND status != 'delivered'
       AND status != 'cancelled'
       ORDER BY created_at DESC`,
      [phoneNumber]
    );

    if (orders.length === 0) {
      return res.json({ 
        message: 'No pending orders found for this phone number',
        orders: [] 
      });
    }

    // Get items for each order
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await db.all(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );
      
      return {
        ...formatOrder(order),
        items: items.map(formatOrderItem)
      };
    }));

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
app.get('/api/track/:orderNumber', async (req, res) => {
  try {
    const order = await db.get(
      'SELECT * FROM orders WHERE order_number = $1',
      [req.params.orderNumber]
    );

    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found',
        message: 'Please check your order ID and try again' 
      });
    }

    const items = await db.all(
      'SELECT * FROM order_items WHERE order_id = $1',
      [order.id]
    );

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
        ...formatOrder(order),
        items: items.map(formatOrderItem)
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

// ==================== PHONEPE PAYMENT ROUTES ====================

// POST Initiate PhonePe payment
app.post('/api/payment/initiate', async (req, res) => {
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
      const product = await db.get('SELECT * FROM products WHERE id = $1', [item.productId]);
      
      if (!product) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

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

    // Calculate delivery charge
    const hasFreeDel = verifiedItems.some(item => {
      const product = verifiedItems.find(v => v.productId === item.productId);
      return product && product.pricePerUnit >= 1200;
    });
    
    const calculatedDeliveryCharge = hasFreeDel ? 0 : 49;
    const calculatedTotal = calculatedSubtotal + calculatedDeliveryCharge;

    // Generate unique order number (will be used for payment reference)
    const orderNumber = `AFK${Date.now()}`;

    // Create pending order in database
    const orderResult = await db.query(
      `INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        delivery_address, city, pincode, landmark,
        subtotal, delivery_charge, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
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
        calculatedTotal,
        'payment_pending' // New status for orders awaiting payment
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of verifiedItems) {
      await db.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, quantity, price_per_unit, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.pricePerUnit,
          item.totalPrice
        ]
      );
    }

    // Initiate PhonePe payment
    const paymentResult = await phonePeService.initiatePayment({
      orderId: orderNumber,
      amount: calculatedTotal,
      customerPhone,
      customerName,
      customerEmail: customerEmail || ''
    });

    if (!paymentResult.success) {
      // Update order status to failed
      await db.query(
        `UPDATE orders SET status = 'payment_failed' WHERE id = $1`,
        [orderId]
      );
      
      return res.status(500).json({
        success: false,
        error: 'Payment initiation failed',
        message: paymentResult.message
      });
    }

    // Store transaction ID in order for tracking
    await db.query(
      `UPDATE orders SET payment_transaction_id = $1 WHERE id = $2`,
      [paymentResult.merchantTransactionId, orderId]
    );

    res.status(200).json({
      success: true,
      orderNumber,
      orderId,
      paymentUrl: paymentResult.paymentUrl,
      merchantTransactionId: paymentResult.merchantTransactionId,
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to initiate payment',
      message: error.message 
    });
  }
});

// POST PhonePe payment callback (webhook)
app.post('/api/payment/callback', async (req, res) => {
  try {
    console.log('PhonePe callback received:', req.body);

    const callbackResult = await phonePeService.handleCallback(req.body);

    if (!callbackResult.verified) {
      console.error('Invalid callback checksum');
      return res.status(400).json({ error: 'Invalid callback' });
    }

    const { data, paymentStatus } = callbackResult;
    const transactionId = data.data?.merchantTransactionId;

    // Find order by transaction ID
    const order = await db.get(
      'SELECT * FROM orders WHERE payment_transaction_id = $1',
      [transactionId]
    );

    if (!order) {
      console.error('Order not found for transaction:', transactionId);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status based on payment status
    let newStatus = 'payment_failed';
    if (paymentStatus === 'PAYMENT_SUCCESS') {
      newStatus = 'pending'; // Order is now pending for processing
      
      // Send order confirmation notification
      const orderItems = await db.all(
        'SELECT * FROM order_items WHERE order_id = $1',
        [order.id]
      );

      notificationService.sendOrderConfirmation({
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        orderNumber: order.order_number,
        totalAmount: parseFloat(order.total_amount),
        items: orderItems.map(item => ({
          productName: item.product_name,
          quantity: parseInt(item.quantity),
          pricePerUnit: parseFloat(item.price_per_unit),
          totalPrice: parseFloat(item.total_price)
        }))
      }).catch(err => console.error('Notification error:', err));
    }

    await db.query(
      `UPDATE orders SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [newStatus, paymentStatus, order.id]
    );

    console.log(`Order ${order.order_number} payment status: ${paymentStatus}`);

    res.status(200).json({ success: true, message: 'Callback processed' });

  } catch (error) {
    console.error('Error processing payment callback:', error);
    res.status(500).json({ error: 'Failed to process callback' });
  }
});

// GET Check payment status
app.get('/api/payment/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;

    const statusResult = await phonePeService.checkPaymentStatus(transactionId);

    // Find order by transaction ID
    const order = await db.get(
      'SELECT * FROM orders WHERE payment_transaction_id = $1',
      [transactionId]
    );

    res.json({
      success: true,
      paymentStatus: statusResult.status,
      message: statusResult.message,
      order: order ? {
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: parseFloat(order.total_amount)
      } : null
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check payment status' 
    });
  }
});

// ==================== ADMIN ROUTES (Protected) ====================

// UPDATE product price (admin only)
app.put('/api/admin/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { price, deliveryCharge, description, badge } = req.body;
    
    const product = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.query(
      `UPDATE products 
       SET price = COALESCE($1, price),
           delivery_charge = COALESCE($2, delivery_charge),
           description = COALESCE($3, description),
           badge = COALESCE($4, badge),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [price, deliveryCharge, description, badge, req.params.id]
    );

    const updatedProduct = await db.get('SELECT * FROM products WHERE id = $1', [req.params.id]);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: formatProduct(updatedProduct)
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// GET all orders (admin only)
app.get('/api/admin/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await db.all(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );

    res.json(orders.map(formatOrder));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// UPDATE order status (admin only)
app.put('/api/admin/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [status, req.params.id]
    );

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
app.get('/api/health', async (req, res) => {
  const keepAliveStatus = await keepAliveService.getStatus();
  
  res.json({ 
    status: 'ok', 
    message: 'Amma Fresh API is running',
    timestamp: new Date().toISOString(),
    keepAlive: keepAliveStatus
  });
});

// Track visitor (increment counter)
app.post('/api/visitors/track', async (req, res) => {
  try {
    await db.query(`
      UPDATE visitors 
      SET total_count = total_count + 1,
          last_visit = CURRENT_TIMESTAMP 
      WHERE id = 1
    `);
    
    const result = await db.get('SELECT total_count FROM visitors WHERE id = 1');
    
    res.json({ 
      success: true,
      totalVisitors: parseInt(result.total_count)
    });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to track visitor' 
    });
  }
});

// Get visitor statistics (public endpoint for main website)
app.get('/api/visitors/stats', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        total_count,
        last_visit,
        created_at
      FROM visitors 
      WHERE id = 1
    `);
    
    res.json({ 
      success: true,
      totalVisitors: parseInt(stats.total_count),
      lastVisit: stats.last_visit,
      trackingSince: stats.created_at
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch visitor stats' 
    });
  }
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
  ║  PhonePe Payment (Public):
  ║  • POST /api/payment/initiate
  ║  • POST /api/payment/callback
  ║  • GET  /api/payment/status/:transactionId
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
  
  // Test PhonePe configuration on startup
  phonePeService.testConfiguration();
  
  // Start keep-alive service (prevents DB/server sleep on free tier)
  keepAliveService.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  keepAliveService.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  keepAliveService.stop();
  process.exit(0);
});

export default app;

