# 🏗️ School Canteen Backend - Architecture Summary

## 📊 System Overview

A production-ready Node.js backend for a School Canteen web application with strict **CASH-ONLY** payment enforcement, timezone-aware order queue management, and bilingual (Arabic/English) support.

---

## 🎯 Core Business Logic

### 1. CASH-ONLY Payment System
**Enforcement Points:**
- ✅ **Schema Level**: Order model enum restricts to `['CASH']` only
- ✅ **Validation Level**: Joi schema forbids `paymentMethod` field from client
- ✅ **Controller Level**: Server explicitly sets `paymentMethod = 'CASH'`
- ✅ **Request Rejection**: 400 error if client attempts to set payment method

**Result:** It is **IMPOSSIBLE** for non-cash payments to enter the system.

---

### 2. Server-Side Price Calculation
**Never Trust Client Values:**
```javascript
// Client sends:
{ productId, quantity }

// Server does:
1. Fetch product from DB
2. Use DB price (unitPriceSnapshot)
3. Calculate lineTotal = unitPriceSnapshot × quantity
4. Sum all lineTotals for totalAmount
```

**Protection:** Client cannot manipulate prices, totals, or payment amounts.

---

### 3. Atomic Daily Queue Numbers
**Timezone-Aware Counter System:**

```
Counter ID Format: "YYYY-MM-DD|timezone"
Examples:
- "2026-01-22|Europe/Berlin"
- "2026-01-22|America/New_York"
- "2026-01-21|Asia/Tokyo"
```

**Atomic Increment:**
```javascript
await Counter.findByIdAndUpdate(
  counterId,
  { $inc: { seq: 1 } },
  { upsert: true, new: true }
);
```

**Guarantees:**
- No duplicate queue numbers
- No race conditions
- Automatic daily reset per timezone
- Separate sequences for different timezones

---

### 4. Timezone Handling
**User Location Based:**
- Frontend sends: `X-Timezone: Europe/Berlin`
- Server calculates: `orderDate = moment.tz(timezone).format('YYYY-MM-DD')`
- Result: User's "today" depends on their location, not server location

**Fallback:**
- Missing/invalid timezone → defaults to UTC
- Warning logged, but order still processed

---

## 📁 Project Structure

```
Backend/
│
├── server.js                      # Express app entry point
│
├── config/
│   └── db.js                      # MongoDB connection
│
├── models/
│   ├── Product.js                 # Bilingual product schema
│   ├── Order.js                   # CASH-ONLY order schema
│   └── Counter.js                 # Atomic queue counter
│
├── controllers/
│   ├── productController.js       # Product CRUD
│   ├── orderController.js         # Order creation & management
│   ├── adminController.js         # Auth & profit tracking
│   └── uploadController.js        # Image optimization
│
├── routes/
│   ├── products.js                # Public product routes
│   ├── orders.js                  # Public order routes
│   └── admin.js                   # Protected admin routes
│
├── middleware/
│   ├── authAdmin.js               # JWT authentication
│   ├── errorHandler.js            # Centralized error handling
│   └── validation.js              # Joi request validation
│
├── utils/
│   └── timezone.js                # Timezone helper functions
│
├── uploads/                       # Image storage
│   └── .gitkeep
│
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── README.md                      # Complete documentation
└── API_TESTING_GUIDE.md          # Testing instructions
```

---

## 🔄 Request Flow Diagrams

### Order Creation Flow

```
┌─────────────┐
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │
       │ POST /api/orders
       │ Headers: X-Timezone: Europe/Berlin
       │ Body: { items: [{productId, quantity}] }
       │
       ▼
┌──────────────────────────────────────────────┐
│  Express Middleware Stack                    │
├──────────────────────────────────────────────┤
│  1. CORS check                               │
│  2. Helmet security headers                  │
│  3. JSON body parser                         │
│  4. Joi validation                           │
│     - Validates items array                  │
│     - REJECTS if paymentMethod present       │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  orderController.createOrder()               │
├──────────────────────────────────────────────┤
│  1. Extract timezone from header             │
│  2. Calculate orderDate (YYYY-MM-DD)         │
│  3. For each item:                           │
│     - Fetch product from DB                  │
│     - Validate availability                  │
│     - Use DB price (snapshot)                │
│     - Calculate lineTotal                    │
│  4. Sum totalAmount                          │
│  5. Generate atomic orderNumber:             │
│     - counterId = "date|timezone"            │
│     - Atomic increment counter               │
│  6. Create order:                            │
│     - paymentMethod = "CASH" (server-set)    │
│     - status = "PENDING"                     │
│  7. Save to database                         │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Response to Client                          │
├──────────────────────────────────────────────┤
│  {                                           │
│    orderId, orderNumber, orderDate,          │
│    createdAt, status, totalAmount,           │
│    paymentMethod: "CASH"                     │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

### Admin Authentication Flow

```
┌─────────────┐
│   Admin     │
│  (Client)   │
└──────┬──────┘
       │
       │ POST /api/admin/login
       │ Body: { email, password }
       │
       ▼
┌──────────────────────────────────────────────┐
│  Rate Limiter (5 attempts / 15 min)          │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Joi Validation                              │
│  - Email format                              │
│  - Password min length                       │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  adminController.login()                     │
├──────────────────────────────────────────────┤
│  1. Check email === process.env.ADMIN_EMAIL  │
│  2. bcrypt.compare(password, hash)           │
│  3. Generate JWT token                       │
│  4. Return token                             │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Protected Admin Routes                      │
├──────────────────────────────────────────────┤
│  All /api/admin/* routes require:            │
│  Authorization: Bearer <token>               │
│                                              │
│  protectAdmin middleware:                    │
│  1. Extract token from header                │
│  2. Verify with JWT_SECRET                   │
│  3. Attach admin info to req.admin           │
│  4. Allow request to proceed                 │
└──────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### Product Collection
```javascript
{
  _id: ObjectId,
  nameAr: "ساندويتش دجاج",
  nameEn: "Chicken Sandwich",
  descAr: "ساندويتش دجاج مشوي طازج",
  descEn: "Fresh grilled chicken sandwich",
  price: 25.00,              // Source of truth
  category: "Sandwiches",
  imageUrl: "/uploads/...",
  isAvailable: true,
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
- { isAvailable: 1 }
- { category: 1 }
```

---

### Order Collection
```javascript
{
  _id: ObjectId,
  orderNumber: 15,           // Daily queue number
  orderDate: "2026-01-22",   // YYYY-MM-DD in user's timezone
  timezone: "Europe/Berlin",
  
  items: [
    {
      productId: ObjectId,
      nameSnapshotAr: "ساندويتش دجاج",
      nameSnapshotEn: "Chicken Sandwich",
      unitPriceSnapshot: 25.00,  // Price at order time
      quantity: 2,
      lineTotal: 50.00           // Server calculated
    }
  ],
  
  totalAmount: 60.00,        // Server calculated
  paymentMethod: "CASH",     // ALWAYS CASH
  status: "PENDING",         // or "DELIVERED"
  deliveredAt: null,
  
  createdAt: ISODate,
  updatedAt: ISODate
}

Indexes:
- { orderDate: 1, timezone: 1, orderNumber: 1 }
- { status: 1 }
- { orderDate: 1, status: 1 }
```

---

### Counter Collection
```javascript
{
  _id: "2026-01-22|Europe/Berlin",  // Compound key
  seq: 47                            // Current counter value
}

Purpose:
- Atomic queue number generation
- Separate counters per date/timezone
- Auto-resets daily (new _id next day)
```

---

## 🔐 Security Architecture

### Layer 1: HTTP Security
```javascript
helmet()              // Security headers
cors()                // Cross-origin protection
mongoSanitize()       // NoSQL injection prevention
express.json({ limit: '10mb' })  // Body size limit
```

---

### Layer 2: Authentication
```javascript
Single Admin Account:
- Email stored in: process.env.ADMIN_EMAIL
- Password hash in: process.env.ADMIN_PASSWORD_HASH
- JWT signed with: process.env.JWT_SECRET
- Token expires: 12 hours (configurable)

No registration, no multiple users.
```

---

### Layer 3: Authorization
```javascript
protectAdmin middleware:
1. Extract JWT from Authorization header
2. Verify signature
3. Check expiration
4. Attach admin info to request
5. Allow or reject

Applied to all /api/admin/* routes
```

---

### Layer 4: Rate Limiting
```javascript
Login Endpoint:
- Max 5 attempts per 15 minutes
- Per IP address
- Prevents brute force attacks
```

---

### Layer 5: Input Validation
```javascript
Joi Schemas:
- Product creation/update
- Order creation
- Admin login

Validation rules:
- Type checking
- Required fields
- Min/max values
- String trimming
- Email format
- Forbidden fields (paymentMethod)
```

---

## 📊 Profit Calculation Logic

### Today's Profit (Timezone-Aware)
```javascript
Pipeline:
1. Match orders:
   - orderDate = today (in user's timezone)
   - status = "DELIVERED"
   
2. Aggregate:
   - Count delivered orders
   - Sum totalAmount
   
Result:
{
  date: "2026-01-22",
  timezone: "Europe/Berlin",
  deliveredOrdersCount: 45,
  revenueToday: 1250.75
}
```

---

### Total Profit (All Time)
```javascript
Pipeline:
1. Match orders:
   - status = "DELIVERED"
   
2. Aggregate:
   - Count all delivered orders
   - Sum all totalAmounts
   
Result:
{
  deliveredOrdersCount: 3450,
  revenueTotal: 89250.50
}
```

**Key Point:** Only DELIVERED orders count. PENDING orders are excluded from revenue.

---

## 🖼️ Image Upload Pipeline

```
┌─────────────────┐
│  Client Upload  │
│  (Form Data)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Multer Middleware              │
│  - Memory storage               │
│  - 5MB size limit               │
│  - Image mime type only         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Sharp Processing               │
│  1. Resize: max 800x800px       │
│  2. Format: JPEG                │
│  3. Quality: 85%                │
│  4. Save to /uploads/           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Return URL                     │
│  /uploads/1234567890-xxx.jpg    │
└─────────────────────────────────┘
```

**Features:**
- Auto-optimization
- Consistent format (JPEG)
- Fast serving via express.static
- Unique filenames (timestamp + random)

---

## 🌍 Timezone Scenarios

### Scenario 1: Same Physical Time, Different Dates
```
Physical time: 2026-01-22 23:30 UTC

User A (Berlin, UTC+1):
- Local time: 00:30 (next day)
- orderDate: "2026-01-23"
- orderNumber: 1 (new day)

User B (New York, UTC-5):
- Local time: 18:30 (same day)
- orderDate: "2026-01-22"
- orderNumber: 47 (continuing)
```

**Result:** Each user gets appropriate queue number for their local date.

---

### Scenario 2: Missing Timezone Header
```
Request without X-Timezone header

Server behavior:
1. Logs warning: "Invalid timezone: undefined, falling back to UTC"
2. Uses UTC timezone
3. Calculates orderDate in UTC
4. Order processes successfully
```

**Result:** Graceful fallback, no failures.

---

## 🔄 Order Status Lifecycle

```
┌──────────┐
│  PENDING │ ◄── Initial state (order created)
└─────┬────┘
      │
      │ Admin action: PATCH /admin/orders/:id/deliver
      │
      ▼
┌───────────┐
│ DELIVERED │ ◄── Final state
└───────────┘
      │
      │ deliveredAt timestamp set
      │ Included in profit calculations
      ▼
```

**No other states.** Simple, clear workflow.

---

## 📈 Performance Optimizations

### Database Indexes
```javascript
Products:
- { isAvailable: 1 }        // Fast filtering
- { category: 1 }            // Category queries

Orders:
- { orderDate: 1, timezone: 1, orderNumber: 1 }  // Unique constraint
- { status: 1 }              // Status filtering
- { orderDate: 1, status: 1 } // Profit queries
```

---

### MongoDB Aggregation
```javascript
Profit calculations use aggregation pipelines:
- $match for filtering
- $group for counting/summing
- Single database query
- Efficient computation
```

---

### Image Optimization
```javascript
Sharp library:
- Resize before save (reduces storage)
- JPEG compression (reduces bandwidth)
- Memory processing (no temp files)
- Async operations (non-blocking)
```

---

## 🧪 Testing Strategy

### Unit Tests (Recommended)
- Model validations
- Timezone calculations
- Price calculations
- Queue number generation

---

### Integration Tests (Recommended)
- Order creation flow
- Admin authentication
- Profit calculations
- Image upload

---

### Manual Testing
See `API_TESTING_GUIDE.md` for complete test scenarios.

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Set strong admin password
- [ ] Configure MongoDB connection string
- [ ] Set proper CORS_ORIGIN
- [ ] Review security headers
- [ ] Enable HTTPS (production)

---

### Environment Setup
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>
JWT_SECRET=<random-32-chars>
CORS_ORIGIN=https://yourdomain.com
```

---

### Production Monitoring
- Log all errors
- Monitor API response times
- Track order creation rate
- Monitor MongoDB performance
- Set up health check pings

---

## 🎯 Key Strengths

1. **Unbreakable CASH-ONLY Enforcement**
   - Multiple layers of validation
   - Impossible to bypass
   
2. **Timezone-Aware Operations**
   - Respects user location
   - No hardcoded timezone assumptions
   
3. **Atomic Queue Numbers**
   - No race conditions
   - Guaranteed uniqueness
   
4. **Server-Side Truth**
   - Client cannot manipulate prices
   - All calculations server-side
   
5. **Single Admin Model**
   - Simple, secure
   - No user management overhead
   
6. **Bilingual Support**
   - Arabic and English throughout
   - Proper RTL consideration
   
7. **Production-Ready**
   - Security best practices
   - Error handling
   - Validation
   - Rate limiting

---

## 📞 Support & Maintenance

### Common Tasks

**Add new product:**
```bash
POST /api/admin/products
```

**Mark order delivered:**
```bash
PATCH /api/admin/orders/:id/deliver
```

**Check daily revenue:**
```bash
GET /api/admin/profit/today
```

**Backup database:**
```bash
mongodump --uri="mongodb://..." --out=./backup
```

---

**Built with precision for School Canteen management 🎓**

**Remember: CASH IS KING 💵**
