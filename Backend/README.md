# School Canteen Backend API

## 🎯 Overview

Complete backend for a School Canteen web application with **CASH-ONLY** payment enforcement and timezone-aware daily queue numbers.

### Key Features
- ✅ **CASH ONLY Payment** - Server enforces cash-only transactions
- 🌍 **Timezone Aware** - Daily queue numbers based on user's local timezone
- 🔐 **Single Admin Account** - One local admin for complete control
- 📦 **Server-Side Calculations** - All pricing/totals computed server-side
- 🌐 **Bilingual Support** - Arabic and English fields for all products
- 🖼️ **Image Upload** - Optimized image processing with Sharp
- 📊 **Profit Tracking** - Revenue tracking for delivered orders only
- 🍳 **Kitchen Workflow** - Restaurant-style preparation tracking system

---

## 📚 Documentation

- **[KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md)** - Complete kitchen/preparation workflow documentation
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design patterns
- **[API_TESTING_GUIDE.md](API_TESTING_GUIDE.md)** - Comprehensive API testing examples
- **[README_AR.md](README_AR.md)** - Arabic documentation

---

## 🏗️ Architecture

```
Backend/
├── server.js                 # Main application entry point
├── config/
│   └── db.js                # MongoDB connection
├── models/
│   ├── Product.js           # Product schema (bilingual)
│   ├── Order.js             # Order schema (CASH only, 3-state workflow)
│   └── Counter.js           # Atomic queue number generator
├── controllers/
│   ├── productController.js # Product CRUD operations
│   ├── orderController.js   # Order creation & management
│   ├── adminController.js   # Admin auth & profit tracking
│   ├── uploadController.js  # Image upload & optimization
│   └── kitchenController.js # Kitchen workflow (NEW)
├── routes/
│   ├── products.js          # Public product routes
│   ├── orders.js            # Public order routes
│   ├── admin.js             # Protected admin routes
│   └── kitchen.js           # Kitchen preparation routes (NEW)
├── middleware/
│   ├── authAdmin.js         # JWT authentication
│   ├── errorHandler.js      # Central error handler
│   └── validation.js        # Joi validation schemas
├── utils/
│   └── timezone.js          # Timezone helper functions
└── uploads/                 # Image storage directory
```

---

## 📋 Database Schemas

### Product Model
```javascript
{
  nameAr: String (required),
  nameEn: String (required),
  descAr: String,
  descEn: String,
  price: Number (required, min: 0),
  category: String,
  imageUrl: String,
  isAvailable: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  orderNumber: Number (server-generated),
  orderDate: String (YYYY-MM-DD),
  timezone: String (IANA timezone),
  items: [{
    productId: ObjectId,
    nameSnapshotAr: String,
    nameSnapshotEn: String,
    unitPriceSnapshot: Number,
    quantity: Number,
    lineTotal: Number
  }],
  totalAmount: Number (server-calculated),
  paymentMethod: String (ALWAYS "CASH"),
  status: "PENDING" | "PREPARING" | "DELIVERED",  // Updated: 3-state workflow
  preparingAt: Date,  // New: When kitchen started preparing
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Order Status Flow:**
```
PENDING → PREPARING → DELIVERED
   ↓          ↓           ↓
Created   Kitchen    Admin
          Started   Delivered
```

### Counter Model
```javascript
{
  _id: String ("<orderDate>|<timezone>"),
  seq: Number (auto-incremented)
}
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
```

### 3. Generate Admin Password Hash
```bash
# Run this command to generate bcrypt hash for your admin password
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourSecurePassword123', 10).then(hash => console.log(hash));"

# Copy the output hash to ADMIN_PASSWORD_HASH in .env
```

### 4. Set Required Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/school-canteen
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<generated-hash-from-step-3>
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

### 5. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas cloud database
```

### 6. Run the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

---

## 🔐 Security Features

- **Helmet** - Security headers
- **CORS** - Configured cross-origin requests
- **Rate Limiting** - Login endpoint protection (5 attempts/15min)
- **Mongo Sanitize** - NoSQL injection prevention
- **JWT Authentication** - Secure admin routes
- **Joi Validation** - Request body validation
- **CASH-ONLY Enforcement** - Server rejects non-cash payment attempts

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Timezone Header (Required for Orders)
All order-related requests should include:
```
X-Timezone: <IANA timezone string>
```
Examples:
- `Europe/Berlin`
- `America/New_York`
- `Asia/Riyadh`
- `Africa/Cairo`

If not provided, defaults to UTC.

---

## 🔑 Authentication

Admin routes require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📚 API Endpoints

### ✅ Health Check
```http
GET /api/health
```

---

### 🛍️ Products (Public)

#### Get All Products
```http
GET /api/products
GET /api/products?category=Drinks
GET /api/products?available=true
```

#### Get Single Product
```http
GET /api/products/:id
```

---

### 📦 Orders (Public)

#### Create Order (CASH ONLY)
```http
POST /api/orders
Headers:
  Content-Type: application/json
  X-Timezone: Europe/Berlin

Body:
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ]
}

Response:
{
  "success": true,
  "data": {
    "orderId": "507f1f77bcf86cd799439013",
    "orderNumber": 15,
    "orderDate": "2026-01-22",
    "createdAt": "2026-01-22T10:30:00.000Z",
    "status": "PENDING",
    "totalAmount": 45.50,
    "paymentMethod": "CASH"
  }
}
```

**CRITICAL**: Server enforces CASH payment. Any attempt to set `paymentMethod` will be rejected with 400 error.

#### Get Today's Orders
```http
GET /api/orders/today
Headers:
  X-Timezone: Europe/Berlin

Response:
{
  "success": true,
  "count": 25,
  "orderDate": "2026-01-22",
  "timezone": "Europe/Berlin",
  "data": [...]
}
```

#### Get Single Order
```http
GET /api/orders/:id
```

---

### 🔐 Admin Authentication

#### Login
```http
POST /api/admin/login
Body:
{
  "email": "admin@schoolcanteen.com",
  "password": "YourSecurePassword123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "admin@schoolcanteen.com"
  }
}
```

---

### 🛠️ Admin - Products

#### Create Product
```http
POST /api/admin/products
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "nameAr": "شاورما دجاج",
  "nameEn": "Chicken Shawarma",
  "descAr": "شاورما دجاج طازجة",
  "descEn": "Fresh chicken shawarma",
  "price": 25.00,
  "category": "Sandwiches",
  "imageUrl": "/uploads/1234567890.jpg",
  "isAvailable": true
}
```

#### Update Product
```http
PUT /api/admin/products/:id
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body: (same as create)
```

#### Delete Product
```http
DELETE /api/admin/products/:id
Headers:
  Authorization: Bearer <token>
```

---

### 📋 Admin - Orders

#### Get Orders by Date
```http
GET /api/admin/orders
GET /api/admin/orders?date=2026-01-22
GET /api/admin/orders?date=2026-01-22&status=PENDING
Headers:
  Authorization: Bearer <token>
  X-Timezone: Europe/Berlin
```

#### Mark Order as Delivered
```http
PATCH /api/admin/orders/:id/deliver
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "DELIVERED",
    "deliveredAt": "2026-01-22T12:00:00.000Z",
    ...
  }
}
```

---

### 💰 Admin - Profit (Revenue)

#### Get Today's Profit
```http
GET /api/admin/profit/today
Headers:
  Authorization: Bearer <token>
  X-Timezone: Europe/Berlin

Response:
{
  "success": true,
  "date": "2026-01-22",
  "timezone": "Europe/Berlin",
  "data": {
    "deliveredOrdersCount": 45,
    "revenueToday": 1250.75
  }
}
```

#### Get Total Profit (All Time)
```http
GET /api/admin/profit/total
Headers:
  Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "deliveredOrdersCount": 3450,
    "revenueTotal": 89250.50
  }
}
```

---

### 🖼️ Admin - Image Upload

#### Upload Image
```http
POST /api/admin/upload
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body:
  file: <image-file>

Response:
{
  "success": true,
  "imageUrl": "/uploads/1737545678901-123456789.jpg"
}
```

**Features**:
- Auto-resize to max 800x800px
- JPEG compression at 85% quality
- Max file size: 5MB
- Accepts: jpg, jpeg, png, gif, webp

---

### 🍳 Kitchen - Preparation Workflow

> **See [KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md) for complete documentation**

The kitchen system allows staff to view and manage order preparation WITHOUT seeing prices or financial data.

#### Get Today's Kitchen Orders
```http
GET /api/kitchen/orders/today
Headers:
  X-Timezone: Africa/Cairo

Response:
{
  "success": true,
  "count": 5,
  "orderDate": "2026-01-22",
  "data": [
    {
      "orderId": "...",
      "orderNumber": 12,
      "status": "PENDING",
      "createdAt": "2026-01-22T10:15:00Z",
      "items": [
        {
          "nameSnapshotEn": "Chicken Sandwich",
          "nameSnapshotAr": "ساندويتش دجاج",
          "quantity": 2
        }
      ]
    }
  ]
}
```

**Note:** Kitchen sees ONLY PENDING and PREPARING orders. NO prices/totals exposed.

#### Start Preparing Order
```http
PATCH /api/kitchen/orders/:id/start

Response:
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNumber": 12,
    "status": "PREPARING",
    "preparingAt": "2026-01-22T10:20:00Z"
  }
}
```

**Status Flow:**
- `PENDING` → Kitchen can start (`PATCH /api/kitchen/orders/:id/start`)
- `PREPARING` → Only admin can deliver (`PATCH /api/admin/orders/:id/deliver`)
- `DELIVERED` → Final state

---

## 🧪 Example API Calls (curl)

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolcanteen.com",
    "password": "YourSecurePassword123"
  }'
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "عصير برتقال",
    "nameEn": "Orange Juice",
    "descAr": "عصير برتقال طازج",
    "descEn": "Fresh orange juice",
    "price": 10.00,
    "category": "Drinks",
    "isAvailable": true
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:5000/api/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image.jpg"
```

### Create Order (Public)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/Berlin" \
  -d '{
    "items": [
      {
        "productId": "YOUR_PRODUCT_ID",
        "quantity": 2
      }
    ]
  }'
```

### Get Today's Orders
```bash
curl -X GET http://localhost:5000/api/orders/today \
  -H "X-Timezone: Europe/Berlin"
```

### Mark Order Delivered
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Today's Profit
```bash
curl -X GET http://localhost:5000/api/admin/profit/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-Timezone: Europe/Berlin"
```

---

## 🎯 Critical Business Rules

### CASH-ONLY Payment Enforcement

1. **Server-Side Enforcement**:
   - `paymentMethod` is ALWAYS set to "CASH" by the server
   - Client cannot override this value
   - Requests containing `paymentMethod` field are rejected

2. **Validation**:
   ```javascript
   if (req.body.paymentMethod !== undefined) {
     return 400 Error: "CASH is the only allowed payment method"
   }
   ```

3. **Database Schema**:
   ```javascript
   paymentMethod: {
     type: String,
     enum: ['CASH'],
     default: 'CASH'
   }
   ```

### Server-Side Price Calculation

1. **Never Trust Client Values**:
   - Product prices fetched from database
   - Line totals calculated server-side
   - Order totals computed server-side

2. **Price Snapshot**:
   - Product price at order time is stored in `unitPriceSnapshot`
   - Protects against price changes after order placement

### Atomic Queue Number Generation

1. **Daily Counter per Timezone**:
   - Counter ID: `"YYYY-MM-DD|timezone"`
   - Example: `"2026-01-22|Europe/Berlin"`

2. **Atomic Increment**:
   ```javascript
   findByIdAndUpdate(counterId, { $inc: { seq: 1 } }, { upsert: true })
   ```

3. **Guaranteed Unique Numbers**:
   - No race conditions
   - No duplicate queue numbers per day/timezone

---

## 🌍 Timezone Handling

### How It Works

1. **Frontend sends timezone**:
   ```
   X-Timezone: Europe/Berlin
   ```

2. **Server calculates orderDate**:
   ```javascript
   const orderDate = moment.tz(timezone).format('YYYY-MM-DD');
   ```

3. **Queue number is timezone-specific**:
   - User in Berlin at 11 PM gets next day's number
   - User in New York at 5 PM gets current day's number

### Supported Timezones

All IANA timezone strings are supported:
- `Europe/Berlin`
- `America/New_York`
- `Asia/Dubai`
- `Africa/Cairo`
- `Asia/Tokyo`
- etc.

### Fallback Behavior

If `X-Timezone` header is missing or invalid:
- Defaults to **UTC**
- Warning logged in console
- Order still processed successfully

---

## 📊 Profit Calculation Rules

1. **Only DELIVERED orders count**:
   ```javascript
   status === 'DELIVERED'
   ```

2. **Revenue = Total Amount**:
   - Since all payments are CASH
   - No payment processing fees
   - No chargebacks

3. **Two Endpoints**:
   - `/profit/today` - Daily revenue (timezone-aware)
   - `/profit/total` - All-time revenue

---

## 🔧 Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/school-canteen
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=<secure-bcrypt-hash>
JWT_SECRET=<minimum-32-character-random-string>
JWT_EXPIRES_IN=12h
CORS_ORIGIN=https://yourdomain.com
```

### Security Checklist
- ✅ Use strong JWT_SECRET (32+ random characters)
- ✅ Use strong admin password (12+ characters)
- ✅ Enable HTTPS in production
- ✅ Configure proper CORS origin
- ✅ Use MongoDB Atlas with authentication
- ✅ Enable rate limiting
- ✅ Regular security updates

### Performance Tips
- Use MongoDB indexes (already configured)
- Enable gzip compression
- Use PM2 for process management
- Monitor with logging service
- Regular database backups

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### JWT Token Invalid
- Check `JWT_SECRET` matches between token creation and validation
- Verify token hasn't expired (default 12h)
- Ensure `Authorization: Bearer <token>` format is correct

### Image Upload Fails
- Check `uploads/` directory exists and is writable
- Verify file size is under 5MB
- Ensure file is valid image format

### Order Creation Rejected
- Verify all `productId` values exist in database
- Ensure products are marked as `isAvailable: true`
- Check quantity is positive integer
- Verify `X-Timezone` header is valid IANA timezone

---

## 📝 License

ISC

---

## 👥 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for School Canteen Management**

**Remember: CASH ONLY - No exceptions!** 💵
