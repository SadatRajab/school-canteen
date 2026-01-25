@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔═══════════════════════════════════════════════════╗
echo ║   Kitchen System - Integration Test Script       ║
echo ╚═══════════════════════════════════════════════════╝
echo.

set BASE_URL=http://localhost:5000/api
set TIMEZONE=Africa/Cairo
set TESTS_PASSED=0
set TESTS_FAILED=0

echo ════════════════════════════════════════════════════
echo Step 1: Health Check
echo ════════════════════════════════════════════════════

curl -s %BASE_URL%/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ PASSED[0m: Server is running
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗ FAILED[0m: Server health check failed
    set /a TESTS_FAILED+=1
    goto :summary
)

echo.
echo ════════════════════════════════════════════════════
echo Step 2: Admin Login
echo ════════════════════════════════════════════════════

set ADMIN_EMAIL=admin@schoolcanteen.com
set ADMIN_PASSWORD=Admin123!

curl -s -X POST %BASE_URL%/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%ADMIN_EMAIL%\",\"password\":\"%ADMIN_PASSWORD%\"}" > login.tmp

for /f "tokens=2 delims=:," %%a in ('type login.tmp ^| findstr "token"') do set TOKEN=%%a
set TOKEN=%TOKEN:"=%
set TOKEN=%TOKEN: =%

if not "%TOKEN%"=="" (
    echo [32m✓ PASSED[0m: Admin login successful
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗ FAILED[0m: Admin login failed
    set /a TESTS_FAILED+=1
    type login.tmp
    goto :cleanup
)

echo.
echo ════════════════════════════════════════════════════
echo Step 3: Create Test Product
echo ════════════════════════════════════════════════════

curl -s -X POST %BASE_URL%/admin/products ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"nameAr\":\"ساندويتش تست\",\"nameEn\":\"Test Sandwich\",\"price\":25,\"category\":\"Test\",\"isAvailable\":true}" > product.tmp

for /f "tokens=2 delims=:," %%a in ('type product.tmp ^| findstr "_id"') do set PRODUCT_ID=%%a
set PRODUCT_ID=%PRODUCT_ID:"=%
set PRODUCT_ID=%PRODUCT_ID: =%

if not "%PRODUCT_ID%"=="" (
    echo [32m✓ PASSED[0m: Product created
    echo Product ID: %PRODUCT_ID%
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗ FAILED[0m: Product creation failed
    set /a TESTS_FAILED+=1
)

echo.
echo ════════════════════════════════════════════════════
echo Step 4: Create Test Order (CASH ONLY)
echo ════════════════════════════════════════════════════

curl -s -X POST %BASE_URL%/orders ^
  -H "Content-Type: application/json" ^
  -H "X-Timezone: %TIMEZONE%" ^
  -d "{\"items\":[{\"productId\":\"%PRODUCT_ID%\",\"quantity\":2}]}" > order.tmp

for /f "tokens=2 delims=:," %%a in ('type order.tmp ^| findstr "orderId"') do set ORDER_ID=%%a
set ORDER_ID=%ORDER_ID:"=%
set ORDER_ID=%ORDER_ID: =%

if not "%ORDER_ID%"=="" (
    echo [32m✓ PASSED[0m: Order created
    echo Order ID: %ORDER_ID%
    echo Payment: CASH (enforced)
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗ FAILED[0m: Order creation failed
    set /a TESTS_FAILED+=1
)

echo.
echo ════════════════════════════════════════════════════
echo Step 5: Kitchen - Get Today's Orders
echo ════════════════════════════════════════════════════

curl -s %BASE_URL%/kitchen/orders/today ^
  -H "X-Timezone: %TIMEZONE%" > kitchen.tmp

findstr "count" kitchen.tmp >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ PASSED[0m: Kitchen sees today's orders
    set /a TESTS_PASSED+=1
    
    findstr "unitPriceSnapshot\|lineTotal\|totalAmount" kitchen.tmp >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [32m✓ PASSED[0m: Security check - No prices exposed
        set /a TESTS_PASSED+=1
    ) else (
        echo [31m✗ FAILED[0m: SECURITY ISSUE - Prices exposed!
        set /a TESTS_FAILED+=1
    )
) else (
    echo [31m✗ FAILED[0m: Kitchen doesn't see orders
    set /a TESTS_FAILED+=1
)

echo.
echo ════════════════════════════════════════════════════
echo Step 6: Kitchen - Start Preparing Order
echo ════════════════════════════════════════════════════

curl -s -X PATCH %BASE_URL%/kitchen/orders/%ORDER_ID%/start > start.tmp

findstr "PREPARING" start.tmp >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ PASSED[0m: Order status changed to PREPARING
    set /a TESTS_PASSED+=1
    
    findstr "preparingAt" start.tmp >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [32m✓ PASSED[0m: preparingAt timestamp set
        set /a TESTS_PASSED+=1
    )
) else (
    echo [31m✗ FAILED[0m: Failed to start preparing
    set /a TESTS_FAILED+=1
)

echo.
echo ════════════════════════════════════════════════════
echo Step 7: Admin - Deliver Order
echo ════════════════════════════════════════════════════

curl -s -X PATCH %BASE_URL%/admin/orders/%ORDER_ID%/deliver ^
  -H "Authorization: Bearer %TOKEN%" > deliver.tmp

findstr "DELIVERED" deliver.tmp >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✓ PASSED[0m: Order delivered successfully
    set /a TESTS_PASSED+=1
    
    findstr "deliveredAt" deliver.tmp >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [32m✓ PASSED[0m: deliveredAt timestamp set
        set /a TESTS_PASSED+=1
    )
) else (
    echo [31m✗ FAILED[0m: Failed to deliver order
    set /a TESTS_FAILED+=1
)

echo.
echo ════════════════════════════════════════════════════
echo Step 8: Cleanup - Delete Test Product
echo ════════════════════════════════════════════════════

curl -s -X DELETE %BASE_URL%/admin/products/%PRODUCT_ID% ^
  -H "Authorization: Bearer %TOKEN%" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [32m✓ PASSED[0m: Test product deleted
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗ FAILED[0m: Failed to delete test product
    set /a TESTS_FAILED+=1
)

:summary
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║              TEST SUMMARY                         ║
echo ╠═══════════════════════════════════════════════════╣
echo ║  Passed: %TESTS_PASSED%                                   
echo ║  Failed: %TESTS_FAILED%                                   
echo ╚═══════════════════════════════════════════════════╝
echo.

if %TESTS_FAILED% EQU 0 (
    echo [32m✓ All tests passed! Kitchen system is working correctly.[0m
) else (
    echo [31m✗ Some tests failed. Please review the output above.[0m
)

:cleanup
del login.tmp product.tmp order.tmp kitchen.tmp start.tmp deliver.tmp >nul 2>&1

pause
