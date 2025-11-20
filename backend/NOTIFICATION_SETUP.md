# Notification Setup Guide for Amma Fresh

Send order confirmations via **Email** or **WhatsApp** (or both!) to your customers.

---

## 🚀 Quick Start: Email Setup (Recommended)

Email is the easiest to setup and works reliably. Here's how:

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. Go back to Security, find **App passwords** (under 2-Step Verification section)
5. Click **Select app** → Choose "Mail"
6. Click **Select device** → Choose "Other" → Type "Amma Fresh Backend"
7. Click **Generate**
8. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 2: Configure Backend

Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
ADMIN_API_KEY=your-secret-admin-key-123

# Notification Method
NOTIFICATION_METHOD=email

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Business Information
BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

### Step 3: Install Dependencies

```bash
cd backend
npm install
```

This will install `nodemailer` which is needed for sending emails.

### Step 4: Start Server

```bash
npm start
```

You should see:

```
📧 Notification Configuration Test
===================================
Method: email
Email User: ✅ Configured
Email Password: ✅ Configured
```

### Step 5: Test Email

Use the admin test endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: your-secret-admin-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "name": "Test Customer"
  }'
```

Check the email inbox! 📧

---

## 📱 WhatsApp Setup

WhatsApp is more complex but provides better engagement. There are 3 options:

### Option 1: WhatsApp Link (Easiest - Free)

This generates a WhatsApp link that you can manually click to send messages.

```env
NOTIFICATION_METHOD=whatsapp
```

**Pros:**
- ✅ Free
- ✅ No API setup needed

**Cons:**
- ❌ Requires manual clicking (not fully automated)

### Option 2: WhatsApp Business API (Professional)

Use a WhatsApp Business API provider like:
- **WATI** (https://www.wati.io/) - Popular in India
- **Interakt** (https://www.interakt.shop/)
- **Aisensy** (https://www.aisensy.com/)
- **Gupshup** (https://www.gupshup.io/)

**Setup:**

1. Sign up with your chosen provider
2. Get your API URL and API Key
3. Configure:

```env
NOTIFICATION_METHOD=whatsapp

# WhatsApp Business API
WHATSAPP_API_URL=https://your-provider.com/api/send
WHATSAPP_API_KEY=your-api-key-here

BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

**Note:** You may need to modify the `sendViaWhatsAppAPI` function in `notificationService.js` based on your provider's API format.

### Option 3: Twilio WhatsApp (International)

Twilio provides WhatsApp Business API access globally.

**Setup:**

1. Create Twilio account: https://www.twilio.com/
2. Request WhatsApp Business API access
3. Get approved (may take a few days)
4. Install Twilio SDK:

```bash
npm install twilio
```

5. Configure:

```env
NOTIFICATION_METHOD=whatsapp

TWILIO_WHATSAPP_ENABLED=true
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886
```

---

## 🎯 Send Both Email & WhatsApp

Want maximum reach? Send both!

```env
NOTIFICATION_METHOD=both

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# WhatsApp Configuration
WHATSAPP_API_URL=https://your-provider.com/api/send
WHATSAPP_API_KEY=your-api-key

# Business Info
BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

---

## 📧 Email Message Preview

Customers will receive a beautiful HTML email:

**Subject:** Order Confirmed - AFK1234567890 | Amma Fresh

**Content:**
- ✅ Order confirmation with Order ID
- 📦 Complete list of ordered items
- 💰 Total amount
- 📞 Your business phone number
- 🎨 Beautiful branding with your business name

---

## 📱 WhatsApp Message Preview

```
🎉 *Amma Fresh Order Confirmed!*

Hello Ramesh Kumar,

Your order has been confirmed! 🧈

*Order Details:*
Order ID: AFK1234567890
Total Amount: ₹1200

*Items Ordered:*
• Pure Cow Ghee 500g x 2 - ₹1200

Thank you for your order! We'll deliver fresh homemade ghee to your doorstep. 🏠

Track your order with ID: AFK1234567890

For any queries, call: +91-1234567890

✨ Amma Fresh - Pure & Fresh Homemade Ghee
```

---

## 🧪 Testing

### Test Email Notification

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test Customer"
  }'
```

### Test WhatsApp Notification

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "name": "Test Customer"
  }'
```

### Test Both

```bash
curl -X POST http://localhost:3000/api/admin/test-notification \
  -H "x-api-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phoneNumber": "9876543210",
    "name": "Test Customer"
  }'
```

---

## 🔧 Alternative Email Providers

### Using Outlook/Hotmail

```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Using Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-password
```

### Using Custom SMTP Server

```env
# Remove or comment out EMAIL_SERVICE
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
```

---

## ⚠️ Troubleshooting

### Email Not Sending?

1. **Check App Password:**
   - Make sure you're using an App Password, not your regular Gmail password
   - App Password should be 16 characters (4 groups of 4)

2. **Check 2-Step Verification:**
   - Gmail requires 2-Step Verification to be enabled for App Passwords

3. **Check Console Logs:**
   - Look for error messages in the backend console
   - ✅ means email sent successfully
   - ❌ means there was an error

4. **Test Email Configuration:**
   - Check startup logs for "📧 Email Configuration"
   - Should show ✅ Configured for both user and password

5. **Check Spam Folder:**
   - Test emails might land in spam initially

### WhatsApp Not Working?

1. **Check API Credentials:**
   - Verify API URL and API Key are correct
   - Check with your WhatsApp API provider

2. **Check Phone Number Format:**
   - Should be 10 digits for India (without +91)
   - Or full international format with country code

3. **API Provider Issues:**
   - Check your API provider's dashboard
   - Verify your account is active and has credits

4. **WhatsApp Link Mode:**
   - If using link mode (no API), the link will be logged to console
   - You need to manually click it to send

### Notifications Disabled?

If you see:
```
⚠️  Notifications disabled. Set NOTIFICATION_METHOD in .env
```

Set `NOTIFICATION_METHOD` in your `.env` file to: `email`, `whatsapp`, or `both`

---

## 💰 Cost Comparison

| Method | Cost | Setup Difficulty | Automation |
|--------|------|-----------------|------------|
| Email (Gmail) | FREE | ⭐ Easy | ✅ Full |
| WhatsApp (Link) | FREE | ⭐ Easy | ❌ Manual |
| WhatsApp (API) | ~₹0.10-0.50/msg | ⭐⭐⭐ Medium | ✅ Full |
| Twilio WhatsApp | ~₹1-2/msg | ⭐⭐⭐⭐ Hard | ✅ Full |

**Recommendation:** Start with **Email** (free and easy), add WhatsApp later if needed.

---

## 🔒 Security Best Practices

1. **Never commit .env file:**
   - Already in `.gitignore`
   - Keep all credentials secret

2. **Use App Passwords:**
   - Never use your main Google password
   - Generate specific App Passwords for each application

3. **Rotate Credentials Regularly:**
   - Change API keys every few months
   - Revoke old App Passwords

4. **Monitor Usage:**
   - Check email sent logs
   - Watch for unusual activity

5. **Set Rate Limits:**
   - Consider adding rate limiting to prevent abuse
   - Monitor API usage and costs

---

## 📊 What Happens on Order Placement

1. Customer completes checkout
2. Backend creates order in database
3. Backend triggers notification service (non-blocking, async)
4. Notification is sent (Email/WhatsApp)
5. Customer receives confirmation
6. Success/failure is logged in console
7. Order response is sent to customer (doesn't wait for notification)

**Important:** Order placement doesn't wait for notifications to complete. If notification fails, the order is still created successfully.

---

## 🎓 Advanced: Customize Messages

To customize notification messages, edit `backend/notificationService.js`:

**Email:** Modify `createEmailHTML()` and `createEmailText()` functions
**WhatsApp:** Modify `createWhatsAppMessage()` function

---

## 📞 Need Help?

**Email Issues:**
- Gmail Help: https://support.google.com/mail/answer/185833
- Nodemailer Docs: https://nodemailer.com/

**WhatsApp Issues:**
- Contact your WhatsApp API provider's support
- Check their documentation for API format

**Code Issues:**
- Check backend console logs for detailed errors
- Ensure all environment variables are set correctly

---

## ✅ Quick Checklist

Before going live, make sure:

- [ ] `.env` file is created in `backend` folder
- [ ] `NOTIFICATION_METHOD` is set (email/whatsapp/both)
- [ ] Email credentials are configured (if using email)
- [ ] WhatsApp API is configured (if using WhatsApp)
- [ ] `BUSINESS_NAME` and `BUSINESS_PHONE` are set
- [ ] `npm install` has been run
- [ ] Backend server starts without errors
- [ ] Configuration test shows ✅ for all settings
- [ ] Test notification has been sent successfully
- [ ] `.env` file is NOT committed to Git

---

**Happy Selling! 🧈✨**

For more help, check the console logs - they provide detailed information about what's happening with your notifications.

