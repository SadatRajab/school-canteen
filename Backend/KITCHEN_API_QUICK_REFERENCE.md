# 🍳 Kitchen API - Quick Reference Card

## Base URL
```
http://localhost:5000/api/kitchen
```

---

## 📋 Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/orders/today` | Get today's active orders | None |
| GET | `/orders` | Get orders with filters | None |
| PATCH | `/orders/:id/start` | Start preparing order | None |

---

## 🔄 Order Status Flow

```
┌─────────────┐
│   PENDING   │  ← Order created
└──────┬──────┘
       │
       │ Kitchen: PATCH /orders/:id/start
       ▼
┌─────────────┐
│  PREPARING  │  ← Kitchen is cooking
└──────┬──────┘
       │
       │ Admin only: PATCH /admin/orders/:id/deliver
       ▼
┌─────────────┐
│  DELIVERED  │  ← Final state
└─────────────┘
```

---

## 📖 Quick Examples

### Get Today's Orders
```bash
curl http://localhost:5000/api/kitchen/orders/today \
  -H "X-Timezone: Africa/Cairo"
```

### Start Preparing
```bash
curl -X PATCH http://localhost:5000/api/kitchen/orders/ORDER_ID/start
```

### Get Orders by Status
```bash
curl http://localhost:5000/api/kitchen/orders?status=PREPARING
```

---

## ✅ What Kitchen SEES

```json
{
  "orderNumber": 15,
  "status": "PENDING",
  "items": [
    {
      "nameSnapshotEn": "Chicken Sandwich",
      "nameSnapshotAr": "ساندويتش دجاج",
      "quantity": 2
    }
  ]
}
```

## ❌ What Kitchen CANNOT See

- ❌ Prices (`unitPriceSnapshot`)
- ❌ Totals (`lineTotal`, `totalAmount`)
- ❌ Payment info (`paymentMethod`)
- ❌ Customer details

---

## 🎯 Typical Kitchen Workflow

1. **View orders:** `GET /orders/today`
2. **Pick an order** with status `PENDING`
3. **Start cooking:** `PATCH /orders/:id/start`
4. **Order moves to** `PREPARING`
5. **Prepare food...**
6. **Admin delivers** (not kitchen)

---

## 🚨 Common Errors

### ❌ Cannot start preparing
```json
{
  "message": "Cannot start preparing. Order is already PREPARING"
}
```
**Cause:** Order already started

---

### ❌ Order not found
```json
{
  "message": "Order not found"
}
```
**Cause:** Invalid order ID

---

## 🔒 Security Note

Kitchen endpoints are **PUBLIC** (no authentication required) but:
- ✅ NO prices exposed
- ✅ NO totals exposed
- ✅ NO payment info exposed
- ✅ Read-only for order data
- ✅ Limited write (only status update)

---

**For full documentation:** See [KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md)
