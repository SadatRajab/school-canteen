# نظام إدارة مقصف المدرسة 🍕

## نظرة عامة
نظام متكامل لإدارة مقصف المدرسة مع نظام الدفع النقدي فقط، لوحة تحكم الإدارة، ونظام عرض المطبخ.

---

## 🚀 الرفع على Railway

### الخطوات السريعة

#### 1. إنشاء مشروع على Railway
1. اذهب إلى [railway.app](https://railway.app)
2. اضغط "New Project"
3. اختر "Deploy from GitHub repo"
4. اختر المستودع الخاص بك
5. حدد مجلد `Backend` كـ Root Directory

#### 2. إضافة قاعدة بيانات MongoDB
1. اضغط "New Service" في المشروع
2. اختر "Database"
3. اختر "MongoDB"
4. Railway سينشئ قاعدة بيانات تلقائياً
5. انسخ `MONGO_URL` من متغيرات خدمة MongoDB

#### 3. ضبط متغيرات البيئة
في إعدادات مشروع Railway، أضف المتغيرات التالية:

```env
NODE_ENV=production
PORT=${{PORT}}
MONGO_URI=${{MONGO_URL}}
ADMIN_EMAIL=admin@schoolcanteen.com
ADMIN_PASSWORD_HASH=<الهاش-المُولَّد>
JWT_SECRET=<مفتاح-عشوائي-قوي>
JWT_EXPIRES_IN=12h
CORS_ORIGIN=https://رابط-الفرونت-اند.com
```

#### 4. توليد الأسرار المطلوبة

**توليد هاش كلمة المرور:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('كلمة-المرور', 10).then(console.log);"
```

**توليد JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

---

## 📁 هيكل المشروع

```
School-Canteen/
│
├── Backend/                 # خادم API (Node.js/Express)
│   ├── config/             # إعدادات قاعدة البيانات
│   ├── controllers/        # معالجات الطلبات
│   ├── middleware/         # المصادقة والتحقق
│   ├── models/             # نماذج MongoDB
│   ├── routes/             # مسارات API
│   ├── uploads/            # تخزين الصور
│   ├── server.js          # نقطة البداية
│   ├── railway.json       # إعدادات Railway
│   ├── Procfile           # ملف العمليات
│   └── .nvmrc            # إصدار Node.js
│
├── FrontEnd/               # تطبيق Angular
│   └── ...
│
├── RAILWAY_README.md       # دليل الرفع الكامل
└── README.md              # هذا الملف
```

---

## 🔧 الإعدادات المهمة

### Railway Port
Railway يخصص منفذ تلقائياً عبر متغير `$PORT`. الخادم مُعد مسبقاً لاستخدام `process.env.PORT`.

### Root Directory
تأكد من أن Railway يشير إلى مجلد `Backend`:
- Settings → Service → Root Directory: `/Backend`

### Build Command
Railway سيشغل تلقائياً:
```bash
npm install
```

### Start Command
```bash
npm start
```

---

## 🗄️ خيارات قاعدة البيانات

### الخيار 1: Railway MongoDB (موصى به)
- إعداد سهل داخل Railway
- سلسلة اتصال تلقائية
- خدمة مُدارة

### الخيار 2: MongoDB Atlas
1. أنشئ Cluster مجاني على [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. احصل على سلسلة الاتصال
3. أضفها إلى متغير `MONGO_URI`

---

## ✅ قائمة التحقق بعد الرفع

1. **اختبار صحة API**
   ```
   https://تطبيقك.railway.app/api/health
   ```

2. **اختبار تسجيل دخول المدير**
   - استخدم Postman
   - POST إلى `/api/admin/login`
   - بيانات الاعتماد من متغيرات البيئة

3. **تحديث الفرونت إند**
   - حدّث رابط API في ملفات environment
   - وجّه إلى رابط Railway الخلفي

4. **تفعيل CORS**
   - أضف نطاق الفرونت إند إلى `CORS_ORIGIN`
   - نطاقات متعددة: `https://domain1.com,https://domain2.com`

---

## 🌐 نقاط نهاية API

### المنتجات
- `GET /api/products` - الحصول على جميع المنتجات
- `POST /api/products` - إنشاء منتج (مدير)
- `PUT /api/products/:id` - تحديث منتج (مدير)
- `DELETE /api/products/:id` - حذف منتج (مدير)

### الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `GET /api/orders/:id` - الحصول على طلب بواسطة ID
- `GET /api/orders` - الحصول على جميع الطلبات (مدير)

### المدير
- `POST /api/admin/login` - تسجيل دخول المدير
- `GET /api/admin/dashboard` - إحصائيات لوحة التحكم

### المطبخ
- `GET /api/kitchen/orders` - الحصول على الطلبات المعلقة
- `PATCH /api/kitchen/orders/:id/status` - تحديث حالة الطلب

### فحص الصحة
- `GET /api/health` - حالة الخادم

---

## 🔐 ميزات الأمان

- ✅ رؤوس أمان Helmet.js
- ✅ حماية CORS
- ✅ تحديد المعدل
- ✅ منع حقن MongoDB
- ✅ مصادقة JWT
- ✅ تشفير كلمات المرور مع bcrypt
- ✅ التحقق من المدخلات مع Joi

---

## 📊 التقنيات المستخدمة

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Image Processing**: Sharp + Multer
- **Security**: Helmet, CORS, Rate Limiting

---

## 💰 تقدير التكلفة

أسعار Railway:
- **المستوى المجاني**: $5 رصيد/شهر
- **خطة Pro**: $20/شهر

الاستخدام النموذجي لهذا المشروع:
- Backend: ~$3-5/شهر
- MongoDB: ~$2-3/شهر
- **الإجمالي**: ~$5-8/شهر (أو المستوى المجاني)

---

## 🔄 النشر التلقائي

Railway ينشر تلقائياً عند الـ push:

1. قم بإجراء تغييرات على الكود
2. `git commit -m "تحديث"`
3. `git push origin main`
4. Railway ينشر تلقائياً ✅

---

## 📚 الوثائق الكاملة

- **دليل Railway**: [RAILWAY_README.md](RAILWAY_README.md)
- **توثيق API**: [Backend/README.md](Backend/README.md)
- **الهيكل المعماري**: [Backend/ARCHITECTURE.md](Backend/ARCHITECTURE.md)
- **دليل Railway بالتفصيل**: [Backend/RAILWAY_DEPLOYMENT.md](Backend/RAILWAY_DEPLOYMENT.md)

---

## 🐛 حل المشاكل الشائعة

### مشاكل الاتصال بقاعدة البيانات
- تحقق من صحة `MONGO_URI`
- تأكد من تشغيل خدمة MongoDB
- تأكد من السماح بـ IP الخاص بـ Railway

### أخطاء CORS
- أضف نطاق الفرونت إند إلى `CORS_ORIGIN`
- الصيغة: `https://domain1.com,https://domain2.com`

### أخطاء المصادقة
- تحقق من ضبط `JWT_SECRET`
- تأكد من صحة `ADMIN_PASSWORD_HASH`
- تأكد من تطابق بيانات اعتماد المدير

---

## 🎯 الخطوات التالية

1. ✅ رفع Backend على Railway
2. ✅ ضبط متغيرات البيئة
3. ✅ إضافة قاعدة بيانات MongoDB
4. ✅ اختبار نقاط نهاية API
5. 🎯 رفع Frontend (Netlify/Vercel)
6. 🎯 ربط Frontend بـ Backend
7. 🎯 اختبار التطبيق الكامل

---

## 📞 الدعم والموارد

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: دعم المجتمع
- **GitHub Issues**: الإبلاغ عن الأخطاء

---

**جاهز للرفع؟ اتبع الدليل أعلاه! 🚀**

للتعليمات التفصيلية، راجع [RAILWAY_README.md](RAILWAY_README.md)
