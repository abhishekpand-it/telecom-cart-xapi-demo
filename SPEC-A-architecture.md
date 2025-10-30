# SPEC-A: Architecture & Abstractions

## Overview
Design a thin Experience API layer that provides a simplified, domain-focused interface for telecom cart operations while abstracting away Salesforce cart complexities. The system should be stateless, resilient to context expiry, and optimized for telecom use cases.

## Key Architecture Principles

### 1. Layered Architecture
```
┌─────────────────────────────────────┐
│        HTTP API Layer              │  <- Express endpoints
├─────────────────────────────────────┤
│     Experience API Service         │  <- Business logic & orchestration
├─────────────────────────────────────┤
│      Domain Models & Types         │  <- Core entities & validation
├─────────────────────────────────────┤
│    Salesforce Integration Layer    │  <- Cart operations & context mgmt
└─────────────────────────────────────┘
```

### 2. Core Abstractions

#### CartService (Experience API)
- **Purpose**: Main orchestration layer for cart operations
- **Responsibilities**: 
  - Transform telecom domain requests to Salesforce operations
  - Handle context expiry gracefully with retry logic
  - Aggregate and enrich cart data for telecom-specific needs
  - Validate business rules (plan compatibility, bundle constraints)

#### SalesforceCartClient (Integration Layer)
- **Purpose**: Abstract Salesforce cart operations and context management
- **Key Methods**:
  - `createCart(customerId: string): Promise<Cart>`
  - `getCart(cartId: string): Promise<Cart | null>`
  - `addItem(cartId: string, item: CartItem): Promise<Cart>`
  - `removeItem(cartId: string, itemId: string): Promise<Cart>`
  - `updateQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart>`
  - `validateContext(cartId: string): Promise<boolean>`

#### Domain Models
- **Cart**: Container for telecom products with metadata
- **CartItem**: Individual product line with quantity and telecom-specific attributes
- **TelecomProduct**: Product representation with plan types, billing cycles
- **SalesforceContext**: Manages session state and expiry

### 3. Context Management Strategy

#### Context Expiry Handling
- **Detection**: Check context validity before operations
- **Recovery**: Automatic context recreation for expired sessions
- **Caching**: In-memory context cache with TTL
- **Fallback**: Graceful degradation when context cannot be restored

#### Session Strategy
```typescript
interface SessionManager {
  isContextValid(cartId: string): Promise<boolean>
  refreshContext(cartId: string): Promise<void>
  invalidateContext(cartId: string): void
}
```

### 4. Error Handling Strategy

#### Error Categories
1. **Validation Errors**: Invalid requests, business rule violations
2. **Context Errors**: Expired sessions, invalid cart states
3. **Integration Errors**: Salesforce communication issues
4. **System Errors**: Unexpected failures, timeouts

#### Error Response Format
```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  retryable: boolean
}
```

### 5. Data Flow Patterns

#### Telecom-Specific Enrichment
- Add plan compatibility validation
- Calculate bundle discounts
- Enrich with billing cycle information
- Add regulatory compliance flags

#### Request/Response Transformation
- Transform generic Salesforce cart format to telecom-optimized structure
- Add computed fields (total monthly cost, contract duration)
- Filter sensitive Salesforce internal fields

### 6. Performance Considerations

#### In-Memory Optimizations
- Context cache with TTL-based expiry
- Product catalog cache for validation
- Cart state caching for recent operations

#### Async Operations
- Non-blocking cart operations where possible
- Background context refresh
- Batch operations for multiple items

### 7. Testing Strategy

#### Test Doubles
- **SalesforceCartClient**: Mock with configurable delays and failures
- **Context Expiry Simulation**: Programmable expiry scenarios
- **Network Failure Simulation**: Timeout and connection error testing

#### Critical Test Scenarios
- Context expiry during operations
- Concurrent cart modifications
- Validation of telecom business rules
- Error recovery and retry logic

### 8. Configuration & Environment

#### Environment Variables
- `SALESFORCE_TIMEOUT`: Request timeout (default: 5000ms)
- `CONTEXT_TTL`: Context cache TTL (default: 30 minutes)
- `MAX_RETRY_ATTEMPTS`: Context refresh retries (default: 3)
- `CART_CACHE_SIZE`: Max cached carts (default: 1000)

### 9. Implementation Guidelines

#### Code Organization
```
src/
├── models/           # Domain entities and types
├── services/         # Business logic layer
├── clients/          # External integrations
├── controllers/      # HTTP request handlers
├── middleware/       # Cross-cutting concerns
└── utils/           # Shared utilities
```

#### Key Design Patterns
- **Repository Pattern**: For cart data access
- **Adapter Pattern**: For Salesforce integration
- **Decorator Pattern**: For context validation
- **Strategy Pattern**: For different product types

### 10. Scalability Considerations

#### Horizontal Scaling
- Stateless design enables load balancing
- Context stored in external cache if needed
- No shared mutable state

#### Resource Management
- Connection pooling for Salesforce calls
- Memory-efficient cart representation
- Garbage collection friendly object lifecycle