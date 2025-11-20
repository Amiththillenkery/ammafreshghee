# 📱 WhatsApp Auto-Send Setup Guide

## Why WhatsApp Messages Aren't Being Sent Automatically?

WhatsApp doesn't allow automatic message sending without proper authentication. You need to use one of these methods:

---

## ⭐ Option 1: CallMeBot (FREE & EASIEST)

**Best for:** Testing, small businesses, personal use

### Setup Steps:

1. **Save CallMeBot Number:**
   - Save this number in your phone: **+34 644 44 3627**
   - Name it "CallMeBot"

2. **Send Activation Message:**
   - Open WhatsApp
   - Send this EXACT message to +34 644 44 3627:
   ```
   I allow callmebot to send me messages
   ```

3. **Get Your API Key:**
   - You'll receive a message with your API key (looks like: `123456`)
   - Copy this key

4. **Configure Backend:**
   
   Create `backend/.env` file:
   ```env
   PORT=3000
   ADMIN_API_KEY=your-secret-key-123
   
   # Notification Setup
   NOTIFICATION_METHOD=whatsapp
   
   # CallMeBot Configuration
   WHATSAPP_PROVIDER=callmebot
   CALLMEBOT_API_KEY=123456
   CALLMEBOT_PHONE=+919876543210
   
   # Business Info
   BUSINESS_NAME=Amma Fresh
   BUSINESS_PHONE=+91-1234567890
   ```
   
   Replace:
   - `123456` with your CallMeBot API key
   - `+919876543210` with your phone number (with country code)

5. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

### ⚠️ Important Note:
CallMeBot sends messages to YOUR phone first. You'll need to forward them to customers. This is a limitation of the free service.

**How it works:**
1. Customer places order
2. CallMeBot sends notification to YOUR phone
3. You forward the message to the customer

---

## 🏢 Option 2: WATI (Professional - Free Tier Available)

**Best for:** Automated sending to customers directly

### Setup Steps:

1. **Create WATI Account:**
   - Go to: https://www.wati.io/
   - Sign up (has free tier with 1000 messages/month)

2. **Connect WhatsApp Business:**
   - Follow WATI's setup wizard
   - Connect your WhatsApp Business number
   - Complete verification

3. **Get API Credentials:**
   - Go to WATI Dashboard → API Docs
   - Copy your:
     - API URL (looks like: `https://live-server-XXXX.wati.io/api/v1/sendSessionMessage`)
     - API Key

4. **Configure Backend:**
   
   Add to `backend/.env`:
   ```env
   NOTIFICATION_METHOD=whatsapp
   
   # WATI Configuration
   WHATSAPP_PROVIDER=wati
   WATI_API_URL=https://live-server-XXXX.wati.io/api/v1/sendSessionMessage
   WATI_API_KEY=your-wati-api-key
   
   BUSINESS_NAME=Amma Fresh
   BUSINESS_PHONE=+91-1234567890
   ```

5. **Restart Backend**

**Advantages:**
- ✅ Sends directly to customers
- ✅ Fully automated
- ✅ Free tier available
- ✅ Professional dashboard
- ✅ Message templates

---

## 🚀 Option 3: Interakt (Professional)

**Best for:** Marketing + transactional messages

### Setup Steps:

1. **Create Interakt Account:**
   - Go to: https://www.interakt.shop/
   - Sign up and verify

2. **Connect WhatsApp:**
   - Complete WhatsApp Business API setup
   - Get verified

3. **Get API Key:**
   - Go to Settings → API
   - Copy your API key

4. **Configure Backend:**
   
   Add to `backend/.env`:
   ```env
   NOTIFICATION_METHOD=whatsapp
   
   # Interakt Configuration
   WHATSAPP_PROVIDER=interakt
   INTERAKT_API_KEY=your-interakt-api-key
   
   BUSINESS_NAME=Amma Fresh
   BUSINESS_PHONE=+91-1234567890
   ```

---

## 🔗 Option 4: Link Mode (Manual Sending)

**Best for:** When you want to manually approve each message

This is the DEFAULT if no provider is configured.

### How it Works:

1. Customer places order
2. Backend generates WhatsApp link
3. Link appears in console logs
4. You click the link
5. WhatsApp Web opens with pre-filled message
6. You click Send

### Configure:

```env
NOTIFICATION_METHOD=whatsapp
WHATSAPP_PROVIDER=link

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

When an order is placed, check your backend console for:
```
📱 ============================================
📱 WHATSAPP MESSAGE READY
📱 ============================================
Customer: Ramesh Kumar
Phone: 9876543210
Order: AFK1732098765432

🔗 Click this link to send WhatsApp message:
https://wa.me/919876543210?text=...
📱 ============================================
```

Click the link to send!

---

## 📧 Recommended: Use Email Instead (or Both)

Email is FREE and fully automated without any API setup!

```env
# Send only email (easiest)
NOTIFICATION_METHOD=email

# Or send both email and WhatsApp
NOTIFICATION_METHOD=both

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

See `NOTIFICATION_SETUP.md` for email setup guide.

---

## 🧪 Testing WhatsApp

### Test with admin endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: your-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "name": "Test Customer"
  }'
```

### Check server logs:

When the server starts, you should see:

```
📱 WhatsApp Configuration:
Provider: callmebot (or wati, interakt, link)
Status: ✅ Configured
```

---

## ❓ Troubleshooting

### "No WhatsApp message sent"

**Reason:** WhatsApp requires API setup or manual sending.

**Solution:** Choose one of the options above and configure it.

### "CallMeBot API error"

**Check:**
- ✅ Did you send the activation message?
- ✅ Is the API key correct in .env?
- ✅ Is your phone number in international format (+919876543210)?

### "WATI/Interakt not working"

**Check:**
- ✅ Is your WhatsApp Business number verified?
- ✅ Are API credentials correct?
- ✅ Do you have message credits?
- ✅ Check the provider's dashboard for errors

### "Link not appearing in console"

**Check:**
- ✅ Is `NOTIFICATION_METHOD` set to `whatsapp` or `both`?
- ✅ Is `WHATSAPP_PROVIDER` set to `link`?
- ✅ Restart the backend server

---

## 💰 Cost Comparison

| Method | Cost | Setup Time | Auto-Send | Best For |
|--------|------|------------|-----------|----------|
| CallMeBot | FREE | 2 min | ❌ Manual forward | Testing |
| WATI | Free tier + paid | 15 min | ✅ Yes | Small business |
| Interakt | Paid plans | 20 min | ✅ Yes | Growing business |
| Link Mode | FREE | 0 min | ❌ Manual click | Testing |
| Email | FREE | 5 min | ✅ Yes | **RECOMMENDED** |

---

## 🎯 My Recommendation

**For Quick Start:**
1. Use **Email** (free, fully automated, no setup needed)
2. Add **CallMeBot** for WhatsApp notifications to yourself
3. Forward important orders to customers manually

**For Professional Business:**
1. Use **Email** for automated confirmations
2. Use **WATI** for automated WhatsApp (has free tier)
3. Set `NOTIFICATION_METHOD=both` to send both

**Configuration for both:**
```env
NOTIFICATION_METHOD=both

# Email (automated)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# WhatsApp via WATI (automated)
WHATSAPP_PROVIDER=wati
WATI_API_URL=your-wati-url
WATI_API_KEY=your-wati-key

# Business Info
BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

---

Need help? Check backend console logs for detailed information!

