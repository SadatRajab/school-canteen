# 🔐 بيانات دخول الأدمن - Admin Login Credentials

## بيانات الدخول للنسخة التجريبية (Demo Version)

نظرًا لأن المشروع الآن **frontend-only** (بدون backend)، تم تعيين بيانات دخول تجريبية ثابتة:

### البريد الإلكتروني / Email:
```
admin@schoolcanteen.com
```

### كلمة المرور / Password:
```
admin123
```

---

## Admin Login Credentials

Since this project is now **frontend-only** (no backend), demo credentials are hardcoded:

### Email:
```
admin@schoolcanteen.com
```

### Password:
```
admin123
```

---

## 📝 ملاحظات مهمة / Important Notes

### للنسخة التجريبية (Current Demo Version):
- ✅ تسجيل الدخول يعمل محلياً في المتصفح
- ✅ لا يحتاج اتصال بالإنترنت
- ✅ Token يُخزن في sessionStorage
- ✅ مناسب للعروض التقديمية

### For Demo Version:
- ✅ Login works locally in browser
- ✅ No internet connection required
- ✅ Token stored in sessionStorage
- ✅ Perfect for presentations

---

## 🔄 للنسخة الإنتاجية (For Production)

إذا أردت استخدام نظام مصادقة حقيقي:

1. **إضافة Backend API**:
   ```typescript
   // في auth.service.ts
   login(credentials: AdminLoginRequest): Observable<any> {
       return this.http.post('/api/auth/login', credentials);
   }
   ```

2. **إضافة قاعدة بيانات للمستخدمين**:
   - MongoDB / PostgreSQL / Firebase
   - تخزين كلمات المرور مشفرة (bcrypt)
   - JWT tokens للمصادقة

3. **إضافة ميزات أمان**:
   - تحديد عدد محاولات الدخول
   - إعادة تعيين كلمة المرور
   - التحقق بخطوتين (2FA)
   - تسجيل الخروج التلقائي

If you want real authentication:

1. **Add Backend API**
2. **Add Users Database**
3. **Add Security Features**

---

## 🎓 تم التطوير بواسطة / Developed By

**Developer**: Haya Ezzat Ragab  
**Grade**: 6-2  
**Supervised by**: Math Teacher Ajshan

---

## 🔒 نصائح الأمان / Security Tips

### للنسخة التجريبية الحالية:
⚠️ **لا تستخدم للبيانات الحقيقية** - هذه نسخة تجريبية فقط

### For Current Demo:
⚠️ **Do not use for real data** - This is demo only

### للنسخة الإنتاجية:
- ✅ غيّر بيانات الدخول
- ✅ استخدم HTTPS فقط
- ✅ أضف rate limiting
- ✅ شفّر كلمات المرور
- ✅ استخدم JWT tokens آمنة

### For Production:
- ✅ Change credentials
- ✅ Use HTTPS only
- ✅ Add rate limiting
- ✅ Encrypt passwords
- ✅ Use secure JWT tokens
