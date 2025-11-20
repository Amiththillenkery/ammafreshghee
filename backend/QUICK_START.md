# 🚀 Quick Start - Get Notifications Working in 5 Minutes

## Why No WhatsApp Message?

WhatsApp requires special setup. Here's the simplest solution:

---

## ✅ EASIEST SOLUTION: Use Email (Fully Automated)

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Click "Select app" → Mail
3. Click "Select device" → Other → Type "Amma Fresh"
4. Click Generate
5. Copy the 16-character password

### Step 2: Create .env File

Create a file named `.env` in the `backend` folder with this content:

```env
PORT=3000
ADMIN_API_KEY=my-secret-key-123

NOTIFICATION_METHOD=email

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

Replace with your actual values!

### Step 3: Install & Start

```bash
cd backend
npm install
npm start
```

### Step 4: Test

Place an order - customer will receive email! ✅

---

## 📱 WANT WHATSAPP? 3 Options:

### Option A: Link Mode (No setup, manual sending)

In your `.env`:
```env
NOTIFICATION_METHOD=whatsapp
WHATSAPP_PROVIDER=link
BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

**How it works:**
- When order is placed, check backend console
- You'll see a WhatsApp link
- Click it to send message to customer

### Option B: CallMeBot (Free, 2-minute setup)

1. Save this number: `+34 644 44 3627`
2. Send message: `I allow callmebot to send me messages`
3. You'll get an API key

In your `.env`:
```env
NOTIFICATION_METHOD=whatsapp

WHATSAPP_PROVIDER=callmebot
CALLMEBOT_API_KEY=123456
CALLMEBOT_PHONE=+919876543210

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

**Note:** Messages come to YOUR phone, you forward to customer

### Option C: WATI (Professional, automated)

1. Sign up: https://www.wati.io/ (free tier available)
2. Connect WhatsApp Business number
3. Get API credentials

In your `.env`:
```env
NOTIFICATION_METHOD=whatsapp

WHATSAPP_PROVIDER=wati
WATI_API_URL=your-wati-url
WATI_API_KEY=your-wati-key

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

**Advantage:** Fully automated, sends directly to customers

---

## 🎯 RECOMMENDED: Use Both Email + WhatsApp

```env
NOTIFICATION_METHOD=both

# Email (automated)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# WhatsApp (choose one method above)
WHATSAPP_PROVIDER=link

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

---

## 🧪 Test Your Setup

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: my-secret-key-123" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"9876543210","name":"Test"}'
```

---

## ✅ Current Status Check

When you start the server, look for:

```
📧 Notification Configuration Test
===================================
Method: email (or whatsapp, or both)
Email User: ✅ Configured
Email Password: ✅ Configured
```

All ✅ = Ready to go!

---

## 📁 Where is .env file?

Create it here: `backend/.env` (same folder as `server.js`)

**Important:** Don't commit `.env` file to Git (it's already ignored)

---

## 🆘 Need More Help?

- **Email Setup:** See `NOTIFICATION_SETUP.md`
- **WhatsApp Setup:** See `WHATSAPP_SETUP_GUIDE.md`
- **Issues:** Check backend console for error messages

---

**That's it! You're ready to send notifications!** 🎉

