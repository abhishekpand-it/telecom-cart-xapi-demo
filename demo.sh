#!/usr/bin/env bash

# Telecom Cart API Demo Script
# This script demonstrates the complete cart workflow

API_BASE="http://localhost:3000/api/v1"

echo "🚀 Telecom Cart Experience API Demo"
echo "=================================="

# 1. Health check
echo "1. Health Check..."
curl -s "$API_BASE/../health" | jq .

echo -e "\n2. Get Available Products..."
curl -s "$API_BASE/products" | jq '.products[] | {productId, name, category, planType, pricing}'

# 3. Create a cart
echo -e "\n3. Creating a new cart..."
CART_RESPONSE=$(curl -s -X POST "$API_BASE/carts" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "demo_customer_123",
    "customerType": "individual",
    "region": "US_WEST"
  }')

CART_ID=$(echo "$CART_RESPONSE" | jq -r '.cartId')
echo "Cart created with ID: $CART_ID"
echo "$CART_RESPONSE" | jq .

# 4. Add a postpaid plan
echo -e "\n4. Adding Unlimited 5G Plan to cart..."
ADD_ITEM_RESPONSE=$(curl -s -X POST "$API_BASE/carts/$CART_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "plan_unlimited_5g",
    "quantity": 1,
    "planType": "postpaid",
    "billingCycle": "monthly",
    "features": ["international_calling", "mobile_hotspot"]
  }')

echo "$ADD_ITEM_RESPONSE" | jq '.items[] | {itemId, productName, quantity, totalPrice}'
echo "Cart totals:"
echo "$ADD_ITEM_RESPONSE" | jq '.totals'

# 5. Add a compatible device
echo -e "\n5. Adding iPhone 15 Pro to cart..."
ADD_DEVICE_RESPONSE=$(curl -s -X POST "$API_BASE/carts/$CART_ID/items" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "device_iphone_15",
    "quantity": 1,
    "planType": "postpaid"
  }')

ITEM_ID=$(echo "$ADD_DEVICE_RESPONSE" | jq -r '.items[1].itemId')
echo "Device added with item ID: $ITEM_ID"
echo "$ADD_DEVICE_RESPONSE" | jq '.items[] | {itemId, productName, quantity, totalPrice}'
echo "Updated cart totals:"
echo "$ADD_DEVICE_RESPONSE" | jq '.totals'

# 6. Update quantity
echo -e "\n6. Updating iPhone quantity to 2..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE/carts/$CART_ID/items/$ITEM_ID/quantity" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2
  }')

echo "$UPDATE_RESPONSE" | jq '.items[] | {itemId, productName, quantity, totalPrice}'
echo "Updated cart totals:"
echo "$UPDATE_RESPONSE" | jq '.totals'

# 7. Get final cart
echo -e "\n7. Final cart state..."
curl -s "$API_BASE/carts/$CART_ID" | jq '{cartId, customerId, items: .items | length, total: .totals.total}'

echo -e "\n✅ Demo completed successfully!"
echo "Cart ID for further testing: $CART_ID"