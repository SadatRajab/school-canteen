# 📊 School Canteen System - Visual Architecture

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SCHOOL CANTEEN SYSTEM                          │
│                        CASH ONLY - 100%                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Public Users   │  │  Kitchen Staff   │  │      Admin       │
│   (Students)     │  │                  │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         │ Browse Products     │ View Orders          │ Manage Everything
         │ Create Orders       │ Start Preparing      │ Deliver Orders
         │ View Queue          │ (No Prices!)         │ Track Profit
         │                     │                      │
         ▼                     ▼                      ▼
┌────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                  │
├────────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │
│  │  Products  │  │  Kitchen   │  │   Admin    │                  │
│  │  /api/     │  │  /api/     │  │  /api/     │                  │
│  │  products  │  │  kitchen   │  │  admin     │                  │
│  └────────────┘  └────────────┘  └────────────┘                  │
│       │               │               │                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │
│  │   Orders   │  │            │  │            │                  │
│  │  /api/     │  │            │  │            │                  │
│  │  orders    │  │            │  │            │                  │
│  └────────────┘  └────────────┘  └────────────┘                  │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CASH-ONLY ENFORCEMENT                                   │    │
│  │  ✓ Server sets paymentMethod = "CASH"                    │    │
│  │  ✓ Rejects client payment attempts                       │    │
│  │  ✓ Database enum: ['CASH'] only                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  ORDER STATUS WORKFLOW                                   │    │
│  │                                                           │    │
│  │  PENDING ──Kitchen──→ PREPARING ──Admin──→ DELIVERED     │    │
│  │     ↓                     ↓                    ↓          │    │
│  │  Created            Kitchen Started        Admin          │    │
│  │  (System)           (Public/Kitchen)     (Protected)      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  PRICE CALCULATION (Server-Side Only)                    │    │
│  │  1. Client sends: productId + quantity                   │    │
│  │  2. Server fetches price from DB                         │    │
│  │  3. Server calculates: lineTotal = price × qty           │    │
│  │  4. Server calculates: totalAmount = Σ lineTotals        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  QUEUE NUMBER GENERATION (Atomic & Timezone-Aware)       │    │
│  │  Counter ID: "YYYY-MM-DD|timezone"                       │    │
│  │  Example: "2026-01-22|Africa/Cairo"                      │    │
│  │  Operation: findOneAndUpdate({ $inc: { seq: 1 }})        │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  KITCHEN DATA FILTERING                                  │    │
│  │  ✓ Exposes: names, quantities, status                    │    │
│  │  ✗ Hides: prices, totals, payment info                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER (MongoDB)                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Products   │  │    Orders    │  │   Counter    │            │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤            │
│  │ nameAr       │  │ orderNumber  │  │ _id (key)    │            │
│  │ nameEn       │  │ orderDate    │  │ seq          │            │
│  │ price        │  │ timezone     │  └──────────────┘            │
│  │ category     │  │ items[]      │                               │
│  │ imageUrl     │  │ totalAmount  │                               │
│  │ isAvailable  │  │ paymentMethod│  CASH ONLY                    │
│  └──────────────┘  │ status       │  ← PREPARING (New!)           │
│                    │ preparingAt  │  ← New Field!                 │
│                    │ deliveredAt  │                               │
│                    └──────────────┘                               │
│                                                                    │
│  Indexes:                                                          │
│  • { orderDate: 1, timezone: 1, orderNumber: 1 }                  │
│  • { status: 1 }                                                   │
│  • { isAvailable: 1 }                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Order Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ORDER LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────┘

  👤 Student                🍳 Kitchen               👨‍💼 Admin
     │                          │                          │
     │ 1. Create Order          │                          │
     │ POST /api/orders         │                          │
     ├──────────────────────────┼──────────────────────────┤
     │                          │                          │
     │ ✓ Order #15 Created      │                          │
     │   Status: PENDING        │                          │
     │   Payment: CASH          │                          │
     │                          │                          │
     │                          │ 2. View Orders           │
     │                          │ GET /kitchen/orders/today│
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ ✓ See Order #15          │
     │                          │   (No Prices!)           │
     │                          │                          │
     │                          │ 3. Start Preparing       │
     │                          │ PATCH /orders/15/start   │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ ✓ Status: PREPARING      │
     │                          │   preparingAt: 10:05 AM  │
     │                          │                          │
     │                          │ 🍳 Cooking...            │
     │                          │                          │
     │                          │                     4. Deliver
     │                          │                     PATCH /admin/orders/15/deliver
     │                          │                          ├────►
     │                          │                          │
     │                          │                     ✓ Status: DELIVERED
     │                          │                       deliveredAt: 10:15 AM
     │ 5. Get Order             │                          │
     │ #15 DELIVERED            │                          │
     ◄──────────────────────────┼──────────────────────────┤
     │                          │                          │
     │ 💰 Pay CASH              │                          │ 💵 Revenue+
     │                          │                          │
```

---

## Data Visibility Matrix

```
┌────────────────────┬──────────┬──────────┬──────────┐
│     Data Field     │  Public  │ Kitchen  │  Admin   │
├────────────────────┼──────────┼──────────┼──────────┤
│ Order Number       │    ✓     │    ✓     │    ✓     │
│ Order Date         │    ✓     │    ✓     │    ✓     │
│ Order Status       │    ✓     │    ✓     │    ✓     │
│ Created At         │    ✓     │    ✓     │    ✓     │
│ Preparing At       │    ✗     │    ✓     │    ✓     │
│ Delivered At       │    ✗     │    ✗     │    ✓     │
├────────────────────┼──────────┼──────────┼──────────┤
│ Item Names (Ar/En) │    ✓     │    ✓     │    ✓     │
│ Item Quantity      │    ✓     │    ✓     │    ✓     │
│ Unit Price         │    ✗     │    ✗     │    ✓     │
│ Line Total         │    ✗     │    ✗     │    ✓     │
│ Total Amount       │    ✓     │    ✗     │    ✓     │
│ Payment Method     │    ✓     │    ✗     │    ✓     │
└────────────────────┴──────────┴──────────┴──────────┘

Legend:
✓ = Visible
✗ = Hidden/Not Accessible
```

---

## Kitchen Screen Layout

```
┌──────────────────────────────────────────────────────────────┐
│                  🍳 KITCHEN DISPLAY                          │
│  Today: 2026-01-22  |  Active Orders: 5                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │   ORDER #12     │  │   ORDER #13     │  │  ORDER #14   ││
│  │   PENDING       │  │  PREPARING      │  │  PENDING     ││
│  ├─────────────────┤  ├─────────────────┤  ├──────────────┤│
│  │ 🍗 Chicken x2   │  │ 🍰 Cake x1      │  │ 🥤 Juice x3  ││
│  │ 🥤 Juice x1     │  │                 │  │              ││
│  │                 │  │  ⏱ 5 min ago    │  │              ││
│  ├─────────────────┤  ├─────────────────┤  ├──────────────┤│
│  │  [START]        │  │  Cooking...     │  │  [START]     ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
│                                                              │
│  NO PRICES - NO TOTALS - FOOD ONLY                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                     │
└──────────────────────────────────────────────────────────────┘

Layer 1: HTTP Security
├─ Helmet (Security Headers)
├─ CORS (Cross-Origin)
├─ Mongo Sanitize (NoSQL Injection)
└─ Rate Limiting (Login: 5/15min)

Layer 2: Authentication
├─ Single Admin Account (Environment)
├─ JWT Token (12h expiry)
├─ Bcrypt Password Hash (10 rounds)
└─ Protected Routes (/api/admin/*)

Layer 3: Authorization
├─ Admin: Full access
├─ Kitchen: Limited (no prices)
└─ Public: Read products, create orders

Layer 4: Data Validation
├─ Joi Schemas (All inputs)
├─ Mongoose Validation (Database)
├─ CASH-ONLY Enforcement (Schema enum)
└─ Forbidden Fields (paymentMethod)

Layer 5: Price Protection
├─ Server calculates all prices
├─ DB is source of truth
├─ Client cannot manipulate
└─ Kitchen cannot see prices
```

---

## API Endpoint Map

```
/api
├── /health                     [GET]    Public - Health check
│
├── /products                   [GET]    Public - List products
│   └── /:id                    [GET]    Public - Get product
│
├── /orders                     [POST]   Public - Create order (CASH)
│   ├── /today                  [GET]    Public - Today's orders
│   └── /:id                    [GET]    Public - Get order
│
├── /kitchen ────────────────── NEW! ────────────────────────
│   ├── /orders/today           [GET]    Kitchen - Active orders
│   ├── /orders                 [GET]    Kitchen - Orders (filters)
│   └── /orders/:id/start       [PATCH]  Kitchen - Start preparing
│
└── /admin (JWT Required)
    ├── /login                  [POST]   Public - Admin login
    │
    ├── /products               [POST]   Admin - Create product
    │   ├── /:id                [PUT]    Admin - Update product
    │   └── /:id                [DELETE] Admin - Delete product
    │
    ├── /orders                 [GET]    Admin - Get orders
    │   └── /:id/deliver        [PATCH]  Admin - Mark delivered
    │
    ├── /profit
    │   ├── /today              [GET]    Admin - Today's profit
    │   └── /total              [GET]    Admin - Total profit
    │
    └── /upload                 [POST]   Admin - Upload image
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│  Backend Stack                                          │
├─────────────────────────────────────────────────────────┤
│  Runtime:       Node.js (v18+)                          │
│  Framework:     Express.js (v4.18)                      │
│  Database:      MongoDB + Mongoose                      │
│  Auth:          JWT + bcryptjs                          │
│  Validation:    Joi                                     │
│  Security:      Helmet, CORS, Mongo-Sanitize            │
│  Rate Limit:    express-rate-limit                      │
│  Images:        Multer + Sharp                          │
│  Timezone:      moment-timezone                         │
└─────────────────────────────────────────────────────────┘
```

---

**System Status:** ✅ Production Ready
**CASH-ONLY:** ✅ 100% Enforced
**Kitchen Workflow:** ✅ Fully Integrated
