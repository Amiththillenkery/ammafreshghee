# PhonePe Integration - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Configure Backend Environment

Create or update `backend/.env` file:

```env
# Add these PhonePe settings
PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=test
PHONEPE_REDIRECT_URL=http://localhost:5173/payment/callback
PHONEPE_CALLBACK_URL=http://localhost:3000/api/payment/callback
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Step 3: Test Payment

1. Open: http://localhost:5173
2. Add products to cart (🛒)
3. Click "Checkout"
4. Fill delivery details
5. Click "Proceed to Payment"
6. Complete test payment on PhonePe page
7. See payment confirmation! ✅

## 📱 What Happens Now?

### Customer Experience:
1. **Add to Cart** → Products selected
2. **Checkout** → Fill address details
3. **Payment** → Secure PhonePe payment page
4. **Success** → Order confirmed with order number
5. **Notification** → Confirmation (if SMS/Email configured)

### Admin View:
- Orders appear with payment status
- Track payment transactions
- Update order status as usual

## 🎯 Key Files Modified

### Backend (New/Updated):
- ✅ `backend/phonePeService.js` - Payment service
- ✅ `backend/server.js` - Payment endpoints added
- ✅ `backend/database.js` - Payment fields added

### Frontend (Updated):
- ✅ `src/components/Checkout.vue` - Payment flow
- ✅ `src/components/PaymentCallback.vue` - New callback page
- ✅ `src/services/api.ts` - Payment API methods
- ✅ `src/App.vue` - Callback routing

## 🔧 Configuration Options

### Development (Current Setup):
- Using test credentials
- Local URLs
- Sandbox environment

### Production (When Ready):
1. Get production credentials from PhonePe
2. Update `.env` with production values
3. Change `PHONEPE_ENV=production`
4. Update redirect/callback URLs to production domain

## ⚙️ How It Works

```
1. User clicks "Proceed to Payment"
   ↓
2. Backend creates order (status: payment_pending)
   ↓
3. PhonePe payment initiated
   ↓
4. User redirected to PhonePe
   ↓
5. User completes payment
   ↓
6. PhonePe notifies backend (webhook)
   ↓
7. User redirected to callback page
   ↓
8. Payment verified
   ↓
9. Success! Order status: pending (ready for processing)
```

## 🎨 Payment States

| Icon | Status | Meaning |
|------|--------|---------|
| ⏳ | Processing | Verifying payment... |
| ✅ | Success | Payment completed! |
| ❌ | Failed | Payment unsuccessful |
| ⏱️ | Pending | Payment in progress |

## 🔍 Testing Tips

### Test Scenarios:
1. ✅ Successful payment
2. ❌ Failed payment
3. ⏱️ Pending payment
4. 🔁 Retry after failure
5. 🏠 Go back to home

### Browser Console:
- Check for any errors
- Verify API calls
- Monitor payment status

## 🐛 Common Issues

**Issue:** "Failed to initiate payment"  
**Fix:** Check if backend is running and .env is configured

**Issue:** Payment redirects but status not updating  
**Fix:** For local testing, callback URL must be accessible. Use ngrok if needed.

**Issue:** Order not created  
**Fix:** Check database connection and verify migration ran

## 📊 Database Changes

New columns in `orders` table:
- `payment_transaction_id` - PhonePe transaction reference
- `payment_status` - Payment status from PhonePe

Migration file: `backend/migrations/add_payment_fields.sql`

## 🎉 You're All Set!

Your PhonePe payment integration is ready to test. Start the servers and try making a payment!

## 📚 More Information

- **Full Documentation:** See `PHONEPE_INTEGRATION.md`
- **Setup Details:** See `backend/PHONEPE_SETUP.md`
- **PhonePe Docs:** https://developer.phonepe.com/

## 💡 Pro Tips

1. **Test thoroughly** with different scenarios
2. **Monitor logs** during testing
3. **Check database** after each payment
4. **Use browser DevTools** to debug issues
5. **Keep test credentials** secure

---

**Need Help?**  
Check the troubleshooting section in `PHONEPE_INTEGRATION.md`

Happy Testing! 🚀

