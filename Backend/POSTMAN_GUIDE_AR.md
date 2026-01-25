# 📮 دليل استخدام Postman - School Canteen API

## 🚀 الخطوة 1: استيراد الـ Collection في Postman

1. **افتح Postman**
2. **اضغط على "Import"** (أعلى اليسار)
3. **اختر ملف:** `School_Canteen_API.postman_collection.json`
4. **اضغط "Import"**

✅ **النتيجة:** هتشوف مجلد اسمه "School Canteen API" فيه 9 طلبات جاهزة

---

## 📋 الـ Collection يحتوي على:

| # | الطلب | الوصف | يحتاج Token؟ |
|---|-------|-------|-------------|
| 0️⃣ | Health Check | اختبار إن الـ API شغال | ❌ |
| 1️⃣ | Admin Login | تسجيل دخول الأدمن | ❌ |
| 2️⃣ | Create Product | إنشاء منتج | ✅ |
| 3️⃣ | Get All Products | عرض المنتجات | ❌ |
| 4️⃣ | Create Order | إنشاء طلب (CASH) | ❌ |
| 5️⃣ | Kitchen - Today's Orders | طلبات اليوم (بدون أسعار) | ❌ |
| 6️⃣ | Kitchen - Start Preparing | بدء التحضير | ❌ |
| 7️⃣ | Admin - Deliver Order | تسليم الطلب | ✅ |
| 8️⃣ | Admin - Today's Profit | أرباح اليوم | ✅ |
| 9️⃣ | Admin - Total Profit | الأرباح الكلية | ✅ |

---

## 🎯 التشغيل التلقائي (Automatic Workflow)

الـ Collection ذكي! بيحفظ البيانات تلقائياً:

- **بعد Login:** بيحفظ الـ Token تلقائياً ✅
- **بعد Create Product:** بيحفظ الـ Product ID ✅
- **بعد Create Order:** بيحفظ الـ Order ID ✅

**معنى كده:** مش محتاج تنسخ وتلصق IDs يدوياً! 🎉

---

## 📝 الخطوات خطوة بخطوة

### الخطوة 1: تأكد إن السيرفر شغال ✅

**اضغط على:** `0️⃣ Health Check`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "status": "OK",
  "message": "School Canteen API is running",
  "timestamp": "2026-01-22T..."
}
```

✅ **إذا ظهرت هذه الرسالة = السيرفر شغال!**

❌ **إذا ظهرت "Could not get any response"** = السيرفر مش شغال، ارجع لملف [START_HERE_AR.md](START_HERE_AR.md)

---

### الخطوة 2: تسجيل دخول Admin 🔑

**اضغط على:** `1️⃣ Admin Login`

**Body موجود جاهز:**
```json
{
  "password": "admin123"
}
```

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ **الـ Token تم حفظه تلقائياً!** (شوف Console في Postman)

---

### الخطوة 3: إنشاء منتج 🍔

**اضغط على:** `2️⃣ Create Product (Admin)`

**Body موجود جاهز:**
```json
{
  "nameAr": "ساندوتش فلافل",
  "nameEn": "Falafel Sandwich",
  "price": 15,
  "category": "sandwiches"
}
```

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "679123abc...",
    "nameAr": "ساندوتش فلافل",
    "nameEn": "Falafel Sandwich",
    "price": 15,
    "category": "sandwiches",
    "isAvailable": true
  }
}
```

✅ **الـ Product ID تم حفظه تلقائياً!**

---

### الخطوة 4: عرض كل المنتجات 📋

**اضغط على:** `3️⃣ Get All Products`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "679123abc...",
      "nameAr": "ساندوتش فلافل",
      "nameEn": "Falafel Sandwich",
      "price": 15,
      "category": "sandwiches",
      "isAvailable": true
    }
  ]
}
```

✅ **تمام! المنتج ظهر**

---

### الخطوة 5: إنشاء طلب (Order) 🛒

**اضغط على:** `4️⃣ Create Order (CASH)`

**Body موجود جاهز:**
```json
{
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 2
    }
  ],
  "timezone": "Africa/Cairo"
}
```

⚠️ **لاحظ:** `{{productId}}` **تلقائي** من الخطوة السابقة!

**اضغط:** **Send**

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
    "status": "PENDING",
    "_id": "679456def..."
  }
}
```

✅ **الطلب تم إنشاؤه بنجاح!**
✅ **الدفع CASH تلقائياً!**
✅ **Order ID تم حفظه تلقائياً!**

---

### الخطوة 6: عرض طلبات اليوم في المطبخ 👨‍🍳

**اضغط على:** `5️⃣ Kitchen - Today's Orders`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "orderNumber": 1,
      "orderDate": "2026-01-22",
      "items": [
        {
          "nameAr": "ساندوتش فلافل",
          "nameEn": "Falafel Sandwich",
          "quantity": 2
        }
      ],
      "status": "PENDING",
      "createdAt": "2026-01-22T10:00:00.000Z",
      "_id": "679456def..."
    }
  ]
}
```

⚠️ **لاحظ:** **لا توجد أسعار!** (NO prices!) ✅

المطبخ يشوف بس:
- ✅ اسم الطلب
- ✅ الكمية
- ✅ الحالة
- ❌ **الأسعار مخفية**

---

### الخطوة 7: بدء التحضير 🍳

**اضغط على:** `6️⃣ Kitchen - Start Preparing`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "679456def...",
    "status": "PREPARING",
    "preparingAt": "2026-01-22T10:30:00.000Z"
  }
}
```

✅ **الطلب الآن في حالة PREPARING** (جاري التحضير)

---

### الخطوة 8: تسليم الطلب (Admin فقط) 📦

**اضغط على:** `7️⃣ Admin - Deliver Order`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "_id": "679456def...",
    "status": "DELIVERED",
    "deliveredAt": "2026-01-22T10:45:00.000Z"
  }
}
```

✅ **الطلب تم تسليمه!**

---

### الخطوة 9: عرض أرباح اليوم 💰

**اضغط على:** `8️⃣ Admin - Today's Profit`

**اضغط:** **Send**

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "data": {
    "totalProfit": 30,
    "ordersCount": 1,
    "date": "2026-01-22"
  }
}
```

✅ **تمام! الأرباح ظهرت**

---

### الخطوة 10: عرض الأرباح الكلية 📊

**اضغط على:** `9️⃣ Admin - Total Profit`

**اضغط:** **Send**

**النتيجة المتوقعة:**
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

## 🎯 ملخص دورة حياة الطلب

```
1. إنشاء طلب → Status: PENDING
2. المطبخ يشوف الطلب (بدون أسعار)
3. المطبخ يبدأ التحضير → Status: PREPARING
4. الأدمن يسلم الطلب → Status: DELIVERED
5. الأرباح تظهر تلقائياً
```

---

## ⚙️ Variables في Postman

الـ Collection بيستخدم Variables عشان يسهل الشغل:

| Variable | الوصف | القيمة |
|----------|-------|--------|
| `baseUrl` | رابط الـ API | `http://localhost:5000/api` |
| `adminToken` | Token الأدمن | تلقائي بعد Login |
| `productId` | ID المنتج | تلقائي بعد Create Product |
| `orderId` | ID الطلب | تلقائي بعد Create Order |

**عشان تشوفهم:**
1. اضغط على **Collection "School Canteen API"**
2. اختار تاب **"Variables"**

---

## 🔧 تعديل الـ Base URL

لو بتشتغل على Port مختلف:

1. اضغط على **Collection "School Canteen API"**
2. اختار تاب **"Variables"**
3. غير `baseUrl` من:
   ```
   http://localhost:5000/api
   ```
   إلى:
   ```
   http://localhost:3000/api
   ```
4. احفظ

---

## ✅ علامات النجاح

| الحالة | العلامة |
|--------|---------|
| السيرفر شغال | Status 200 OK |
| Login نجح | `"success": true` + Token |
| Product تم إنشاؤه | Status 201 Created |
| Order تم إنشاؤه | `"paymentMethod": "CASH"` |
| Kitchen لا يرى الأسعار | لا يوجد `price` أو `totalAmount` |
| Order تم تسليمه | `"status": "DELIVERED"` |

---

## ❌ الأخطاء الشائعة

### 1️⃣ Error: Could not get any response

**المشكلة:** السيرفر مش شغال

**الحل:**
```bash
cd "F:\web fills\School canteen\Backend"
npm run dev
```

---

### 2️⃣ Error: 401 Unauthorized

**المشكلة:** Token مش موجود أو منتهي

**الحل:**
1. اعمل Login مرة تانية
2. تأكد إن الـ Token اتحفظ في Variables

---

### 3️⃣ Error: 400 Bad Request

**المشكلة:** البيانات المرسلة خطأ

**الحل:**
- تأكد إن الـ Body صحيح
- تأكد إن الـ `productId` موجود

---

### 4️⃣ Error: Product not found

**المشكلة:** الـ Product ID غلط

**الحل:**
1. اعمل `Get All Products` أول
2. انسخ الـ `_id` الصحيح
3. أو اعمل `Create Product` مرة تانية

---

## 📚 ملفات إضافية

- **دليل البداية:** [START_HERE_AR.md](START_HERE_AR.md)
- **الدليل الكامل:** [README.md](README.md)
- **Kitchen System:** [KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md)

---

## 🎉 تمام! دلوقتي أنت جاهز

الـ Postman Collection جاهز للاستخدام! 🚀

**نصيحة:** اتبع الترتيب من 0️⃣ لـ 9️⃣ أول مرة عشان تتأكد إن كل حاجة شغالة ✅
