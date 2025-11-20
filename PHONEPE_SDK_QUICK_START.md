# PhonePe Official SDK - Quick Start

## 🎉 SDK Integration Complete!

Your backend now uses the **official PhonePe Node.js SDK** for secure payment processing.

## ⚡ Quick Setup (3 Steps)

### Step 1: Add Environment Variables to Render

Go to Render Dashboard → Your Backend Service → Environment Tab

**Add these variables:**

```env
PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=test
PHONEPE_REDIRECT_URL=https://ammafresh.netlify.app/payment/callback
PHONEPE_CALLBACK_URL=https://ammafreshghee.onrender.com/api/payment/callback
```

**Important:** Update `PHONEPE_REDIRECT_URL` with your actual frontend URL!

### Step 2: Deploy to Render

Push your code to Git, or manually trigger deploy on Render.

### Step 3: Verify Initialization

Check Render logs. You should see:

```
✓ PhonePe SDK initialized successfully
╔════════════════════════════════════════════╗
║   💳 PhonePe SDK Configuration          ║
║  SDK Status: ✓ Initialized
╚════════════════════════════════════════════╝
```

If you see `✗ Failed`, credentials are not loaded properly.

## 🐛 If You Get "Key not found for the merchant"

This means the credentials `M23H2V31G7L3S_2511201935` are not active in PhonePe's system.

### **Solution:**

**Contact PhonePe Support:**
```
Email: merchantsupport@phonepe.com
Subject: Invalid Merchant Credentials - Need Sandbox Access

Message:
"Hello,

I'm trying to integrate PhonePe payment gateway.
I have merchant ID: M23H2V31G7L3S_2511201935

I'm getting 'Key not found for the merchant' error.
Could you please verify if this is a valid test merchant ID?
If not, how can I get proper sandbox credentials for testing?

Thank you"
```

**OR Register for PhonePe:**
- Visit: https://business.phonepe.com/
- Sign up for merchant account
- Complete KYC verification
- Get your own valid credentials

## 📦 What Changed

### Before (Custom Implementation):
- Manual checksum generation
- Direct API calls
- Custom error handling

### After (Official SDK):
- ✅ Automatic checksum handling
- ✅ Built-in security
- ✅ Official support
- ✅ Better error messages
- ✅ Easier maintenance

## 🔧 Environment Variables Explained

| Variable | What It Is | Your Value |
|----------|------------|------------|
| `PHONEPE_MERCHANT_ID` | Your merchant/client ID | `M23H2V31G7L3S_2511201935` |
| `PHONEPE_SALT_KEY` | Your secret key | `NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0` |
| `PHONEPE_SALT_INDEX` | Version (usually 1) | `1` |
| `PHONEPE_ENV` | `test` or `production` | `test` |
| `PHONEPE_REDIRECT_URL` | Where user returns after payment | Your frontend + `/payment/callback` |
| `PHONEPE_CALLBACK_URL` | PhonePe webhook endpoint | Your backend + `/api/payment/callback` |

## 🧪 Testing

### Test Locally:

1. **Create `backend/.env` file:**
   ```env
   PHONEPE_MERCHANT_ID=M23H2V31G7L3S_2511201935
   PHONEPE_SALT_KEY=NGNmNGFmMjktMzQ1ZC00NjQ4LWFhZjYtMDk4MDQ5NzA4N2I0
   PHONEPE_SALT_INDEX=1
   PHONEPE_ENV=test
   PHONEPE_REDIRECT_URL=http://localhost:5173/payment/callback
   PHONEPE_CALLBACK_URL=http://localhost:3000/api/payment/callback
   ```

2. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   npm run dev
   ```

3. **Test payment:**
   - Add products to cart
   - Go to checkout
   - Fill details
   - Click "Proceed to Payment"

### Test on Production:

1. Add environment variables on Render
2. Deploy
3. Check logs for SDK initialization
4. Test checkout on your live site

## ✅ Checklist

- [ ] PhonePe SDK installed (✅ Already done)
- [ ] Environment variables added to Render
- [ ] Backend deployed successfully
- [ ] SDK initialization verified in logs
- [ ] Frontend can connect to backend
- [ ] Test payment flow
- [ ] Contact PhonePe for valid credentials
- [ ] Re-test with valid credentials

## 📚 Documentation Links

- **This Guide:** Quick start reference
- **Detailed Setup:** `backend/PHONEPE_SDK_SETUP.md`
- **PhonePe SDK Docs:** https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/
- **PhonePe Support:** merchantsupport@phonepe.com

## 🎯 Current Status

✅ **Code:** Updated to use official SDK  
✅ **Backend:** Ready for deployment  
⚠️  **Credentials:** Need validation from PhonePe  
⏳ **Next:** Add env vars → Deploy → Contact PhonePe  

## 💡 Pro Tip

While waiting for valid PhonePe credentials, your system automatically falls back to showing appropriate errors. Once you get valid credentials:

1. Just update environment variables on Render
2. Restart the service
3. PhonePe payments will work immediately!

No code changes needed - it's all configuration! 🚀

---

**Need Help?** Check `backend/PHONEPE_SDK_SETUP.md` for detailed troubleshooting.

