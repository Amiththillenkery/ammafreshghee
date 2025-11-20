# PhonePe Payment Gateway Integration Setup Guide

## Overview
This guide will help you set up PhonePe payment gateway integration for Amma Fresh Ghee e-commerce platform.

## Test Credentials Provided
```
Client ID (Merchant ID): M23H2V31G7L3S_2511201935
Secret (Salt Key): NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
Version (Salt Index): 1
```

## Environment Variables Setup

Add these environment variables to your `.env` file in the backend directory:

```env
# PhonePe Payment Gateway Configuration
PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=test

# Redirect and Callback URLs
# For local development:
PHONEPE_REDIRECT_URL=http://localhost:5173/payment/callback
PHONEPE_CALLBACK_URL=http://localhost:3000/api/payment/callback

# For production deployment:
# PHONEPE_REDIRECT_URL=https://yourdomain.com/payment/callback
# PHONEPE_CALLBACK_URL=https://ammafreshghee.onrender.com/api/payment/callback
```

## Files Added/Modified

### Backend Files:
1. **phonePeService.js** - PhonePe payment service handling all payment operations
2. **server.js** - Added PhonePe payment endpoints
3. **database.js** - Updated orders table with payment fields

### Frontend Files:
1. **api.ts** - Added PhonePe payment API methods
2. **Checkout.vue** - Updated to initiate PhonePe payment instead of direct order
3. **PaymentCallback.vue** - New component to handle payment callback
4. **App.vue** - Added routing for payment callback page

## Payment Flow

```
1. User adds products to cart and proceeds to checkout
   ↓
2. User fills delivery details and clicks "Proceed to Payment"
   ↓
3. Frontend calls /api/payment/initiate
   ↓
4. Backend creates pending order and initiates PhonePe payment
   ↓
5. User is redirected to PhonePe payment page
   ↓
6. User completes payment on PhonePe
   ↓
7. PhonePe redirects back to /payment/callback
   ↓
8. Frontend verifies payment status
   ↓
9. On success: Order status updated, cart cleared, confirmation shown
   On failure: User can retry or go back home
```

## API Endpoints

### Payment Initiation
```
POST /api/payment/initiate

Request Body:
{
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "customerEmail": "john@example.com",
  "deliveryAddress": "123 Main St",
  "city": "Mumbai",
  "pincode": "400001",
  "landmark": "Near Temple",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "subtotal": 600,
  "deliveryCharge": 49,
  "totalAmount": 649
}

Response:
{
  "success": true,
  "orderNumber": "AFK1234567890",
  "orderId": 123,
  "paymentUrl": "https://phonepe.com/pay/...",
  "merchantTransactionId": "TXN_AFK1234567890_1234567890",
  "message": "Payment initiated successfully"
}
```

### Payment Status Check
```
GET /api/payment/status/:transactionId

Response:
{
  "success": true,
  "paymentStatus": "PAYMENT_SUCCESS",
  "message": "Payment successful",
  "order": {
    "orderNumber": "AFK1234567890",
    "status": "pending",
    "totalAmount": 649
  }
}
```

### Payment Callback (Webhook)
```
POST /api/payment/callback

This endpoint is called by PhonePe after payment completion.
It verifies the payment and updates order status accordingly.
```

## Database Schema Updates

The `orders` table has been updated with these new fields:
- `payment_transaction_id` VARCHAR(255) - PhonePe transaction ID
- `payment_status` VARCHAR(50) - Payment status from PhonePe

## Order Status Flow

1. **payment_pending** - Order created, waiting for payment
2. **pending** - Payment successful, order awaiting processing
3. **confirmed** - Order confirmed by admin
4. **processing** - Order being prepared
5. **shipped** - Order dispatched
6. **delivered** - Order delivered
7. **payment_failed** - Payment failed
8. **cancelled** - Order cancelled

## Testing the Integration

### Local Development Testing:

1. **Start Backend Server:**
```bash
cd backend
npm start
```

2. **Start Frontend Dev Server:**
```bash
cd ..
npm run dev
```

3. **Test Payment Flow:**
   - Add products to cart
   - Go to checkout
   - Fill delivery details
   - Click "Proceed to Payment"
   - You'll be redirected to PhonePe's test payment page
   - Complete the test payment
   - You'll be redirected back to payment callback page

### Production Deployment:

1. **Update Environment Variables:**
   - Set `PHONEPE_ENV=production`
   - Update `PHONEPE_MERCHANT_ID` with production credentials
   - Update `PHONEPE_SALT_KEY` with production credentials
   - Update `PHONEPE_REDIRECT_URL` to your production domain
   - Update `PHONEPE_CALLBACK_URL` to your production backend

2. **Deploy Backend:**
   - Make sure all environment variables are set on Render/your hosting
   - Restart the backend server

3. **Deploy Frontend:**
   - Build and deploy frontend
   - Test payment flow end-to-end

## Security Notes

1. ✅ **Price Verification:** Backend verifies all prices from database before payment
2. ✅ **Checksum Validation:** All PhonePe callbacks are verified with checksum
3. ✅ **Transaction Tracking:** Each order has unique transaction ID
4. ✅ **Status Validation:** Payment status is double-checked before order confirmation

## Troubleshooting

### Payment Initiation Fails
- Check if PhonePe credentials are correct in .env
- Verify backend server is running
- Check network connectivity

### Payment Callback Not Working
- Ensure callback URL is publicly accessible
- For local testing, you may need to use ngrok or similar tunneling service
- Verify checksum validation is working

### Order Status Not Updating
- Check backend logs for errors
- Verify database connection
- Ensure payment status API is responding

## Support

For PhonePe integration issues:
- PhonePe Developer Docs: https://developer.phonepe.com/
- Contact PhonePe support for merchant account issues

For application issues:
- Check backend logs
- Review database records
- Test API endpoints using Postman/Thunder Client

