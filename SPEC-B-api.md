# SPEC-B: API Endpoint Contracts

## Overview
RESTful API endpoints for telecom cart operations with comprehensive error handling, validation, and telecom-specific business logic. All endpoints return JSON and follow consistent error response patterns.

## Base Configuration
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Authentication**: None (demo purposes)

## Core Endpoints

### 1. Create Cart
**Create a new cart for a customer**

```
POST /carts
```

**Request Body:**
```typescript
interface CreateCartRequest {
  customerId: string;           // Customer identifier
  customerType?: 'individual' | 'business';  // Default: 'individual'
  region?: string;             // Geographic region for plan availability
}
```

**Success Response (201):**
```typescript
interface CartResponse {
  cartId: string;
  customerId: string;
  customerType: 'individual' | 'business';
  region: string;
  items: CartItem[];
  totals: CartTotals;
  metadata: {
    createdAt: string;        // ISO timestamp
    updatedAt: string;        // ISO timestamp
    expiresAt: string;        // ISO timestamp
    status: 'active' | 'expired';
  };
}
```

**Error Responses:**
- `400` - Invalid customer ID or request format
- `500` - Internal server error

---

### 2. Get Cart
**Retrieve cart details**

```
GET /carts/{cartId}
```

**Path Parameters:**
- `cartId`: string (required) - Cart identifier

**Success Response (200):**
```typescript
// Same as CartResponse above
```

**Error Responses:**
- `404` - Cart not found or expired
- `500` - Internal server error

---

### 3. Add Item to Cart
**Add a telecom product to the cart**

```
POST /carts/{cartId}/items
```

**Request Body:**
```typescript
interface AddItemRequest {
  productId: string;          // Telecom product identifier
  quantity: number;           // Must be > 0
  planType: 'prepaid' | 'postpaid';
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';  // Default: 'monthly'
  features?: string[];        // Optional add-on features
  customAttributes?: Record<string, any>;  // Product-specific data
}
```

**Success Response (200):**
```typescript
// Returns updated CartResponse
```

**Error Responses:**
- `400` - Invalid product, quantity, or plan configuration
- `404` - Cart not found
- `409` - Product incompatible with existing cart items
- `422` - Business rule violation (e.g., plan limits exceeded)
- `500` - Internal server error

---

### 4. Update Item Quantity
**Modify quantity of existing cart item**

```
PUT /carts/{cartId}/items/{itemId}/quantity
```

**Request Body:**
```typescript
interface UpdateQuantityRequest {
  quantity: number;           // Must be > 0
}
```

**Success Response (200):**
```typescript
// Returns updated CartResponse
```

**Error Responses:**
- `400` - Invalid quantity
- `404` - Cart or item not found
- `422` - Quantity violates business rules
- `500` - Internal server error

---

### 5. Remove Item from Cart
**Remove item from cart**

```
DELETE /carts/{cartId}/items/{itemId}
```

**Success Response (204):**
- No content

**Error Responses:**
- `404` - Cart or item not found
- `500` - Internal server error

---

### 6. Clear Cart
**Remove all items from cart**

```
DELETE /carts/{cartId}/items
```

**Success Response (200):**
```typescript
// Returns updated CartResponse with empty items array
```

**Error Responses:**
- `404` - Cart not found
- `500` - Internal server error

---

### 7. Get Available Products
**List telecom products for cart context**

```
GET /products
```

**Query Parameters:**
- `region?: string` - Filter by region
- `planType?: 'prepaid' | 'postpaid'` - Filter by plan type
- `category?: string` - Product category filter

**Success Response (200):**
```typescript
interface ProductsResponse {
  products: TelecomProduct[];
  totalCount: number;
  filters: {
    regions: string[];
    planTypes: string[];
    categories: string[];
  };
}
```

---

## Data Models

### CartItem
```typescript
interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  planType: 'prepaid' | 'postpaid';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  unitPrice: number;
  totalPrice: number;
  features: string[];
  customAttributes: Record<string, any>;
  addedAt: string;            // ISO timestamp
}
```

### CartTotals
```typescript
interface CartTotals {
  subtotal: number;
  discounts: number;
  taxes: number;
  total: number;
  monthlyRecurring: number;   // For subscription products
  oneTimeCharges: number;     // For equipment/setup fees
  currency: string;           // Default: 'USD'
}
```

### TelecomProduct
```typescript
interface TelecomProduct {
  productId: string;
  name: string;
  description: string;
  category: 'plan' | 'device' | 'addon' | 'service';
  planType: 'prepaid' | 'postpaid';
  pricing: {
    monthly?: number;
    quarterly?: number;
    yearly?: number;
    oneTime?: number;
  };
  features: string[];
  compatibility: {
    requiresPlan?: boolean;
    excludesPlans?: string[];
    maxQuantity?: number;
  };
  availability: {
    regions: string[];
    customerTypes: ('individual' | 'business')[];
  };
}
```

## Error Response Format

### Standard Error Schema
```typescript
interface ApiError {
  error: {
    code: string;             // Machine-readable error code
    message: string;          // Human-readable message
    details?: Record<string, any>;  // Additional context
    timestamp: string;        // ISO timestamp
    requestId?: string;       // For tracking
  };
}
```

### Error Codes
- `CART_NOT_FOUND` - Cart ID does not exist or expired
- `CART_EXPIRED` - Cart context has expired
- `ITEM_NOT_FOUND` - Cart item does not exist
- `INVALID_PRODUCT` - Product ID is invalid or unavailable
- `INVALID_QUANTITY` - Quantity is not a positive integer
- `PLAN_INCOMPATIBLE` - Product cannot be added due to plan conflicts
- `QUANTITY_EXCEEDED` - Quantity exceeds product limits
- `VALIDATION_ERROR` - Request data validation failed
- `CONTEXT_ERROR` - Salesforce context issue
- `INTERNAL_ERROR` - Unexpected system error

### HTTP Status Code Usage
- `200` - Success with response body
- `201` - Resource created successfully
- `204` - Success with no response body
- `400` - Bad request (client error)
- `404` - Resource not found
- `409` - Conflict with current state
- `422` - Unprocessable entity (business rule violation)
- `500` - Internal server error
- `503` - Service temporarily unavailable

## Request/Response Examples

### Create Cart Example
```http
POST /api/v1/carts
Content-Type: application/json

{
  "customerId": "cust_12345",
  "customerType": "individual",
  "region": "US_WEST"
}
```

### Add Item Example
```http
POST /api/v1/carts/cart_abc123/items
Content-Type: application/json

{
  "productId": "plan_unlimited_5g",
  "quantity": 1,
  "planType": "postpaid",
  "billingCycle": "monthly",
  "features": ["international_calling", "mobile_hotspot"]
}
```

### Error Response Example
```json
{
  "error": {
    "code": "PLAN_INCOMPATIBLE",
    "message": "Prepaid plan cannot be added to cart with existing postpaid items",
    "details": {
      "conflictingItems": ["item_xyz789"],
      "suggestedAction": "Remove existing postpaid items or choose a postpaid plan"
    },
    "timestamp": "2025-10-29T10:30:00Z",
    "requestId": "req_456def"
  }
}
```

## Validation Rules

### Business Logic Validations
1. **Plan Compatibility**: Cannot mix prepaid and postpaid in same cart
2. **Quantity Limits**: Respect product-specific quantity constraints
3. **Regional Availability**: Products must be available in customer region
4. **Customer Type Restrictions**: Business-only products for business customers
5. **Feature Dependencies**: Some features require specific base plans

### Input Validations
1. **Required Fields**: All required fields must be present and non-empty
2. **Data Types**: Strict type validation for all fields
3. **String Lengths**: Reasonable limits on text fields
4. **Numeric Ranges**: Positive quantities, valid price ranges
5. **Enum Values**: Validate against allowed enum values

### Context Validations
1. **Cart Expiry**: Verify cart hasn't expired before operations
2. **Context Freshness**: Check Salesforce context validity
3. **Concurrent Modifications**: Handle race conditions gracefully