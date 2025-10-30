# SPEC-B: API Endpoint Contracts

## Overview
RESTful API endpoints for telecom cart operations with comprehensive error handling, validation, and telecom-specific business logic. All endpoints return JSON and follow consistent error response patterns.

## Base Configuration
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Authentication**: None (demo purposes)

## Core Endpoints

### 0. API Documentation
**Get API endpoint documentation**

```
GET /
```

**Success Response (200):**
```typescript
{
  message: string;
  endpoints: Record<string, string>;
  businessRules: string[];
}
```

### 1. Create Cart
**Create a new cart for a customer**

```
POST /carts
```

**Request Body:**
```typescript
interface CreateCartRequest {
  customerId: string;           // Customer identifier (required)
}
```

**Success Response (201):**
```typescript
interface CartResponse {
  cartId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  createdAt: string;           // ISO timestamp
  updatedAt: string;           // ISO timestamp
}
```

**Error Responses:**
- `400` - Invalid customer ID or request format
- `500` - Internal server error

---

### 2. Get Cart
**Retrieve cart details**

```
GET /cart/{cartId}
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
POST /cart/{cartId}/items
```

**Request Body:**
```typescript
interface AddItemRequest {
  productId: string;          // Telecom product identifier (required)
  quantity?: number;          // Must be > 0, defaults to 1
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
PUT /cart/{cartId}/items/{itemId}
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
DELETE /cart/{cartId}/items/{itemId}
```

**Success Response (200):**
```typescript
// Returns updated CartResponse
```

**Error Responses:**
- `404` - Cart or item not found
- `500` - Internal server error

---

### 6. Clear Cart
**Remove all items from cart**

```
DELETE /cart/{cartId}
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

**Success Response (200):**
```typescript
// Returns array of TelecomProduct objects
TelecomProduct[]
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
  unitPrice: number;
  totalPrice: number;
  addedAt: string;            // ISO timestamp
}
```

### TelecomProduct
```typescript
interface TelecomProduct {
  productId: string;
  name: string;
  description: string;
  price: number;
  type: 'prepaid' | 'postpaid';
}
```

## Error Response Format

### Standard Error Schema
```typescript
interface ApiError {
  error: string;              // Human-readable error message
  code?: string;              // Optional error code for specific errors
}
```

### Error Messages
- Cart creation: "Customer ID is required"
- Cart operations: "Cart not found" 
- Item operations: "Product not found", "Invalid quantity"
- Business rules: "Cannot mix prepaid and postpaid products"

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
POST /api/carts
Content-Type: application/json

{
  "customerId": "cust_12345"
}
```

### Add Item Example
```http
POST /api/cart/cart_12345/items
Content-Type: application/json

{
  "productId": "plan-basic",
  "quantity": 1
}
```

### Error Response Example
```json
{
  "error": "Cannot mix prepaid and postpaid products"
}
```

## Validation Rules

### Business Logic Validations
1. **Plan Compatibility**: Cannot mix prepaid and postpaid products in same cart
2. **Product Existence**: Validate product IDs against available catalog
3. **Quantity Validation**: Must be positive numbers

### Input Validations
1. **Required Fields**: Customer ID is required for cart creation
2. **Data Types**: Strict type validation for all fields
3. **Numeric Ranges**: Positive quantities only