# API Testing Guide - Postman Collection

## Quick Start Testing Steps

### 1. Setup Admin Account

First, generate your admin password hash:

```bash
cd Backend
npm install
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin123!', 10).then(hash => console.log(hash));"
```

Copy the output and add to `.env`:
```env
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<paste-hash-here>
JWT_SECRET=my-super-secret-jwt-key-minimum-32-characters-long
MONGO_URI=mongodb://localhost:27017/school-canteen
```

### 2. Start Server

```bash
npm run dev
```

### 3. Test Workflow

Follow this order for testing:

---

## 📋 Complete Test Workflow

### Step 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "School Canteen API is running",
  "timestamp": "2026-01-22T10:00:00.000Z"
}
```

---

### Step 2: Admin Login

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@schoolcanteen.com",
    "password": "Admin123!"
  }'
```

Expected Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "email": "admin@schoolcanteen.com"
  }
}
```

**SAVE THE TOKEN** - You'll need it for all admin requests!

---

### Step 3: Create Products (Admin)

Replace `YOUR_TOKEN_HERE` with the token from Step 2.

#### Product 1: Chicken Sandwich
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "ساندويتش دجاج",
    "nameEn": "Chicken Sandwich",
    "descAr": "ساندويتش دجاج مشوي طازج",
    "descEn": "Fresh grilled chicken sandwich",
    "price": 25.00,
    "category": "Sandwiches",
    "isAvailable": true
  }'
```

#### Product 2: Orange Juice
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

#### Product 3: Chocolate Cake
```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "كيك شوكولاتة",
    "nameEn": "Chocolate Cake",
    "descAr": "كيك شوكولاتة محلى الصنع",
    "descEn": "Homemade chocolate cake",
    "price": 15.00,
    "category": "Desserts",
    "isAvailable": true
  }'
```

**SAVE THE PRODUCT IDs** from the responses!

---

### Step 4: Get All Products (Public)

```bash
curl http://localhost:5000/api/products
```

You should see all 3 products in the response.

---

### Step 5: Create Orders (Public - CASH ONLY)

Replace `PRODUCT_ID_1`, `PRODUCT_ID_2` with actual IDs from Step 3.

#### Order 1 (Berlin timezone)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/Berlin" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_1",
        "quantity": 2
      },
      {
        "productId": "PRODUCT_ID_2",
        "quantity": 1
      }
    ]
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "orderId": "...",
    "orderNumber": 1,
    "orderDate": "2026-01-22",
    "createdAt": "...",
    "status": "PENDING",
    "totalAmount": 60.00,
    "paymentMethod": "CASH"
  }
}
```

#### Order 2 (New York timezone)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: America/New_York" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_3",
        "quantity": 3
      }
    ]
  }'
```

---

### Step 6: Test CASH-ONLY Enforcement (Should FAIL)

Try to set payment method (this should be rejected):

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/Berlin" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_1",
        "quantity": 1
      }
    ],
    "paymentMethod": "CARD"
  }'
```

Expected Response (ERROR):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["\"paymentMethod\" is not allowed"]
}
```

✅ **This confirms CASH-ONLY enforcement is working!**

---

### Step 7: Get Today's Orders (Public)

```bash
curl http://localhost:5000/api/orders/today \
  -H "X-Timezone: Europe/Berlin"
```

---

### Step 8: Get Orders by Date (Admin)

```bash
curl http://localhost:5000/api/admin/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-Timezone: Europe/Berlin"
```

Or specific date:
```bash
curl "http://localhost:5000/api/admin/orders?date=2026-01-22" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 9: Mark Order as Delivered (Admin)

Replace `ORDER_ID` with actual order ID:

```bash
curl -X PATCH http://localhost:5000/api/admin/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected Response:
```json
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

### Step 10: Get Today's Profit (Admin)

```bash
curl http://localhost:5000/api/admin/profit/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "X-Timezone: Europe/Berlin"
```

Expected Response:
```json
{
  "success": true,
  "date": "2026-01-22",
  "timezone": "Europe/Berlin",
  "data": {
    "deliveredOrdersCount": 1,
    "revenueToday": 60.00
  }
}
```

---

### Step 11: Get Total Profit (Admin)

```bash
curl http://localhost:5000/api/admin/profit/total \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Step 12: Upload Image (Admin)

```bash
curl -X POST http://localhost:5000/api/admin/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/image.jpg"
```

Expected Response:
```json
{
  "success": true,
  "imageUrl": "/uploads/1737545678901-123456789.jpg"
}
```

Then update a product with the image:
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "ساندويتش دجاج",
    "nameEn": "Chicken Sandwich",
    "descAr": "ساندويتش دجاج مشوي طازج",
    "descEn": "Fresh grilled chicken sandwich",
    "price": 25.00,
    "category": "Sandwiches",
    "imageUrl": "/uploads/1737545678901-123456789.jpg",
    "isAvailable": true
  }'
```

---

### Step 13: Delete Product (Admin)

```bash
curl -X DELETE http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Advanced Test Scenarios

### Test Invalid Timezone
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Invalid/Timezone" \
  -d '{
    "items": [{"productId": "PRODUCT_ID", "quantity": 1}]
  }'
```
Should work, but fall back to UTC timezone.

---

### Test Missing Product
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/Berlin" \
  -d '{
    "items": [{"productId": "000000000000000000000000", "quantity": 1}]
  }'
```
Expected Error:
```json
{
  "success": false,
  "message": "Product not found: 000000000000000000000000"
}
```

---

### Test Unavailable Product
First, mark product unavailable:
```bash
curl -X PUT http://localhost:5000/api/admin/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "...",
    "nameEn": "...",
    "price": 25.00,
    "isAvailable": false
  }'
```

Then try to order it:
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/Berlin" \
  -d '{
    "items": [{"productId": "PRODUCT_ID", "quantity": 1}]
  }'
```

Expected Error:
```json
{
  "success": false,
  "message": "Product not available: Product Name"
}
```

---

### Test Rate Limiting (Login)
Try logging in 6 times quickly:
```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email": "wrong@email.com", "password": "wrong"}'
  echo "\n--- Attempt $i ---\n"
done
```

The 6th attempt should return:
```json
{
  "success": false,
  "message": "Too many login attempts, please try again later"
}
```

---

### Test Unauthorized Access
Try accessing admin route without token:
```bash
curl http://localhost:5000/api/admin/orders
```

Expected Error:
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## 📊 Postman Collection Import

Create a file `postman_collection.json` with this content:

```json
{
  "info": {
    "name": "School Canteen API - CASH ONLY",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Public",
      "item": [
        {
          "name": "Health Check",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/health"
          }
        },
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/products"
          }
        },
        {
          "name": "Create Order (CASH ONLY)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "X-Timezone",
                "value": "Europe/Berlin"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"items\": [\n    {\n      \"productId\": \"REPLACE_WITH_PRODUCT_ID\",\n      \"quantity\": 2\n    }\n  ]\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": "{{baseUrl}}/orders"
          }
        },
        {
          "name": "Get Today's Orders",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "X-Timezone",
                "value": "Europe/Berlin"
              }
            ],
            "url": "{{baseUrl}}/orders/today"
          }
        }
      ]
    },
    {
      "name": "Admin",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "var jsonData = pm.response.json();",
                  "pm.collectionVariables.set(\"token\", jsonData.token);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@schoolcanteen.com\",\n  \"password\": \"Admin123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": "{{baseUrl}}/admin/login"
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nameAr\": \"ساندويتش دجاج\",\n  \"nameEn\": \"Chicken Sandwich\",\n  \"descAr\": \"ساندويتش دجاج مشوي\",\n  \"descEn\": \"Grilled chicken sandwich\",\n  \"price\": 25.00,\n  \"category\": \"Sandwiches\",\n  \"isAvailable\": true\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": "{{baseUrl}}/admin/products"
          }
        },
        {
          "name": "Mark Order Delivered",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "{{baseUrl}}/admin/orders/ORDER_ID/deliver"
          }
        },
        {
          "name": "Get Today's Profit",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "X-Timezone",
                "value": "Europe/Berlin"
              }
            ],
            "url": "{{baseUrl}}/admin/profit/today"
          }
        }
      ]
    }
  ]
}
```

Import this file into Postman: **Import → Upload Files → Select postman_collection.json**

---

## ✅ Success Criteria Checklist

After running all tests, verify:

- [ ] Admin can login with correct credentials
- [ ] Admin cannot login with wrong credentials
- [ ] Rate limiting blocks excessive login attempts
- [ ] Products can be created with Arabic and English names
- [ ] Products can be retrieved publicly
- [ ] Orders can be created WITHOUT specifying payment method
- [ ] Orders REJECT attempts to set payment method
- [ ] All orders have `paymentMethod: "CASH"`
- [ ] Order queue numbers increment daily per timezone
- [ ] Today's orders show correct timezone-based date
- [ ] Orders can be marked as delivered (admin only)
- [ ] Profit calculation shows only delivered orders
- [ ] Images can be uploaded and optimized
- [ ] Unauthorized requests are rejected
- [ ] Invalid product IDs return proper errors
- [ ] Unavailable products cannot be ordered

---

## 🎯 Key Validations

### ✅ CASH-ONLY Enforcement
```bash
# This MUST fail:
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{...}],
    "paymentMethod": "CARD"
  }'
```

### ✅ Server-Side Price Calculation
Even if client sends wrong price, server uses DB price:
- Client sends quantity
- Server fetches price from database
- Server calculates total
- Client cannot manipulate pricing

### ✅ Atomic Queue Numbers
Create 10 orders simultaneously - all should get unique sequential numbers:
```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/orders \
    -H "Content-Type: application/json" \
    -H "X-Timezone: Europe/Berlin" \
    -d '{
      "items": [{"productId": "PRODUCT_ID", "quantity": 1}]
    }' &
done
wait
```

All orders should have unique `orderNumber` values!

---

**Happy Testing! 🎉**
