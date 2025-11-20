# PhonePe Official SDK Integration - Setup Guide

## ✅ Official SDK Installed

We're now using the **official PhonePe Node.js SDK** instead of custom API calls. This provides better reliability, security, and official support.

**SDK Documentation:** [PhonePe Node.js SDK](https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/installation)

## 📋 Environment Variables Setup

### For Render/Production Deployment:

Add these environment variables to your backend service:

```env
# PhonePe SDK Configuration
# Note: In SDK terminology, merchantId = clientId, saltKey = clientSecret, saltIndex = clientVersion

# Your PhonePe Merchant ID (called clientId in SDK)
PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935

# OR use SDK naming (both work):
PHONEPE_CLIENT_ID=M23H2V31G7L3S_2511201935

# Your PhonePe Salt Key (called clientSecret in SDK)
PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0

# OR use SDK naming (both work):
PHONEPE_CLIENT_SECRET=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0

# Salt Index (called clientVersion in SDK) - usually 1
PHONEPE_SALT_INDEX=1

# OR use SDK naming (both work):
PHONEPE_CLIENT_VERSION=1

# Environment: 'test' for SANDBOX, 'production' for PRODUCTION
PHONEPE_ENV=test

# Redirect URL (where user returns after payment)
PHONEPE_REDIRECT_URL=https://ammafresh.netlify.app/payment/callback

# Callback URL (webhook endpoint for PhonePe)
PHONEPE_CALLBACK_URL=https://ammafreshghee.onrender.com/api/payment/callback
```

### Variable Name Mapping

The SDK uses different terminology than PhonePe's raw API:

| PhonePe API Term | SDK Term | Environment Variable (Both Work) |
|------------------|----------|----------------------------------|
| Merchant ID | Client ID | `PHONEPE_MERCHANT_ID` or `PHONEPE_CLIENT_ID` |
| Salt Key | Client Secret | `PHONEPE_SALT_KEY` or `PHONEPE_CLIENT_SECRET` |
| Salt Index | Client Version | `PHONEPE_SALT_INDEX` or `PHONEPE_CLIENT_VERSION` |

**Our code supports both naming conventions!**

## 🔧 How the SDK Works

### SDK Initialization
```javascript
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

const client = StandardCheckoutClient.getInstance(
  clientId,        // Your merchant ID
  clientSecret,    // Your salt key
  clientVersion,   // Your salt index
  Env.SANDBOX      // or Env.PRODUCTION
);
```

### Payment Flow with SDK

1. **Initiate Payment**
   ```javascript
   const paymentRequest = {
     merchantTransactionId: 'TXN_123',
     merchantUserId: 'USER_9876543210',
     amount: 64900, // in paise (₹649)
     redirectUrl: 'https://yoursite.com/payment/callback',
     redirectMode: 'REDIRECT',
     callbackUrl: 'https://yourbackend.com/api/payment/callback',
     mobileNumber: '9876543210',
     paymentInstrument: { type: 'PAY_PAGE' }
   };
   
   const response = await client.initiatePayment(paymentRequest);
   ```

2. **Check Payment Status**
   ```javascript
   const status = await client.checkOrderStatus(merchantTransactionId);
   ```

3. **Verify Webhook**
   ```javascript
   const verified = await client.verifyWebhook(base64Response, checksum);
   ```

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render

1. Push the updated code to your repository
2. Render will auto-deploy (if auto-deploy is enabled)
3. OR manually trigger deploy from Render dashboard

### Step 2: Add Environment Variables

1. Go to Render Dashboard
2. Select your backend service
3. Click "Environment" tab
4. Add all the variables listed above
5. Save changes (this triggers redeploy)

### Step 3: Verify SDK Initialization

After deployment, check the logs:

```
╔════════════════════════════════════════════╗
║   💳 PhonePe SDK Configuration          ║
╠════════════════════════════════════════════╣
║  SDK Status: ✓ Initialized
║  Environment: SANDBOX
║  Client ID (Merchant): M23H2V31G7L3S_2511201935
║  Client Version: 1
║  Redirect URL: https://ammafresh.netlify.app/payment/callback
║  Callback URL: https://ammafreshghee.onrender.com/api/payment/callback
╚════════════════════════════════════════════╝
```

If you see `✗ Failed`, there's an issue with credentials.

## ⚠️ About Your Credentials

### Current Issue: "Key not found for the merchant"

The credentials `M23H2V31G7L3S_2511201935` may not be active in PhonePe's system. Here's what to do:

#### Option 1: Get Valid Test Credentials

1. **Contact PhonePe Support:**
   - Email: merchantsupport@phonepe.com
   - Ask: "Is M23H2V31G7L3S_2511201935 a valid sandbox merchant ID?"
   - Request proper test credentials if not

2. **Register for PhonePe Merchant Account:**
   - Visit: https://business.phonepe.com/
   - Sign up and complete KYC
   - Request sandbox access
   - Get your own credentials

#### Option 2: Use Production Credentials (When Ready)

1. Complete PhonePe merchant onboarding
2. Get production merchant credentials
3. Update environment variables:
   ```env
   PHONEPE_ENV=production
   PHONEPE_MERCHANT_ID=your_production_merchant_id
   PHONEPE_CLIENT_SECRET=your_production_secret
   ```

## 🧪 Testing the Integration

### Local Testing (Development)

1. **Create `.env` file in backend folder:**
   ```env
   PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
   PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
   PHONEPE_SALT_INDEX=1
   PHONEPE_ENV=test
   PHONEPE_REDIRECT_URL=http://localhost:5173/payment/callback
   PHONEPE_CALLBACK_URL=http://localhost:3000/api/payment/callback
   ```

2. **Start backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Check console for SDK initialization message**

4. **Test payment flow through your frontend**

### Production Testing

1. Ensure all environment variables are set on Render
2. Visit your frontend and try checkout
3. Monitor backend logs on Render
4. Check for any SDK errors

## 📊 Benefits of Using Official SDK

✅ **Automatic checksum generation/verification**  
✅ **Built-in security best practices**  
✅ **Official PhonePe support**  
✅ **Easier to maintain and update**  
✅ **Better error handling**  
✅ **Type safety (if using TypeScript)**  

## 🔍 Troubleshooting

### SDK Not Initialized

**Error:** "PhonePe SDK client not initialized"

**Solution:**
- Check environment variables are set correctly
- Verify credentials format (no extra spaces)
- Check backend logs for initialization errors

### Invalid Credentials

**Error:** "Key not found for the merchant"

**Solution:**
- Verify credentials with PhonePe support
- Ensure you're using valid sandbox/production credentials
- Contact merchantsupport@phonepe.com

### Payment Initiation Fails

**Error:** "Failed to initiate payment"

**Solution:**
- Check if SDK is initialized (see logs)
- Verify redirect/callback URLs are accessible
- Ensure amount is in paise (multiply by 100)
- Check merchant transaction ID is unique

### Webhook Verification Fails

**Error:** "Invalid webhook signature"

**Solution:**
- Ensure callback URL is publicly accessible
- Verify same credentials used for init and webhook
- Check PhonePe webhook is calling correct endpoint

## 📞 Support Contacts

### PhonePe Support:
- **Email:** merchantsupport@phonepe.com
- **Developer Portal:** https://developer.phonepe.com/
- **Business Portal:** https://business.phonepe.com/

### SDK Documentation:
- **Node.js SDK:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/
- **API Reference:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/

## 🎯 Next Steps

1. ✅ SDK installed and code updated
2. ⚠️  Add environment variables to Render
3. 🔄 Deploy and verify SDK initialization
4. ✉️  Contact PhonePe for valid credentials
5. 🧪 Test payment flow end-to-end
6. 🚀 Go live with valid credentials

---

**Last Updated:** 2025-01-20  
**SDK Version:** v2  
**Status:** Ready for deployment with valid credentials

