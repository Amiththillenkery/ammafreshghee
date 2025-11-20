# 🚀 Deployment Guide - Amma Fresh

## Production Backend URL

**Backend URL:** `https://ammafreshghee.onrender.com`

---

## 📦 Frontend Configuration

The frontend is **already configured** to work in all environments automatically:

### Auto-Detection Logic:

```typescript
// Automatically detects the right backend URL:

1. localhost/127.0.0.1 → http://localhost:3000/api
2. Network IP (192.168.x.x/10.x.x.x) → http://<your-ip>:3000/api  
3. Production domain → https://ammafreshghee.onrender.com/api
```

### How It Works:

- ✅ **Development (localhost)**: Uses `http://localhost:3000/api`
- ✅ **Mobile Testing (192.168.1.21)**: Uses `http://192.168.1.21:3000/api`
- ✅ **Production**: Uses `https://ammafreshghee.onrender.com/api`

**No configuration changes needed!** The app detects the environment automatically.

---

## 🔧 Manual Override (Optional)

If you need to manually set the backend URL, create a `.env` file:

### For Development:

```env
# .env (in project root)
VITE_API_URL=http://localhost:3000/api
```

### For Production:

```env
# .env.production (in project root)
VITE_API_URL=https://ammafreshghee.onrender.com/api
```

### For Network Testing:

```env
# .env (in project root)
VITE_API_URL=http://192.168.1.21:3000/api
```

---

## 🚀 Deployment Steps

### Deploy Backend (Render)

Your backend is already deployed at:
```
https://ammafreshghee.onrender.com
```

Make sure these environment variables are set on Render:

```env
PORT=3000
NODE_ENV=production
ADMIN_API_KEY=your-secret-admin-key
NOTIFICATION_METHOD=email
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
BUSINESS_NAME=Amma Fresh
BUSINESS_PHONE=+91-1234567890
```

### Deploy Frontend (Vercel/Netlify/etc.)

#### Option 1: Vercel

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project
   - Click Deploy

3. **No environment variables needed!**
   - The app auto-detects production mode
   - Uses Render backend automatically

#### Option 2: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to https://netlify.com/
   - Drag and drop the `dist` folder
   - Or connect to GitHub for continuous deployment

3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option 3: Manual Hosting

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider
   - The `dist` folder contains all static files
   - Upload to any static hosting service

---

## 🧪 Testing Before Deployment

### Test Production Build Locally:

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

The preview will run at `http://localhost:4173`

**Test these features:**
- ✅ Products load from backend
- ✅ Cart works
- ✅ Checkout creates orders
- ✅ Order tracking works (by ID and phone)
- ✅ Notifications are sent (email/WhatsApp)

---

## 🔒 CORS Configuration

Make sure your backend (`backend/server.js`) has CORS enabled:

```javascript
import cors from 'cors';

// Enable CORS for all origins in production
app.use(cors({
  origin: '*', // Or specify your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

**Current setup:** Already enabled in your backend ✅

---

## 📊 Environment Summary

| Environment | Frontend URL | Backend URL |
|-------------|-------------|-------------|
| **Development** | http://localhost:5173 | http://localhost:3000 |
| **Mobile Testing** | http://192.168.1.21:5173 | http://192.168.1.21:3000 |
| **Production** | https://your-domain.com | https://ammafreshghee.onrender.com |

---

## ✅ Production Checklist

Before going live:

### Backend (Render):
- [ ] Environment variables are set
- [ ] Email/WhatsApp notifications configured
- [ ] Admin API key is secure
- [ ] Database is initialized
- [ ] CORS is enabled
- [ ] Health check works: `https://ammafreshghee.onrender.com/api/health`

### Frontend:
- [ ] Build runs without errors: `npm run build`
- [ ] All features tested in production preview
- [ ] Products load correctly
- [ ] Cart and checkout work
- [ ] Order tracking works
- [ ] Mobile responsive
- [ ] Fast loading time

### Testing:
- [ ] Create test order
- [ ] Receive email/WhatsApp confirmation
- [ ] Track order by ID
- [ ] Track order by phone number
- [ ] Test on mobile device
- [ ] Test on different browsers

---

## 🐛 Troubleshooting

### "Failed to fetch" errors:

**Issue:** Frontend can't connect to backend

**Solutions:**
1. Check backend is running: Visit `https://ammafreshghee.onrender.com/api/health`
2. Check CORS is enabled on backend
3. Check browser console for exact error
4. Verify backend URL in network tab

### Backend URL not auto-detected:

**Solution:** Manually set in `.env`:
```env
VITE_API_URL=https://ammafreshghee.onrender.com/api
```

### Build fails:

**Check:**
- All dependencies installed: `npm install`
- TypeScript errors: `npm run build`
- Node version: Use Node 18+

---

## 📝 Important Files

**Frontend Configuration:**
- `src/services/api.ts` - API URL detection logic
- `vite.config.ts` - Vite configuration
- `.env` - Environment variables (optional)

**Backend Configuration:**
- `backend/server.js` - Main server file
- `backend/.env` - Backend environment variables
- `backend/database.js` - Database configuration

---

## 🎯 Quick Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Backend
cd backend
npm start                # Start backend server

# Testing
curl https://ammafreshghee.onrender.com/api/health  # Test backend
```

---

## 🌐 URLs Reference

**Production Backend:**
- Base URL: `https://ammafreshghee.onrender.com`
- API Base: `https://ammafreshghee.onrender.com/api`
- Health Check: `https://ammafreshghee.onrender.com/api/health`

**API Endpoints:**
- Products: `GET /api/products`
- Create Order: `POST /api/orders`
- Track Order: `GET /api/track/:orderNumber`
- Track by Phone: `GET /api/track/phone/:phoneNumber`
- Admin Orders: `GET /api/admin/orders` (requires API key)

---

## 🎉 Ready to Deploy!

Your app is **production-ready** and configured to work with:
- ✅ `https://ammafreshghee.onrender.com` as backend
- ✅ Auto-detection for all environments
- ✅ Mobile-friendly on local network
- ✅ Ready for any frontend hosting platform

**Just build and deploy!** 🚀

