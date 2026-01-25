# 🍳 Kitchen / Preparation System - Documentation Update

## Overview

This document extends the existing School Canteen Backend API with a **Kitchen / Preparation Workflow** system similar to restaurant operations. The kitchen system allows kitchen staff to view orders, track preparation status, and manage the cooking workflow WITHOUT accessing sensitive financial information.

---

## 🔄 Updated Order Status Flow

### Previous Flow
```
PENDING → DELIVERED
```

### New Flow (Restaurant-Style)
```
PENDING → PREPARING → DELIVERED
```

### Status Definitions

| Status | Description | Who Can Set | Timestamp Field |
|--------|-------------|-------------|-----------------|
| **PENDING** | Order created, not started | System (on order creation) | `createdAt` |
| **PREPARING** | Kitchen started preparing | Kitchen staff | `preparingAt` |
| **DELIVERED** | Order handed to student | Admin only | `deliveredAt` |

### Status Transition Rules

✅ **Allowed Transitions:**
- `PENDING` → `PREPARING` (Kitchen staff via `/api/kitchen/orders/:id/start`)
- `PREPARING` → `DELIVERED` (Admin only via `/api/admin/orders/:id/deliver`)

❌ **Rejected Transitions:**
- `PREPARING` → `PENDING` (Cannot revert)
- `DELIVERED` → Any other status (Final state)
- `PENDING` → `DELIVERED` (Must go through PREPARING)

---

## 📊 Updated Order Model

### Schema Changes

```javascript
{
  // Existing fields (unchanged)
  orderNumber: Number,
  orderDate: String,
  timezone: String,
  items: [...],
  totalAmount: Number,
  paymentMethod: "CASH",  // ALWAYS CASH
  
  // UPDATED: Status field now includes PREPARING
  status: {
    type: String,
    enum: ['PENDING', 'PREPARING', 'DELIVERED'],
    default: 'PENDING'
  },
  
  // NEW: Timestamp when kitchen started preparing
  preparingAt: {
    type: Date,
    default: null
  },
  
  // Existing: Timestamp when order delivered
  deliveredAt: {
    type: Date,
    default: null
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### Complete Order Lifecycle Example

```javascript
// 1. Order Created
{
  orderNumber: 15,
  status: "PENDING",
  createdAt: "2026-01-22T10:00:00Z",
  preparingAt: null,
  deliveredAt: null
}

// 2. Kitchen Starts Preparing
{
  orderNumber: 15,
  status: "PREPARING",
  createdAt: "2026-01-22T10:00:00Z",
  preparingAt: "2026-01-22T10:05:00Z",
  deliveredAt: null
}

// 3. Admin Delivers Order
{
  orderNumber: 15,
  status: "DELIVERED",
  createdAt: "2026-01-22T10:00:00Z",
  preparingAt: "2026-01-22T10:05:00Z",
  deliveredAt: "2026-01-22T10:15:00Z"
}
```

---

## 🍽️ Kitchen Data Requirements

### What Kitchen Staff MUST See:
- ✅ Queue number (large, prominent)
- ✅ Order creation time
- ✅ Food item names (Arabic & English)
- ✅ Quantity per item
- ✅ Order status (PENDING/PREPARING)
- ✅ Preparing start time

### What Kitchen Staff MUST NOT See:
- ❌ Product prices
- ❌ Line totals
- ❌ Order total amount
- ❌ Payment method
- ❌ Profit calculations
- ❌ Customer/student information

### Kitchen Order Item Structure

```javascript
// Kitchen sees ONLY:
{
  nameSnapshotEn: "Chicken Sandwich",
  nameSnapshotAr: "ساندويتش دجاج",
  quantity: 2
  // NO PRICES EXPOSED
}

// Full item in database (kitchen cannot see prices):
{
  productId: "...",
  nameSnapshotEn: "Chicken Sandwich",
  nameSnapshotAr: "ساندويتش دجاج",
  unitPriceSnapshot: 25.00,  // HIDDEN from kitchen
  quantity: 2,
  lineTotal: 50.00           // HIDDEN from kitchen
}
```

---

## 🔌 Kitchen API Endpoints

### Base URL
```
/api/kitchen
```

### Security Model
Kitchen endpoints are **PUBLIC** (read-only for viewing, limited write for status updates).
- No authentication required
- No prices/totals exposed
- Cannot modify products or prices
- Cannot mark orders as delivered (admin only)

---

### Endpoint 1: Get Today's Kitchen Orders

**Purpose:** View all active orders that need preparation

```http
GET /api/kitchen/orders/today
```

**Headers:**
```
X-Timezone: <IANA timezone>
```
Example: `X-Timezone: Africa/Cairo`

**Query Parameters:** None

**Behavior:**
- Returns orders for TODAY only (based on timezone)
- Includes only `PENDING` and `PREPARING` statuses
- Sorted by `orderNumber` (ascending)
- Excludes `DELIVERED` orders
- No prices or totals exposed

**Response Example:**
```json
{
  "success": true,
  "count": 5,
  "orderDate": "2026-01-22",
  "timezone": "Africa/Cairo",
  "data": [
    {
      "orderId": "679abc123def456...",
      "orderNumber": 12,
      "createdAt": "2026-01-22T10:15:00.000Z",
      "status": "PENDING",
      "preparingAt": null,
      "items": [
        {
          "nameSnapshotEn": "Chicken Sandwich",
          "nameSnapshotAr": "ساندويتش دجاج",
          "quantity": 2
        },
        {
          "nameSnapshotEn": "Orange Juice",
          "nameSnapshotAr": "عصير برتقال",
          "quantity": 1
        }
      ]
    },
    {
      "orderId": "679abc123def789...",
      "orderNumber": 13,
      "createdAt": "2026-01-22T10:18:00.000Z",
      "status": "PREPARING",
      "preparingAt": "2026-01-22T10:20:00.000Z",
      "items": [
        {
          "nameSnapshotEn": "Chocolate Cake",
          "nameSnapshotAr": "كيك شوكولاتة",
          "quantity": 1
        }
      ]
    }
  ]
}
```

**Use Case:**
Kitchen screen displays this list, refreshing every 10-30 seconds to show new orders.

---

### Endpoint 2: Start Preparing Order

**Purpose:** Mark an order as "being prepared" by kitchen

```http
PATCH /api/kitchen/orders/:id/start
```

**URL Parameters:**
- `:id` - Order ObjectId (from MongoDB)

**Headers:** None required

**Body:** None

**Behavior:**
- Validates order exists
- Checks current status is `PENDING`
- Sets `status = "PREPARING"`
- Sets `preparingAt = current timestamp`
- Returns kitchen-safe data (no prices)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orderId": "679abc123def456...",
    "orderNumber": 12,
    "status": "PREPARING",
    "preparingAt": "2026-01-22T10:20:00.000Z",
    "items": [
      {
        "nameSnapshotEn": "Chicken Sandwich",
        "nameSnapshotAr": "ساندويتش دجاج",
        "quantity": 2
      }
    ]
  }
}
```

**Error Response - Already Started (400):**
```json
{
  "success": false,
  "message": "Cannot start preparing. Order is already PREPARING"
}
```

**Error Response - Already Delivered (400):**
```json
{
  "success": false,
  "message": "Cannot start preparing. Order is already DELIVERED"
}
```

**Error Response - Not Found (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

### Endpoint 3: Get Kitchen Orders (with filters)

**Purpose:** View kitchen orders with optional date/status filters

```http
GET /api/kitchen/orders
GET /api/kitchen/orders?date=2026-01-22
GET /api/kitchen/orders?status=PREPARING
GET /api/kitchen/orders?date=2026-01-22&status=PENDING
```

**Headers:**
```
X-Timezone: <IANA timezone> (optional, defaults to UTC)
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `date` | String | Filter by orderDate (YYYY-MM-DD) | `2026-01-22` |
| `status` | String | Filter by status | `PENDING`, `PREPARING`, `DELIVERED` |

**Behavior:**
- If no `date` provided, defaults to today
- Accepts any valid status
- Sorted by `orderNumber`
- No prices/totals exposed

**Response Example:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "orderId": "679abc123...",
      "orderNumber": 10,
      "createdAt": "2026-01-22T09:00:00.000Z",
      "status": "DELIVERED",
      "preparingAt": "2026-01-22T09:05:00.000Z",
      "deliveredAt": "2026-01-22T09:15:00.000Z",
      "items": [...]
    }
  ]
}
```

---

## 🔐 Updated Admin Endpoints

### Modified: Mark Order as Delivered

**IMPORTANT:** Admin can now deliver orders from `PREPARING` status (not just `PENDING`).

```http
PATCH /api/admin/orders/:id/deliver
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Updated Behavior:**
- Accepts orders in `PREPARING` status
- Sets `status = "DELIVERED"`
- Sets `deliveredAt = current timestamp`
- `preparingAt` remains unchanged (historical record)

**Response includes full order data (with prices):**
```json
{
  "success": true,
  "data": {
    "_id": "679abc...",
    "orderNumber": 12,
    "status": "DELIVERED",
    "preparingAt": "2026-01-22T10:05:00.000Z",
    "deliveredAt": "2026-01-22T10:15:00.000Z",
    "totalAmount": 60.00,
    "paymentMethod": "CASH",
    "items": [...]  // Includes prices
  }
}
```

---

## 📋 Kitchen Workflow Example

### Scenario: Student Orders 2 Sandwiches + 1 Juice

**Step 1: Order Created (Public API)**
```bash
POST /api/orders
{
  "items": [
    {"productId": "abc123", "quantity": 2},  # Chicken Sandwich
    {"productId": "def456", "quantity": 1}   # Orange Juice
  ]
}
```

**Server Response:**
```json
{
  "orderId": "order789",
  "orderNumber": 15,
  "orderDate": "2026-01-22",
  "status": "PENDING",
  "totalAmount": 60.00,
  "paymentMethod": "CASH"
}
```

---

**Step 2: Kitchen Views Today's Orders**
```bash
GET /api/kitchen/orders/today
X-Timezone: Africa/Cairo
```

**Kitchen Sees:**
```json
{
  "data": [
    {
      "orderId": "order789",
      "orderNumber": 15,
      "status": "PENDING",
      "items": [
        {"nameSnapshotEn": "Chicken Sandwich", "quantity": 2},
        {"nameSnapshotEn": "Orange Juice", "quantity": 1}
      ]
    }
  ]
}
```

**Kitchen Screen Display:**
```
╔═══════════════════════════════╗
║       ORDER #15               ║
║       PENDING                 ║
╠═══════════════════════════════╣
║  🍗 Chicken Sandwich    x2    ║
║  🧃 Orange Juice        x1    ║
╠═══════════════════════════════╣
║  [START PREPARING]            ║
╚═══════════════════════════════╝
```

---

**Step 3: Kitchen Starts Preparing**
```bash
PATCH /api/kitchen/orders/order789/start
```

**Response:**
```json
{
  "status": "PREPARING",
  "preparingAt": "2026-01-22T10:05:00Z"
}
```

**Kitchen Screen Updates:**
```
╔═══════════════════════════════╗
║       ORDER #15               ║
║       PREPARING (2 min ago)   ║
╠═══════════════════════════════╣
║  🍗 Chicken Sandwich    x2    ║
║  🧃 Orange Juice        x1    ║
╠═══════════════════════════════╣
║  ⏱️ Started: 10:05 AM          ║
╚═══════════════════════════════╝
```

---

**Step 4: Admin Delivers Order**
```bash
PATCH /api/admin/orders/order789/deliver
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "DELIVERED",
  "deliveredAt": "2026-01-22T10:15:00Z",
  "totalAmount": 60.00  // Admin sees prices
}
```

**Order disappears from kitchen screen** (only shows PENDING/PREPARING).

---

## 🔄 Integration with Existing System

### Unchanged Components
✅ All existing endpoints remain functional
✅ CASH-ONLY payment enforcement unchanged
✅ Product management unchanged
✅ Timezone-aware queue numbers unchanged
✅ Admin authentication unchanged
✅ Profit calculations unchanged

### Modified Components
🔄 Order Model: Added `PREPARING` status and `preparingAt` field
🔄 Admin deliver endpoint: Now accepts `PREPARING` status

### New Components
✨ Kitchen Controller (`controllers/kitchenController.js`)
✨ Kitchen Routes (`routes/kitchen.js`)
✨ Kitchen API endpoints (`/api/kitchen/*`)

---

## 📊 Profit Calculation (Unchanged)

**IMPORTANT:** Profit calculations remain based on `DELIVERED` status only.

Orders in `PENDING` or `PREPARING` status are NOT counted in revenue.

```javascript
// Existing profit logic (unchanged)
const deliveredOrders = await Order.find({
  status: 'DELIVERED',  // Only DELIVERED counts
  orderDate: today
});

revenue = sum(deliveredOrders.totalAmount);
```

---

## 🧪 Testing Kitchen Workflow

### Test 1: Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Africa/Cairo" \
  -d '{
    "items": [
      {"productId": "PRODUCT_ID", "quantity": 2}
    ]
  }'
```

### Test 2: View Kitchen Orders
```bash
curl http://localhost:5000/api/kitchen/orders/today \
  -H "X-Timezone: Africa/Cairo"
```

### Test 3: Start Preparing
```bash
curl -X PATCH http://localhost:5000/api/kitchen/orders/ORDER_ID/start
```

### Test 4: Deliver (Admin)
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Kitchen Screen Implementation Guide (Frontend)

### Recommended Layout

```
┌─────────────────────────────────────────────┐
│  SCHOOL CANTEEN - KITCHEN SCREEN            │
│  Today: 2026-01-22  |  Active Orders: 5     │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  #12     │  │  #13     │  │  #14     │  │
│  │ PENDING  │  │PREPARING │  │ PENDING  │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  │
│  │🍗 Chicken│  │🍰 Cake   │  │🥤 Juice  │  │
│  │   x2     │  │   x1     │  │   x3     │  │
│  │🥤 Juice  │  │          │  │          │  │
│  │   x1     │  │  ⏱️ 5min │  │          │  │
│  ├──────────┤  ├──────────┤  ├──────────┤  │
│  │ [START]  │  │ Working..│  │ [START]  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Polling Strategy

```javascript
// Refresh every 30 seconds
setInterval(async () => {
  const response = await fetch('/api/kitchen/orders/today', {
    headers: {
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });
  const orders = await response.json();
  updateKitchenDisplay(orders);
}, 30000);
```

### Start Button Handler

```javascript
async function startPreparing(orderId) {
  await fetch(`/api/kitchen/orders/${orderId}/start`, {
    method: 'PATCH'
  });
  refreshOrders();
}
```

---

## 🔒 Security Considerations

### Kitchen Endpoints Security

**Public Access:**
- Kitchen endpoints are public (no authentication)
- Rationale: Kitchen staff don't need user accounts
- Risk mitigation: No sensitive data exposed

**Data Protection:**
- Prices: ❌ Never sent to kitchen endpoints
- Totals: ❌ Never sent to kitchen endpoints
- Payment info: ❌ Never sent to kitchen endpoints
- Customer info: ❌ Not stored/sent

**Optional Enhancement:**
If you want to add basic kitchen authentication:

```javascript
// Simple shared token approach
const KITCHEN_TOKEN = process.env.KITCHEN_TOKEN || 'kitchen123';

const kitchenAuth = (req, res, next) => {
  const token = req.headers['x-kitchen-token'];
  if (token !== KITCHEN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Apply to routes
router.use(kitchenAuth);
```

---

## 📈 Performance Optimization

### Database Indexes (Already Configured)

```javascript
// Existing indexes support kitchen queries
orderSchema.index({ orderDate: 1, timezone: 1, orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: 1, status: 1 });
```

### Efficient Queries

Kitchen endpoint uses optimized queries:
```javascript
Order.find({
  orderDate,
  timezone,
  status: { $in: ['PENDING', 'PREPARING'] }
})
.sort({ orderNumber: 1 })
.select('orderNumber createdAt status items preparingAt')
.lean();  // Returns plain JS objects (faster)
```

---

## 🎓 Complete Order Status Summary

| Status | Description | Set By | Timestamp | Visible To |
|--------|-------------|--------|-----------|------------|
| **PENDING** | Order placed, awaiting kitchen | System | `createdAt` | All (Public, Kitchen, Admin) |
| **PREPARING** | Kitchen started cooking | Kitchen | `preparingAt` | All (Public, Kitchen, Admin) |
| **DELIVERED** | Student received order | Admin | `deliveredAt` | All (Public, Kitchen, Admin) |

---

## ✅ Implementation Checklist

- [x] Update Order Model with `PREPARING` status
- [x] Add `preparingAt` timestamp field
- [x] Create Kitchen Controller
- [x] Create Kitchen Routes
- [x] Add kitchen endpoints to server
- [x] Update admin deliver endpoint logic
- [x] Document kitchen API endpoints
- [x] Document security model
- [x] Document data visibility rules
- [x] Provide testing examples

---

## 🚀 Deployment Notes

**Migration Steps:**

1. **Update Order Model:** Deploy updated schema
2. **Existing Orders:** All existing orders remain `PENDING` or `DELIVERED`
3. **No Data Loss:** New field `preparingAt` defaults to `null`
4. **Backward Compatible:** Existing endpoints work unchanged

**Database Migration (Optional):**
```javascript
// No migration needed - new field has default null
// Existing orders work fine with new schema
```

---

## 📞 Support & Maintenance

### Common Issues

**Issue:** Kitchen screen doesn't update
- Check timezone header is sent
- Verify polling interval
- Check network connectivity

**Issue:** Cannot start preparing
- Verify order status is `PENDING`
- Check order ID is correct
- Ensure order exists in database

**Issue:** Order stuck in PREPARING
- Only admin can deliver (by design)
- Admin must use `/api/admin/orders/:id/deliver`

---

**Kitchen Workflow System - Ready for Production! 🍽️**

**Remember:**
- Kitchen sees ORDERS, not MONEY
- Admin controls delivery
- CASH is still KING! 💵
