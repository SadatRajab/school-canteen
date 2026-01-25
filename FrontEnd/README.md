# School Canteen System - Full Stack Application

A complete canteen management system with **CASH-ONLY payment**, timezone-aware queue numbers, bilingual support (Arabic/English), and comprehensive kitchen workflow.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **CASH-ONLY payment enforcement** (no online payment processing)
- **Timezone-aware daily queue numbers** (resets at midnight in user's timezone)
- **3-state order workflow**: PENDING → PREPARING → DELIVERED
- **Single admin account** with password-based authentication
- **Bilingual product names** (Arabic + English)
- **Kitchen-specific API** (no prices exposed to kitchen staff)

### Frontend (Angular 17 + Material)
- **Student Menu & Cart**: Browse products, add to cart, checkout (CASH payment)
- **Public Display Screen**: Real-time queue display with auto-refresh (TV mode)
- **Kitchen Screen**: Order preparation interface (NO PRICES shown)
- **Admin Dashboard**: Products CRUD, orders management, profit tracking
- **Bilingual UI**: Full Arabic/English with automatic RTL/LTR direction
- **Responsive Design**: Mobile, tablet, desktop, and TV screen support

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+
- **Angular CLI** 17+

---

## 🚀 Setup Instructions

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file with the following content:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-canteen
JWT_SECRET=your-secret-key-change-this-in-production
ADMIN_PASSWORD=admin123

# Start MongoDB (if not running)
mongod --dbpath C:\data\db

# Start backend server
npm start
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```powershell
# Navigate to frontend directory
cd FrontEnd

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on: `http://localhost:4200`

---

## 🎯 Features

### Student Features
- **Browse Menu**: View all available products with bilingual names and images
- **Add to Cart**: Select products and quantities
- **Checkout**: Submit order and receive queue number
- **CASH PAYMENT**: All payments handled offline at counter

### Public Display Features
- **Real-time Queue Display**: Auto-refreshing every 5 seconds
- **TV Mode**: Large fonts and high contrast for TV screens
- **Queue Numbers**: Big, visible queue numbers with status badges
- **Status Tracking**: PENDING (orange), PREPARING (blue), DELIVERED (green)

### Kitchen Features
- **Order Cards**: Large cards with queue numbers and items
- **NO PRICES**: Kitchen staff never sees pricing information
- **Start Preparing**: Button to move orders from PENDING to PREPARING
- **Auto-refresh**: Polls every 3 seconds for new orders
- **TV Mode**: Optimized for large kitchen displays

### Admin Features
- **Login**: Password-based authentication
- **Products Management**:
  - Create new products (bilingual names, price, image)
  - Edit existing products
  - Toggle availability
  - Delete products
  - Image upload support
- **Orders Management**:
  - View all orders with filters (PENDING, PREPARING, DELIVERED)
  - Mark orders as delivered
  - Real-time status updates
- **Profit Display**:
  - Today's revenue
  - Total revenue (all time)
  - Visual cards with gradients

---

## 🌐 Routes

### Frontend Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/menu` | Student menu and shopping cart | Public |
| `/display` | Public queue display screen | Public |
| `/kitchen` | Kitchen preparation screen | Public |
| `/admin/login` | Admin login | Public |
| `/admin/dashboard` | Admin dashboard | Protected (requires login) |

### Backend API Endpoints

#### Public Endpoints
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order (student checkout)
- `GET /api/orders/today` - Get today's orders (for display screen)
- `GET /api/kitchen/orders/today` - Get today's orders (for kitchen, NO PRICES)
- `PATCH /api/kitchen/orders/:id/start` - Start preparing order

#### Admin Endpoints (require JWT token)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/deliver` - Mark order as delivered
- `GET /api/admin/profit/today` - Get today's profit
- `GET /api/admin/profit/total` - Get total profit
- `POST /api/upload` - Upload product image

---

## 🔐 Security Features

- **Client Price Protection**: Clients never send prices, only `productId` + `quantity`
- **Server-side Calculation**: All totals calculated on backend using current product prices
- **JWT Authentication**: Admin routes protected with bearer tokens
- **Password Hashing**: bcrypt with salt rounds
- **Kitchen Privacy**: Kitchen API never exposes prices
- **Auto-logout**: 401 errors trigger automatic logout and redirect

---

## 🌍 Internationalization (i18n)

### Language Support
- **Arabic (AR)**: Right-to-left (RTL) layout
- **English (EN)**: Left-to-right (LTR) layout

### Language Toggle
- Available in app header (globe icon)
- Switches UI language and document direction
- Saves preference to localStorage

### Bilingual Product Names
- All products have `nameAr` and `nameEn`
- UI automatically displays correct language based on user preference
- Backend stores both languages in all order snapshots

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **TV/Large**: > 1440px

### TV Mode
- Available on Display and Kitchen screens
- 2-3x larger fonts
- High contrast colors
- Minimal clutter
- Optimized for viewing from distance

---

## 🔄 Real-time Updates

### Display Screen
- Auto-refresh: **5 seconds**
- Shows all today's orders sorted by queue number
- Status badges with color coding

### Kitchen Screen
- Auto-refresh: **3 seconds**
- Shows only PENDING and PREPARING orders
- Start preparing button for PENDING orders

---

## 💰 Payment System

### CASH-ONLY Enforcement
- No payment gateway integration
- No credit card processing
- No online payment methods
- Orders submitted with "CASH" payment method
- Student pays at counter after receiving queue number

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (`#667eea`) and Purple (`#764ba2`)
- **PENDING**: Orange (`#ff9800`)
- **PREPARING**: Blue (`#2196f3`)
- **DELIVERED**: Green (`#4caf50`)

### Typography
- **Arabic**: Cairo font (Google Fonts)
- **English**: Roboto (Material default)
- **Queue Numbers**: 4rem-6rem (TV mode: 5rem-8rem)

### Material Theme
- Base theme: `indigo-pink`
- Custom overrides for RTL support
- Status-based color coding

---

## 📦 Technology Stack

### Backend
- Node.js 18+
- Express 4.18
- MongoDB 6+
- Mongoose 8+
- JWT (jsonwebtoken)
- bcrypt
- multer (image uploads)
- CORS enabled

### Frontend
- Angular 17
- TypeScript 5.2
- RxJS 7.8
- Angular Material 17
- SCSS
- Google Fonts (Cairo)

---

## 🛠️ Development

### Build for Production

```powershell
# Backend
cd Backend
npm run build  # If build script exists

# Frontend
cd FrontEnd
npm run build:prod
```

Production build will be in `FrontEnd/dist/`

### Environment Configuration

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-canteen
JWT_SECRET=change-this-in-production
ADMIN_PASSWORD=admin123
```

**Frontend `environment.ts`:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

**Frontend `environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

---

## 📝 Default Credentials

**Admin Login:**
- Password: `admin123` (configurable in backend `.env`)

⚠️ **IMPORTANT**: Change admin password in production!

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```powershell
# Start MongoDB manually
mongod --dbpath C:\data\db
```

### Port Already in Use
```powershell
# Backend (change PORT in .env)
PORT=5001

# Frontend (change in package.json)
ng serve --port 4201
```

### CORS Errors
- Ensure backend CORS is configured correctly
- Check `environment.ts` apiUrl matches backend URL

### npm Install Fails
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -r node_modules
rm package-lock.json

# Reinstall
npm install
```

---

## 📄 License

MIT License - feel free to use for educational purposes.

---

## 🤝 Contributing

This is a school project. For questions or improvements, contact the development team.

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify MongoDB is running
5. Ensure all environment variables are set correctly

---

**Built with ❤️ for School Canteen Management**
