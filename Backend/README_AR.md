# 🚀 دليل التشغيل السريع - School Canteen Backend

## ✅ المتطلبات الأساسية

قبل ما تبدأ، تأكد إنك نزلت:
- ✅ Node.js (إصدار 18 أو أحدث)
- ✅ MongoDB (محلي أو MongoDB Atlas)
- ✅ محرر نصوص (VS Code مثلاً)

---

## 📝 خطوات التشغيل (5 دقائق)

### 1️⃣ تثبيت المكتبات

افتح Terminal في مجلد Backend واكتب:

```bash
npm install
```

انتظر لحد ما التثبيت يخلص (ممكن ياخد دقيقة أو اتنين).

---

### 2️⃣ إعداد ملف البيئة (.env)

#### الطريقة الأولى: استخدام السكريبت الجاهز

```bash
# شغل السكريبت ده وهو هيعمل كل حاجة:
node scripts/generateJwtSecret.js
node scripts/generatePasswordHash.js
```

#### الطريقة الثانية: يدوياً

**أ) توليد JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

انسخ الناتج وحطه في `.env`:
```
JWT_SECRET=<الناتج-هنا>
```

**ب) توليد Admin Password Hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('كلمة-السر-بتاعتك', 10).then(h => console.log(h))"
```

انسخ الناتج وحطه في `.env`:
```
ADMIN_PASSWORD_HASH=<الناتج-هنا>
```

**ج) تعديل ملف `.env`:**

افتح ملف `.env` وتأكد إنه بالشكل ده:

```env
NODE_ENV=development
PORT=5000

# MongoDB - غير العنوان لو محتاج
MONGO_URI=mongodb://localhost:27017/school-canteen

# Admin Account
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<الهاش-اللي-ولدته>

# JWT
JWT_SECRET=<السيكرت-اللي-ولدته>
JWT_EXPIRES_IN=12h

# CORS
CORS_ORIGIN=http://localhost:4200
```

---

### 3️⃣ تشغيل MongoDB

**لو عندك MongoDB محلي:**
```bash
mongod
```

**لو بتستخدم MongoDB Atlas:**
- سجل دخول على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- انشئ Cluster
- خذ Connection String وحطه في `MONGO_URI`

---

### 4️⃣ تشغيل الخادم

```bash
# وضع التطوير (مع إعادة التشغيل التلقائي)
npm run dev

# أو وضع الإنتاج
npm start
```

لو كل حاجة تمام، هتشوف:
```
╔═══════════════════════════════════════════════╗
║   School Canteen API - CASH ONLY System      ║
║   Server running on port 5000                ║
║   Environment: development                   ║
╚═══════════════════════════════════════════════╝
MongoDB Connected: localhost:27017
```

---

## 🧪 اختبار الـ API

### 1. افحص إن السيرفر شغال:

```bash
curl http://localhost:5000/api/health
```

أو افتح المتصفح على: `http://localhost:5000/api/health`

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "message": "School Canteen API is running"
}
```

---

### 2. تسجيل دخول الأدمن:

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@schoolcanteen.com\",\"password\":\"كلمة-السر-بتاعتك\"}"
```

**هتحصل على:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "admin": {
    "email": "admin@schoolcanteen.com"
  }
}
```

**احفظ الـ token ده!** هتحتاجه في كل طلب Admin.

---

### 3. إضافة منتج:

```bash
curl -X POST http://localhost:5000/api/admin/products \
  -H "Authorization: Bearer <الـTOKEN-هنا>" \
  -H "Content-Type: application/json" \
  -d "{\"nameAr\":\"ساندويتش دجاج\",\"nameEn\":\"Chicken Sandwich\",\"price\":25,\"category\":\"Sandwiches\",\"isAvailable\":true}"
```

---

### 4. عرض كل المنتجات:

```bash
curl http://localhost:5000/api/products
```

---

### 5. إنشاء طلب (CASH فقط):

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Africa/Cairo" \
  -d "{\"items\":[{\"productId\":\"<معرف-المنتج>\",\"quantity\":2}]}"
```

---

## 📂 هيكل المشروع

```
Backend/
├── server.js              # نقطة البداية
├── config/                # إعدادات MongoDB
├── models/                # نماذج قاعدة البيانات
├── controllers/           # منطق الأعمال
│   ├── kitchenController.js   # تحكم المطبخ (جديد)
├── routes/                # نقاط النهاية (Endpoints)
│   ├── kitchen.js         # مسارات المطبخ (جديد)
├── middleware/            # المصادقة والتحقق
├── utils/                 # أدوات مساعدة
├── uploads/               # الصور المرفوعة
└── .env                   # متغيرات البيئة
```

---

## 🔥 الميزات الرئيسية

### ✅ نظام الدفع النقدي فقط (CASH ONLY)
- **مستحيل** إضافة طريقة دفع غير النقد
- السيرفر يرفض أي محاولة لتغيير طريقة الدفع
- كل طلب = نقدي 💵

### 🍳 نظام المطبخ / التحضير (جديد!)
- سير عمل احترافي مثل المطاعم
- حالات الطلب: قيد الانتظار ← يتم التحضير ← تم التسليم
- المطبخ يرى الطلبات فقط بدون أسعار
- **شاهد [KITCHEN_SYSTEM.md](KITCHEN_SYSTEM.md) للتفاصيل الكاملة**

### 🌍 أرقام طوابير حسب التوقيت المحلي
- كل منطقة زمنية ليها أرقام منفصلة
- الأرقام تبدأ من 1 كل يوم
- لو في برلين الساعة 11 مساءً = رقم اليوم التالي
- لو في القاهرة الساعة 11 مساءً = نفس اليوم

### 💰 حساب السعر من السيرفر فقط
- العميل يبعت: معرف المنتج + الكمية
- السيرفر يجيب السعر من قاعدة البيانات
- **مستحيل** التلاعب بالأسعار

### 🔐 أمان عالي
- حساب أدمن واحد فقط
- JWT للمصادقة
- Rate limiting على تسجيل الدخول
- Helmet لحماية الـ Headers
- التحقق من المدخلات بـ Joi

---

## 🔄 سير عمل الطلبات (محدّث)

```
قيد الانتظار (PENDING)
        ↓
   المطبخ يبدأ التحضير
        ↓
يتم التحضير (PREPARING)
        ↓
    الأدمن يُسلّم
        ↓
تم التسليم (DELIVERED)
```

---

## 🛠️ أوامر مفيدة

```bash
# تشغيل وضع التطوير
npm run dev

# تشغيل وضع الإنتاج
npm start

# توليد JWT Secret
npm run setup:jwt

# توليد Password Hash
npm run setup:password
```

---

## ❓ حل المشاكل الشائعة

### المشكلة: "MongoDB connection error"
**الحل:**
1. تأكد إن MongoDB شغال: `mongod`
2. تحقق من `MONGO_URI` في `.env`
3. لو Atlas، تأكد من الـ IP Whitelist

---

### المشكلة: "Invalid credentials" عند تسجيل الدخول
**الحل:**
1. تأكد من الإيميل صح (`ADMIN_EMAIL` في `.env`)
2. تأكد من كلمة السر اللي استخدمتها وقت التوليد
3. ولد الـ hash تاني بكلمة سر جديدة

---

### المشكلة: "Token is invalid"
**الحل:**
1. تأكد إن الـ Token موجود في الـ Header
2. تأكد من الصيغة: `Authorization: Bearer <token>`
3. لو التوكن قديم (أكتر من 12 ساعة)، سجل دخول تاني

---

### المشكلة: "Product not found" عند إنشاء طلب
**الحل:**
1. تأكد إن المنتج موجود: `GET /api/products`
2. استخدم الـ `_id` الصحيح من قاعدة البيانات
3. تأكد إن `isAvailable: true`

---

## 📱 ربط مع الـ Frontend

في الـ Angular Frontend، استخدم:

```typescript
const API_URL = 'http://localhost:5000/api';

// عند إنشاء طلب، أرسل الـ timezone:
headers: {
  'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
}
```

---

## 📚 ملفات إضافية

- **README.md** - توثيق كامل بالإنجليزية
- **ARCHITECTURE.md** - شرح معماري مفصل
- **API_TESTING_GUIDE.md** - أمثلة اختبار شاملة

---

## 💡 نصائح مهمة

1. **أبداً** ما تشارك ملف `.env` مع حد
2. استخدم كلمة سر قوية للأدمن (12+ حرف)
3. خذ نسخة احتياطية من قاعدة البيانات بانتظام
4. في الإنتاج، استخدم HTTPS دائماً
5. غير `CORS_ORIGIN` للدومين الحقيقي في الإنتاج

---

## 🎯 الخطوات التالية

بعد ما تشغل الـ Backend:
1. ✅ اختبر كل الـ Endpoints
2. ✅ اربطه مع الـ Frontend
3. ✅ ارفع صور للمنتجات
4. ✅ جرب إنشاء طلبات
5. ✅ اختبر نظام الأرقام
6. ✅ راجع الإحصائيات والأرباح

---

## 📞 دعم

لأي أسئلة أو مشاكل، راجع:
- الملفات التوثيقية في المجلد
- أمثلة الـ API في `API_TESTING_GUIDE.md`
- شرح المعمارية في `ARCHITECTURE.md`

---

**بالتوفيق! 🎓**

**تذكر دائماً: نقدي فقط - لا استثناءات! 💵**
