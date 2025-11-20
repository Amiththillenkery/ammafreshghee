-- =====================================================
-- AMMA FRESH - PostgreSQL Database Schema
-- Migration from SQLite to PostgreSQL
-- =====================================================

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grams INTEGER NOT NULL,
    liter DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) NOT NULL,
    badge VARCHAR(100),
    delivery_charge DECIMAL(10, 2) NOT NULL DEFAULT 49,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Initial Products
-- =====================================================
INSERT INTO products (name, grams, liter, price, description, image, badge, delivery_charge)
VALUES
    ('Pure Cow Ghee', 100, 0.1, 120, 'Pure cow ghee made from traditional bilona method. Perfect for small families or first-time buyers.', '/bottle-100g.svg', NULL, 49),
    ('Pure Cow Ghee', 250, 0.25, 300, 'Handcrafted pure cow ghee with rich aroma. Ideal for daily cooking and traditional recipes.', '/bottle-250g.svg', NULL, 49),
    ('Pure Cow Ghee', 500, 0.5, 600, 'Premium quality cow ghee. No preservatives, no chemicals. Traditional goodness in every spoon.', '/bottle-500g.svg', 'Popular', 49),
    ('Pure Cow Ghee', 750, 0.75, 900, 'Authentic cow ghee prepared using age-old methods. Rich taste and maximum purity guaranteed.', '/bottle-750g.svg', NULL, 49),
    ('Pure Cow Ghee', 1000, 1, 1200, 'Best value 1 KG pack! Pure cow ghee with authentic granular texture. Free delivery included.', '/bottle-1kg.svg', 'Free Delivery', 0),
    ('Premium Cow Ghee Pack', 2000, 2, 2400, 'Premium 2 KG family pack of pure cow ghee. Best value for regular use. Free delivery included.', '/bottle-2kg.svg', 'Premium Pack', 0);

-- =====================================================
-- VERIFY INSTALLATION
-- =====================================================
-- Run these queries to verify:
-- SELECT COUNT(*) as product_count FROM products;
-- SELECT COUNT(*) as order_count FROM orders;
-- SELECT * FROM products ORDER BY grams ASC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If no errors above, your database is ready!
-- Tables created: products, orders, order_items
-- Indexes created for performance
-- Triggers created for auto-updating timestamps
-- 6 products seeded
-- =====================================================

