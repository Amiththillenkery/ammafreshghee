# Amma Fresh Ghee - Premium E-Commerce Website

A modern, premium Vue.js + TypeScript e-commerce website for selling pure cow ghee. Features a smooth, Ajio-style design with beautiful animations and responsive layout.

## Features

- 🎨 Premium UI with smooth Ajio-style animations
- 📱 Fully responsive design
- ⚡ Built with Vue 3 + TypeScript + Vite
- 🛍️ Complete e-commerce functionality with shopping cart
- 🛒 Add to cart, quantity management, checkout flow
- 🎯 Modern card-based product display with custom bottle designs
- ✨ Smooth transitions and hover effects
- 🚚 Transparent delivery charges (Free delivery on 1kg & 2kg)
- 💰 Multiple package sizes: 100g, 250g, 500g, 750g, 1kg, 2kg
- 📄 Complete About and Contact pages
- 📱 WhatsApp integration for orders
- ✅ No login/registration required for checkout

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe code
- **Vite** - Next-generation frontend tooling
- **CSS3** - Modern styling with custom properties

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **SQLite** - Lightweight SQL database
- **better-sqlite3** - Fast SQLite driver

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Quick Start

#### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies

```bash
cd ..
npm install
```

#### 3. Start Backend Server (Terminal 1)

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:3000`

#### 4. Start Frontend (Terminal 2)

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

**📘 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Pricing

- Base Price: ₹1.2 per gram
- Delivery Charge: ₹49 (FREE on 1kg and 2kg packs)

### Available Packages

| Package | Weight | Product Price | Delivery | Total Price |
|---------|--------|---------------|----------|-------------|
| Small   | 100g   | ₹120         | ₹49      | ₹169        |
| Regular | 250g   | ₹300         | ₹49      | ₹349        |
| Medium  | 500g   | ₹600         | ₹49      | ₹649        |
| Large   | 750g   | ₹900         | ₹49      | ₹949        |
| Value   | 1kg    | ₹1200        | FREE     | ₹1200       |
| Premium | 2kg    | ₹2400        | FREE     | ₹2400       |

## Project Structure

```
amma-fresh-ghee/
├── public/              # Static assets (logo.png)
├── src/
│   ├── components/      # Vue components
│   │   └── ProductCard.vue
│   ├── data/           # Product data
│   │   └── products.ts
│   ├── types/          # TypeScript interfaces
│   │   └── Product.ts
│   ├── App.vue         # Main app component
│   ├── main.ts         # Application entry point
│   └── style.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Contact Information

- **Phone/WhatsApp**: +91 9961757294
- **Email**: anithamith@gmail.com
- **Business Type**: Home-based, Made-to-order
- **Delivery**: Free delivery on 1kg and 2kg orders

## Architecture

### Database (SQLite)
- **Products Table** - Stores all product information
- **Orders Table** - Customer orders with delivery details
- **Order Items Table** - Individual items in each order

### Security Features
- 🔒 **Price Protection** - Prices verified server-side, users cannot manipulate
- 🛡️ **Admin-Only Updates** - Product prices can only be changed by authorized admin
- ✅ **Order Verification** - All calculations done on server

### API Endpoints

**Public:**
- `GET /api/products` - Fetch all products
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderNumber` - Get order details

**Admin (Protected):**
- `PUT /api/admin/products/:id` - Update product price
- `GET /api/admin/orders` - View all orders

## Key Pages

1. **Home/Hero Section** - Brand introduction with logo
2. **Products** - All ghee variants with custom bottle designs (loaded from database)
3. **About** - Story, traditional process, and business details
4. **Contact** - Phone, email, WhatsApp, and FAQ section
5. **Shopping Cart** - Full cart management with checkout
6. **Order Confirmation** - Success page with order number

## Customization

### Adding New Products

Edit `src/data/products.ts` to add or modify products:

```typescript
{
  id: 7,
  name: 'Pure Cow Ghee',
  liter: 1.5,
  price: 1800,  // Calculate: grams * 1.2
  description: 'Product description',
  image: 'image-url',
  badge: 'New',
  deliveryCharge: 0,  // 0 for free, 49 for paid
  grams: 1500
}
```

### Styling

Global CSS variables are defined in `src/style.css`:

```css
:root {
  --primary-color: #d4af37;
  --primary-dark: #b8941f;
  /* ... more variables */
}
```

## License

MIT License - feel free to use this project for your business!

## Support

For support, email support@ammafresh.com or open an issue in the repository.

---

**Amma Fresh Ghee** - No Preservatives • No Chemicals • Traditional Goodness

