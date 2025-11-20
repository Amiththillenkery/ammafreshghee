# ✅ PhonePe Official SDK - Correct Implementation

## 🎉 Updated with Correct SDK Methods!

Based on the [official PhonePe Node.js SDK documentation](https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/), I've updated the implementation with the **correct SDK classes and methods**.

---

## 📚 Documentation References

- **Installation:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/installation
- **Class Initialization:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/class-initialization
- **Initiate Payment:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/initiate-payment
- **Create SDK Order:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/create-sdk-order
- **Order Status:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/order-status-api
- **Refund:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/refund

---

## ✅ Correct SDK Usage

### 1. **SDK Imports**

```javascript
import { 
  StandardCheckoutClient, 
  Env, 
  StandardCheckoutPayRequest, 
  MetaInfo 
} from 'pg-sdk-node';
```

### 2. **Client Initialization**

```javascript
const client = StandardCheckoutClient.getInstance(
  clientId,        // Your merchant ID
  clientSecret,    // Your salt key  
  clientVersion,   // Your salt index (usually 1)
  Env.SANDBOX      // or Env.PRODUCTION
);
```

### 3. **Initiate Payment (Correct Method: `client.pay()`)**

```javascript
// Build MetaInfo (optional)
const metaInfo = MetaInfo.builder()
  .udf1(customerName)
  .udf2(customerPhone)
  .udf3(orderId)
  .build();

// Build Payment Request
const request = StandardCheckoutPayRequest.builder()
  .merchantOrderId(merchantOrderId)    // Your unique order ID
  .amount(amount * 100)                 // Amount in paise
  .redirectUrl(redirectUrl)             // Where user returns after payment
  .metaInfo(metaInfo)                   // Optional metadata
  .build();

// Initiate Payment
const response = await client.pay(request);

// Response structure:
// {
//   redirectUrl: "https://phonepe.com/pay/...",  // Redirect user here
//   orderId: "PG_ORDER_ID",                       // PhonePe internal ID
//   state: "PENDING"                              // Order state
// }
```

**Key Points:**
- ✅ Method name: `client.pay()` (not `initiatePayment`)
- ✅ Request builder: `StandardCheckoutPayRequest.builder()`
- ✅ Amount in **paise** (multiply by 100)
- ✅ Response has `redirectUrl` property directly

### 4. **Check Order Status**

```javascript
const response = await client.checkOrderStatus(merchantOrderId);

// Response structure:
// {
//   state: "COMPLETED" | "FAILED" | "PENDING",
//   orderId: "PG_ORDER_ID",
//   amount: 34900,
//   ...
// }
```

### 5. **Webhook Handling**

The SDK may not have a dedicated webhook verification method. For production, implement manual checksum verification:

```javascript
// Decode webhook response
const decodedData = JSON.parse(
  Buffer.from(base64Response, 'base64').toString('utf-8')
);

// Manual checksum verification (recommended for production)
const string = base64Response + saltKey;
const sha256 = crypto.createHash('sha256').update(string).digest('hex');
const expectedChecksum = sha256 + '###' + saltIndex;

if (expectedChecksum === receivedChecksum) {
  // Checksum valid
  const status = decodedData.state;
  const merchantOrderId = decodedData.merchantOrderId;
}
```

---

## 🔧 What Changed in Our Code

### Before (Incorrect):
```javascript
// ❌ Wrong method name
const response = await this.client.initiatePayment(paymentRequest);

// ❌ Wrong request format
const paymentRequest = {
  merchantTransactionId: 'TXN_123',
  amount: 34900,
  ...
};
```

### After (Correct):
```javascript
// ✅ Correct method name
const response = await this.client.pay(request);

// ✅ Correct request builder
const request = StandardCheckoutPayRequest.builder()
  .merchantOrderId('ORDER_123')
  .amount(34900)
  .redirectUrl(url)
  .metaInfo(metaInfo)
  .build();
```

---

## 🚀 Deployment Instructions

### Step 1: Deploy Updated Code

The code has been updated with correct SDK usage:

```bash
git add backend/phonePeService.js
git commit -m "Fix: Use correct PhonePe SDK methods"
git push
```

### Step 2: Environment Variables

Make sure these are set on Render:

```env
PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=test
PHONEPE_REDIRECT_URL=https://ammafresh.netlify.app/payment/callback
PHONEPE_CALLBACK_URL=https://ammafreshghee.onrender.com/api/payment/callback
```

### Step 3: Test

After deployment, check Render logs for:

```
✓ PhonePe SDK initialized successfully
Initiating PhonePe payment with SDK: {
  merchantOrderId: 'AFK1234_56789',
  amount: 34900,
  redirectUrl: 'https://...'
}
```

---

## ⚠️ Known Issue: Invalid Credentials

You may still see **"Key not found for the merchant"** error because:

The credentials `M23H2V31G7L3S_2511201935` need to be **validated with PhonePe**.

### Solution:

**Contact PhonePe Support:**
```
Email: merchantsupport@phonepe.com
Subject: Validate Sandbox Merchant Credentials

"Hello,

I'm integrating PhonePe payment gateway using Node.js SDK.
Merchant ID: M23H2V31G7L3S_2511201935

I'm getting 'Key not found for the merchant' error.
Could you please confirm if this is a valid test merchant ID?
If not, how can I obtain proper sandbox credentials?

Thank you!"
```

**OR Register:**
- Visit: https://business.phonepe.com/
- Complete merchant onboarding
- Get your own credentials

---

## 📊 SDK Method Reference

| Operation | SDK Method | Request Type |
|-----------|-----------|-------------|
| Initialize Client | `StandardCheckoutClient.getInstance()` | - |
| Initiate Payment | `client.pay(request)` | `StandardCheckoutPayRequest` |
| Check Status | `client.checkOrderStatus(orderId)` | String |
| Refund | `client.refund(request)` | `RefundRequest` |

---

## ✅ Implementation Checklist

- [x] SDK installed (`pg-sdk-node`)
- [x] Correct imports added
- [x] Using `client.pay()` method
- [x] Using `StandardCheckoutPayRequest.builder()`
- [x] Using `MetaInfo.builder()`
- [x] Response handling updated
- [x] Amount conversion (× 100 for paise)
- [ ] Deploy to Render
- [ ] Validate credentials with PhonePe
- [ ] Test payment flow

---

## 🎯 Expected Flow

1. **User clicks "Proceed to Payment"**
2. **Backend:** Creates `StandardCheckoutPayRequest`
3. **Backend:** Calls `client.pay(request)`
4. **PhonePe SDK:** Returns `{ redirectUrl, orderId, state }`
5. **Backend:** Sends payment URL to frontend
6. **Frontend:** Redirects user to PhonePe payment page
7. **User:** Completes payment on PhonePe
8. **PhonePe:** Redirects back to your callback URL
9. **Frontend:** Verifies payment status
10. **Success!** Order confirmed

---

## 💡 Key Takeaways

1. **Method Name:** `client.pay()` not `initiatePayment()`
2. **Builder Pattern:** Use `.builder()` for requests
3. **Amount Format:** Multiply by 100 (paise)
4. **Response:** `redirectUrl` is at top level
5. **Credentials:** Validate with PhonePe support

---

## 📞 Support

- **PhonePe Docs:** https://developer.phonepe.com/
- **Support Email:** merchantsupport@phonepe.com
- **Business Portal:** https://business.phonepe.com/

---

**Status:** ✅ Code updated with correct SDK usage  
**Last Updated:** 2025-01-20  
**Next Step:** Deploy and validate credentials with PhonePe

