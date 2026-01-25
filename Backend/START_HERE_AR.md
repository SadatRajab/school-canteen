# 🚀 دليل التشغيل السريع - ابدأ من هنا

## الخطوات المطلوبة لتشغيل الـ Backend لأول مرة

---

## ⚡ الخطوة 1: تثبيت الحزم (npm install)

افتح PowerShell في مجلد Backend وشغل:

```bash
npm install
```

**انتظر** حتى ينتهي التثبيت (قد يستغرق دقيقتين)

✅ **علامة النجاح:** تشوف رسالة `added XX packages`

---

## 🔑 الخطوة 2: توليد JWT Secret

شغل الأمر ده:

```bash
node scripts/generateJwtSecret.js
```

**هيطلع لك:**
```
Generated JWT_SECRET:
abc123xyz789...
```

**📋 انسخ** الكود اللي طلع (السطر الطويل)

---

## 🔐 الخطوة 3: توليد Admin Password

شغل الأمر ده:

```bash
node scripts/generatePasswordHash.js
```

**هيسألك:** `Enter the admin password:` 

اكتب الباسورد اللي أنت عايزه (مثلاً: `admin123`)

**هيطلع لك:**
```
Generated hash for 'admin123':
$2a$10$XyZ...
```

**📋 انسخ** الـ hash اللي طلع

---

## 📝 الخطوة 4: إنشاء ملف .env

1. **انسخ** ملف `.env.example` واسميه `.env`
2. **افتح** ملف `.env` ببرنامج Notepad أو VS Code
3. **املأ** البيانات بتاعتك:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/school-canteen

# JWT Secret (الصقه من الخطوة 2)
JWT_SECRET=abc123xyz789...

# Admin Password Hash (الصقه من الخطوة 3)
ADMIN_PASSWORD_HASH=$2a$10$XyZ...

# Server Port
PORT=5000
```

**احفظ الملف** (Ctrl+S)

---

## 🗄️ الخطوة 5: تشغيل MongoDB

### إذا كان MongoDB مثبت:

```bash
mongod
```

**اترك** هذا الـ Terminal مفتوح (لازم يفضل شغال)

### إذا لم يكن مثبت:

**حمل MongoDB Community** من: https://www.mongodb.com/try/download/community

---

## ▶️ الخطوة 6: تشغيل الـ Backend

افتح **PowerShell جديد** (اترك MongoDB شغال في terminal قديم)

```bash
cd "F:\web fills\School canteen\Backend"
npm run dev
```

✅ **علامة النجاح:**
```
✓ MongoDB Connected
🚀 Server running on port 5000
```

**الـ Backend دلوقتي شغال!** 🎉

---

## ✅ الخطوة 7: تأكد إنه شغال - أسهل طريقة

### الطريقة الأولى: المتصفح (Chrome/Edge)

افتح المتصفح وروح على:

```
http://localhost:5000/api/health
```

**لو شغال** هتشوف:
```json
{
  "status": "OK",
  "message": "School Canteen API is running",
  "timestamp": "2026-01-22T..."
}
```

---

## 🧪 الخطوة 8: اختبار بـ Postman

### 1️⃣ تحميل Products (بدون login)

**افتح Postman**

- **Method:** GET
- **URL:** `http://localhost:5000/api/products`
- **اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

✅ **معنى كده:** الـ API شغال، بس مفيش منتجات لسه

---

### 2️⃣ تسجيل دخول Admin

- **Method:** POST
- **URL:** `http://localhost:5000/api/admin/login`
- **اختار Body → raw → JSON**
- **اكتب:**

```json
{
  "password": "admin123"
}
```

(استخدم الباسورد اللي أنت كتبته في الخطوة 3)

**اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**📋 انسخ الـ Token** (هتحتاجه في الطلبات الجاية)

---

### 3️⃣ إنشاء منتج (محتاج Token)

- **Method:** POST
- **URL:** `http://localhost:5000/api/admin/products`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer eyJhbGci...` (الصق الـ token)
- **Body → raw → JSON:**

```json
{
  "nameAr": "ساندوتش فلافل",
  "nameEn": "Falafel Sandwich",
  "price": 15,
  "category": "sandwiches"
}
```

**اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "nameAr": "ساندوتش فلافل",
    "nameEn": "Falafel Sandwich",
    "price": 15,
    "category": "sandwiches",
    "isAvailable": true
  }
}
```

✅ **تمام! تم إنشاء أول منتج** 🎉

---

### 4️⃣ إنشاء طلب (Order) - بدون login

**انسخ الـ `_id`** من المنتج اللي فوق

- **Method:** POST
- **URL:** `http://localhost:5000/api/orders`
- **Body → raw → JSON:**

```json
{
  "items": [
    {
      "productId": "الصق الـ ID هنا",
      "quantity": 2
    }
  ],
  "timezone": "Africa/Cairo"
}
```

**اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "orderNumber": 1,
    "orderDate": "2026-01-22",
    "items": [
      {
        "nameAr": "ساندوتش فلافل",
        "nameEn": "Falafel Sandwich",
        "quantity": 2
      }
    ],
    "totalAmount": 30,
    "paymentMethod": "CASH",
    "status": "PENDING"
  }
}
```

✅ **رائع! تم إنشاء أول طلب** 🎊

---

### 5️⃣ اختبار Kitchen API (بدون login)

- **Method:** GET
- **URL:** `http://localhost:5000/api/kitchen/orders/today`
- **اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "orderNumber": 1,
      "items": [
        {
          "nameAr": "ساندوتش فلافل",
          "nameEn": "Falafel Sandwich",
          "quantity": 2
        }
      ],
      "status": "PENDING"
    }
  ]
}
```

⚠️ **لاحظ:** المطبخ **لا يرى الأسعار** (NO prices!) ✅

---

### 6️⃣ بدء التحضير (Kitchen)

**انسخ الـ `_id`** من الطلب

- **Method:** PATCH
- **URL:** `http://localhost:5000/api/kitchen/orders/الصق_الـID_هنا/start`
- **اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "status": "PREPARING",
    "preparingAt": "2026-01-22T10:30:00.000Z"
  }
}
```

✅ **الطلب تحول إلى PREPARING** (جاري التحضير)

---

### 7️⃣ تسليم الطلب (Admin فقط)

- **Method:** PATCH
- **URL:** `http://localhost:5000/api/admin/orders/الصق_الـID_هنا/deliver`
- **Headers:**
  - Key: `Authorization`
  - Value: `Bearer eyJhbGci...` (الـ token من خطوة 2)
- **اضغط Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "status": "DELIVERED",
    "deliveredAt": "2026-01-22T10:45:00.000Z"
  }
}
```

✅ **تم التسليم! الطلب الآن DELIVERED** 🎁

---

## 📊 مراجعة الأرباح (Admin)

- **Method:** GET
- **URL:** `http://localhost:5000/api/admin/profit/today`
- **Headers:** Authorization: `Bearer <token>`
- **اضغط Send**

**النتيجة:**
```json
{
  "success": true,
  "data": {
    "totalProfit": 30,
    "ordersCount": 1
  }
}
```

---

## ✅ خلاص! كده النظام شغال 100%

### دورة حياة الطلب الكاملة:

1. **PENDING** → الطلب تم إنشاؤه
2. **PREPARING** → المطبخ بدأ التحضير
3. **DELIVERED** → الأدمن سلم الطلب

---

## 🎯 ملخص سريع لـ Postman

| الوظيفة | Method | URL | يحتاج Token؟ |
|---------|--------|-----|-------------|
| Health Check | GET | `/api/health` | ❌ |
| List Products | GET | `/api/products` | ❌ |
| Admin Login | POST | `/api/admin/login` | ❌ |
| Create Product | POST | `/api/admin/products` | ✅ |
| Create Order | POST | `/api/orders` | ❌ |
| Kitchen Today | GET | `/api/kitchen/orders/today` | ❌ |
| Start Preparing | PATCH | `/api/kitchen/orders/:id/start` | ❌ |
| Deliver Order | PATCH | `/api/admin/orders/:id/deliver` | ✅ |
| Today Profit | GET | `/api/admin/profit/today` | ✅ |

---

## 🔧 حل المشاكل الشائعة

### المشكلة: `Cannot connect to MongoDB`
**الحل:** تأكد إن MongoDB شغال:
```bash
mongod
```

### المشكلة: `Port 5000 is already in use`
**الحل:** غير البورت في `.env`:
```
PORT=3000
```

### المشكلة: `Unauthorized` عند استخدام Admin API
**الحل:** تأكد إنك حاطط الـ Token في Headers:
```
Authorization: Bearer <your-token>
```

### المشكلة: `Invalid password`
**الحل:** تأكد إنك بتستخدم نفس الباسورد اللي ولدت بيه الـ hash

---

## 📚 وثائق إضافية

- **الدليل الكامل بالإنجليزي:** [README.md](README.md)
- **دليل الـ Kitchen:** [KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **مرجع سريع:** [KITCHEN_API_QUICK_REFERENCE.md](KITCHEN_API_QUICK_REFERENCE.md)

---

## ✨ نصائح مهمة

1. **الدفع CASH فقط:** النظام مش بيقبل أي طريقة دفع غير الكاش
2. **المطبخ ما يشوفش الأسعار:** عشان الخصوصية
3. **رقم الطلب بيبدأ من 1 كل يوم:** تلقائياً حسب التاريخ
4. **اترك MongoDB شغال:** لازم يكون running طول ما الـ Backend شغال

---

**محتاج مساعدة؟** شوف ملف [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) 🚀
