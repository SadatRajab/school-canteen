@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════
echo   إعداد School Canteen Backend - CASH ONLY
echo ═══════════════════════════════════════════════════
echo.

echo [1/4] توليد JWT Secret...
node -e "const crypto = require('crypto'); const secret = crypto.randomBytes(32).toString('hex'); console.log('JWT_SECRET=' + secret);" > jwt_temp.txt
echo ✅ تم التوليد

echo.
echo [2/4] توليد Admin Password Hash...
echo الرجاء إدخال كلمة مرور الأدمن (على الأقل 8 أحرف):
set /p ADMIN_PASS=

echo.
echo ⏳ جاري التوليد...
node -e "const bcrypt = require('bcryptjs'); const password = '%ADMIN_PASS%'; bcrypt.hash(password, 10).then(hash => console.log('ADMIN_PASSWORD_HASH=' + hash));" > hash_temp.txt

echo.
echo [3/4] تحديث ملف .env...
echo.

echo ═══════════════════════════════════════════════════
echo   الرجاء نسخ هذه القيم إلى ملف .env
echo ═══════════════════════════════════════════════════
echo.
type jwt_temp.txt
type hash_temp.txt
echo.
echo ═══════════════════════════════════════════════════

echo.
echo [4/4] تنظيف الملفات المؤقتة...
del jwt_temp.txt
del hash_temp.txt

echo.
echo ✅ الإعداد مكتمل!
echo.
echo الخطوات التالية:
echo 1. انسخ JWT_SECRET و ADMIN_PASSWORD_HASH إلى ملف .env
echo 2. تأكد من تشغيل MongoDB
echo 3. شغل الخادم بالأمر: npm run dev
echo.
pause
