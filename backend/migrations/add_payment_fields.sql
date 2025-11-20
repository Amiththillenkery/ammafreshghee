-- Migration: Add payment fields to orders table
-- Date: 2025-01-20
-- Description: Adds PhonePe payment integration fields

-- Add payment_transaction_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='orders' AND column_name='payment_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(255);
    RAISE NOTICE 'Added payment_transaction_id column';
  ELSE
    RAISE NOTICE 'payment_transaction_id column already exists';
  END IF;
END $$;

-- Add payment_status column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='orders' AND column_name='payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50);
    RAISE NOTICE 'Added payment_status column';
  ELSE
    RAISE NOTICE 'payment_status column already exists';
  END IF;
END $$;

-- Create index on payment_transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_transaction_id 
ON orders(payment_transaction_id);

-- Update existing orders to have null payment status (optional - for data integrity)
-- UPDATE orders SET payment_status = NULL WHERE payment_status IS NULL;

RAISE NOTICE 'Migration completed successfully';

