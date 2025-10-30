# Telecom Cart API Demo Script (PowerShell)
# This script demonstrates the complete cart workflow

$API_BASE = "http://localhost:3000/api/v1"

Write-Host "🚀 Telecom Cart Experience API Demo" -ForegroundColor Green
Write-Host "=================================="

# 1. Health check
Write-Host "1. Health Check..." -ForegroundColor Yellow
$healthResponse = Invoke-RestMethod -Uri "$API_BASE/../health" -Method Get
$healthResponse | ConvertTo-Json

# 2. Get Available Products
Write-Host "`n2. Get Available Products..." -ForegroundColor Yellow
$productsResponse = Invoke-RestMethod -Uri "$API_BASE/products" -Method Get
$productsResponse.products | Select-Object productId, name, category, planType, pricing | Format-Table

# 3. Create a cart
Write-Host "`n3. Creating a new cart..." -ForegroundColor Yellow
$cartData = @{
    customerId = "demo_customer_123"
    customerType = "individual"
    region = "US_WEST"
} | ConvertTo-Json

$cartResponse = Invoke-RestMethod -Uri "$API_BASE/carts" -Method Post -Body $cartData -ContentType "application/json"
$cartId = $cartResponse.cartId
Write-Host "Cart created with ID: $cartId" -ForegroundColor Green
$cartResponse | ConvertTo-Json

# 4. Add a postpaid plan
Write-Host "`n4. Adding Unlimited 5G Plan to cart..." -ForegroundColor Yellow
$planData = @{
    productId = "plan_unlimited_5g"
    quantity = 1
    planType = "postpaid"
    billingCycle = "monthly"
    features = @("international_calling", "mobile_hotspot")
} | ConvertTo-Json

$addPlanResponse = Invoke-RestMethod -Uri "$API_BASE/carts/$cartId/items" -Method Post -Body $planData -ContentType "application/json"
Write-Host "Plan added successfully!" -ForegroundColor Green
$addPlanResponse.items | Select-Object itemId, productName, quantity, totalPrice | Format-Table
Write-Host "Cart totals:" -ForegroundColor Cyan
$addPlanResponse.totals | Format-List

# 5. Add a compatible device
Write-Host "`n5. Adding iPhone 15 Pro to cart..." -ForegroundColor Yellow
$deviceData = @{
    productId = "device_iphone_15"
    quantity = 1
    planType = "postpaid"
} | ConvertTo-Json

$addDeviceResponse = Invoke-RestMethod -Uri "$API_BASE/carts/$cartId/items" -Method Post -Body $deviceData -ContentType "application/json"
$itemId = $addDeviceResponse.items[1].itemId
Write-Host "Device added with item ID: $itemId" -ForegroundColor Green
$addDeviceResponse.items | Select-Object itemId, productName, quantity, totalPrice | Format-Table
Write-Host "Updated cart totals:" -ForegroundColor Cyan
$addDeviceResponse.totals | Format-List

# 6. Update quantity
Write-Host "`n6. Updating iPhone quantity to 2..." -ForegroundColor Yellow
$quantityData = @{
    quantity = 2
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "$API_BASE/carts/$cartId/items/$itemId/quantity" -Method Put -Body $quantityData -ContentType "application/json"
Write-Host "Quantity updated successfully!" -ForegroundColor Green
$updateResponse.items | Select-Object itemId, productName, quantity, totalPrice | Format-Table
Write-Host "Updated cart totals:" -ForegroundColor Cyan
$updateResponse.totals | Format-List

# 7. Get final cart
Write-Host "`n7. Final cart state..." -ForegroundColor Yellow
$finalCart = Invoke-RestMethod -Uri "$API_BASE/carts/$cartId" -Method Get
$finalCart | Select-Object cartId, customerId, @{Name='ItemCount';Expression={$_.items.Length}}, @{Name='Total';Expression={$_.totals.total}} | Format-List

Write-Host "`n✅ Demo completed successfully!" -ForegroundColor Green
Write-Host "Cart ID for further testing: $cartId" -ForegroundColor Cyan

# Optional: Test error scenarios
Write-Host "`n8. Testing error scenarios..." -ForegroundColor Yellow

# Try to mix prepaid and postpaid (should fail)
Write-Host "Attempting to add prepaid plan to postpaid cart (should fail)..." -ForegroundColor Red
try {
    $invalidPlanData = @{
        productId = "plan_prepaid_basic"
        quantity = 1
        planType = "prepaid"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$API_BASE/carts/$cartId/items" -Method Post -Body $invalidPlanData -ContentType "application/json"
} catch {
    Write-Host "Expected error caught: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error: $($errorResponse.error.message)" -ForegroundColor Red
}

Write-Host "`n🎯 API is working correctly with proper validation!" -ForegroundColor Green