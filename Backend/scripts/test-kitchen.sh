#!/bin/bash

# Kitchen System Test Script
# Tests all kitchen endpoints and verifies functionality

BASE_URL="http://localhost:5000/api"
TIMEZONE="Africa/Cairo"

echo "╔═══════════════════════════════════════════════════╗"
echo "║   Kitchen System - Integration Test Script       ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    print_result 0 "Server is running"
else
    print_result 1 "Server health check failed (HTTP $HEALTH_CHECK)"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Admin Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Read admin credentials from .env or use defaults
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@schoolcanteen.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"Admin123!"}

LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    print_result 0 "Admin login successful"
    echo -e "${YELLOW}Token:${NC} ${TOKEN:0:20}..."
else
    print_result 1 "Admin login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Create Test Product"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PRODUCT_RESPONSE=$(curl -s -X POST $BASE_URL/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nameAr": "ساندويتش تست",
    "nameEn": "Test Sandwich",
    "descAr": "للاختبار فقط",
    "descEn": "For testing only",
    "price": 25.00,
    "category": "Test",
    "isAvailable": true
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PRODUCT_ID" ]; then
    print_result 0 "Product created"
    echo -e "${YELLOW}Product ID:${NC} $PRODUCT_ID"
else
    print_result 1 "Product creation failed"
    echo "Response: $PRODUCT_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Create Test Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/orders \
  -H "Content-Type: application/json" \
  -H "X-Timezone: $TIMEZONE" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 2
      }
    ]
  }")

ORDER_ID=$(echo $ORDER_RESPONSE | grep -o '"orderId":"[^"]*' | cut -d'"' -f4)
ORDER_NUMBER=$(echo $ORDER_RESPONSE | grep -o '"orderNumber":[0-9]*' | cut -d':' -f2)

if [ -n "$ORDER_ID" ]; then
    print_result 0 "Order created"
    echo -e "${YELLOW}Order ID:${NC} $ORDER_ID"
    echo -e "${YELLOW}Order Number:${NC} $ORDER_NUMBER"
    echo -e "${YELLOW}Payment Method:${NC} CASH (enforced)"
else
    print_result 1 "Order creation failed"
    echo "Response: $ORDER_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Kitchen - Get Today's Orders"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KITCHEN_TODAY=$(curl -s $BASE_URL/kitchen/orders/today \
  -H "X-Timezone: $TIMEZONE")

KITCHEN_COUNT=$(echo $KITCHEN_TODAY | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ "$KITCHEN_COUNT" -ge 1 ]; then
    print_result 0 "Kitchen sees today's orders (count: $KITCHEN_COUNT)"
    
    # Verify no prices in response
    if echo "$KITCHEN_TODAY" | grep -q "unitPriceSnapshot\|lineTotal\|totalAmount"; then
        print_result 1 "SECURITY ISSUE: Prices exposed to kitchen!"
    else
        print_result 0 "Security check: No prices exposed to kitchen"
    fi
else
    print_result 1 "Kitchen doesn't see orders"
    echo "Response: $KITCHEN_TODAY"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6: Kitchen - Start Preparing Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

START_RESPONSE=$(curl -s -X PATCH $BASE_URL/kitchen/orders/$ORDER_ID/start)

START_STATUS=$(echo $START_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$START_STATUS" = "PREPARING" ]; then
    print_result 0 "Order status changed to PREPARING"
    
    # Verify preparingAt timestamp exists
    if echo "$START_RESPONSE" | grep -q "preparingAt"; then
        print_result 0 "preparingAt timestamp set"
    else
        print_result 1 "preparingAt timestamp missing"
    fi
else
    print_result 1 "Failed to start preparing (status: $START_STATUS)"
    echo "Response: $START_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7: Test Invalid State Transition"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INVALID_START=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PATCH $BASE_URL/kitchen/orders/$ORDER_ID/start)

if [ "$INVALID_START" = "400" ]; then
    print_result 0 "Correctly rejected duplicate start request (HTTP 400)"
else
    print_result 1 "Should reject starting already-started order"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 8: Admin - Deliver Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DELIVER_RESPONSE=$(curl -s -X PATCH $BASE_URL/admin/orders/$ORDER_ID/deliver \
  -H "Authorization: Bearer $TOKEN")

DELIVER_STATUS=$(echo $DELIVER_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)

if [ "$DELIVER_STATUS" = "DELIVERED" ]; then
    print_result 0 "Order delivered successfully"
    
    # Verify deliveredAt timestamp exists
    if echo "$DELIVER_RESPONSE" | grep -q "deliveredAt"; then
        print_result 0 "deliveredAt timestamp set"
    fi
    
    # Verify preparingAt is preserved
    if echo "$DELIVER_RESPONSE" | grep -q "preparingAt"; then
        print_result 0 "preparingAt timestamp preserved"
    fi
else
    print_result 1 "Failed to deliver order"
    echo "Response: $DELIVER_RESPONSE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 9: Verify Order Removed from Kitchen View"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

KITCHEN_AFTER=$(curl -s $BASE_URL/kitchen/orders/today \
  -H "X-Timezone: $TIMEZONE")

# Check if delivered order is NOT in kitchen view
if echo "$KITCHEN_AFTER" | grep -q "$ORDER_ID"; then
    print_result 1 "Delivered order still visible in kitchen"
else
    print_result 0 "Delivered order correctly hidden from kitchen"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 10: Cleanup - Delete Test Product"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE $BASE_URL/admin/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN")

if [ "$DELETE_RESPONSE" = "200" ]; then
    print_result 0 "Test product deleted"
else
    print_result 1 "Failed to delete test product"
fi

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║              TEST SUMMARY                         ║"
echo "╠═══════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed:${NC} $TESTS_PASSED                                   ║"
echo -e "║  ${RED}Failed:${NC} $TESTS_FAILED                                   ║"
echo "╚═══════════════════════════════════════════════════╝"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed! Kitchen system is working correctly.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed. Please review the output above.${NC}"
    exit 1
fi
