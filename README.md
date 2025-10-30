# Telecom Cart Experience API

A thin Experience API that powers telecom cart operations on top of a non-persistent Salesforce cart context. This project demonstrates a clean architecture approach with proper abstraction layers, comprehensive error handling, and telecom-specific business logic.

## Architecture Overview

The system follows a layered architecture pattern:

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

### Key Features

- **Context Management**: Handles Salesforce cart context expiry with automatic refresh
- **Telecom Business Rules**: Plan compatibility validation, quantity limits, regional availability
- **Error Resilience**: Comprehensive error handling with retry logic for context issues
- **Type Safety**: Full TypeScript implementation with strict typing
- **Test Coverage**: Comprehensive unit tests for critical paths
- **Performance**: In-memory caching and optimized request handling

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- TypeScript (installed as dev dependency)

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone https://github.com/abhishekpand-it/telecom-cart-xapi-demo.git
cd telecom-cart-xapi-demo
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Test the API:**
Visit `http://localhost:3000/api/v1` for API documentation
Or run the demo script: `.\demo.ps1` (Windows) or `./demo.sh` (Unix)

4. **Run tests:**
```bash
npm test
```

5. **Run tests with coverage:**
```bash
npm run test:coverage
```

### Production Build

```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`

### Quick API Test

Once the server is running (`npm run dev`), you can test these endpoints:

- **API Documentation:** `GET http://localhost:3000/`
- **Products:** `GET http://localhost:3000/api/products`
- **Create Cart:** `POST http://localhost:3000/api/carts`

**Example using PowerShell:**
```powershell
# Create a cart
$cartData = @{customerId="test123"} | ConvertTo-Json
$cart = Invoke-RestMethod -Uri "http://localhost:3000/api/carts" -Method Post -Body $cartData -ContentType "application/json"

# Add an item
$itemData = @{productId="plan-basic"; quantity=1} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/cart/$($cart.cartId)/items" -Method Post -Body $itemData -ContentType "application/json"
```

**Example using curl:**
```bash
# Create a cart
curl -X POST http://localhost:3000/api/carts \
  -H "Content-Type: application/json" \
  -d '{"customerId":"test123"}'

# Add an item  
curl -X POST http://localhost:3000/api/cart/{cartId}/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"plan-basic","quantity":1}'
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### API Documentation
```
GET /
```

#### Cart Operations

**Create Cart:**
```http
POST /carts
Content-Type: application/json

{
  "customerId": "cust_12345"
}
```

**Get Cart:**
```http
GET /cart/{cartId}
```

**Add Item:**
```http
POST /cart/{cartId}/items
Content-Type: application/json

{
  "productId": "plan-basic",
  "quantity": 1
}
```

**Update Quantity:**
```http
PUT /cart/{cartId}/items/{itemId}
Content-Type: application/json

{
  "quantity": 3
}
```

**Remove Item:**
```http
DELETE /cart/{cartId}/items/{itemId}
```

**Clear Cart:**
```http
DELETE /cart/{cartId}
```

#### Product Catalog

**Get Products:**
```http
GET /products
```

### Sample Response

```json
{
  "cartId": "cart_12345",
  "customerId": "cust_12345",
  "items": [
    {
      "itemId": "item_1",
      "productId": "plan-basic",
      "productName": "Basic Plan",
      "quantity": 1,
      "unitPrice": 30,
      "totalPrice": 30,
      "addedAt": "2025-10-29T10:30:00.000Z"
    }
  ],
  "total": 30,
  "createdAt": "2025-10-29T10:25:00.000Z",
  "updatedAt": "2025-10-29T10:30:00.000Z"
}
```

## Business Rules

### Plan Compatibility
- **Cannot mix prepaid and postpaid plans** in the same cart
- Some products have **exclusion rules** (e.g., family plans exclude individual plans)
- **Quantity limits** per product type

### Product Dependencies
- **Devices require a base plan** before they can be added
- **Add-ons require compatible base plans**
- **Regional availability** restrictions

### Context Management
- Cart contexts **expire after 30 minutes**
- **Automatic context refresh** on expiry detection
- **Graceful degradation** when context cannot be restored

## Project Structure

```
src/
├── models/
│   ├── types.ts              # Core domain types and interfaces
│   └── cart-utils.ts         # Cart calculation and validation utilities
├── services/
│   └── cart-service.ts       # Main business logic orchestration
├── clients/
│   ├── salesforce-client.ts  # Mock Salesforce integration
│   └── product-catalog.ts    # Product catalog with sample data
├── controllers/
│   └── api-controllers.ts    # HTTP request handlers and middleware
├── app.ts                    # Express application setup
└── index.ts                  # Main exports

tests/
├── cart-service.test.ts      # Business logic tests
├── salesforce-client.test.ts # Integration layer tests
├── api-endpoints.test.ts     # API endpoint tests
└── setup.ts                  # Test configuration
```

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Categories

1. **Unit Tests**: Core business logic and validation
2. **Integration Tests**: Salesforce client behavior and context management
3. **API Tests**: HTTP endpoints and error handling
4. **Edge Cases**: Context expiry, concurrent operations, validation boundaries

### Coverage Goals
- **Business Logic**: >95% coverage
- **API Endpoints**: >90% coverage
- **Error Scenarios**: All critical error paths tested

## Key Design Decisions

### 1. **Mock Salesforce Client**
- **Realistic behavior** including context expiry simulation
- **Configurable failure rates** for resilience testing
- **In-memory state management** for development and testing

### 2. **Stateless API Design**
- No server-side session storage
- **Cart state managed by Salesforce** (simulated)
- **Context caching** with TTL for performance

### 3. **Error Handling Strategy**
- **Typed error classes** for different error categories
- **Automatic retry logic** for context expiry
- **Detailed error responses** with troubleshooting information

### 4. **Telecom Domain Modeling**
- **Plan type validation** (prepaid vs postpaid)
- **Billing cycle calculations** (monthly, quarterly, yearly)
- **Regional availability** and customer type restrictions

### 5. **Performance Optimizations**
- **Request caching** for frequently accessed data
- **Batch operations** where applicable
- **Minimal Salesforce API calls** through smart caching

## Configuration

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development        # Environment mode
SALESFORCE_TIMEOUT=5000     # Request timeout in ms
CONTEXT_TTL=30             # Context TTL in minutes
MAX_RETRY_ATTEMPTS=3       # Max context refresh retries
```

### Mock Client Configuration

The Salesforce mock client can be configured for testing:

```typescript
const client = new MockSalesforceCartClient({
  contextTtlMinutes: 30,     // Context expiry time
  simulateFailures: false,   // Enable failure simulation
  failureRate: 0.1,         // 10% failure rate
  responseDelayMs: 100       // Simulate network latency
});
```

## Known Limitations

### Current Scope
1. **No persistent storage** - All data is in-memory
2. **Single-tenant design** - No multi-tenancy support
3. **Basic tax calculation** - Simplified 8% flat rate
4. **No authentication** - Public API for demo purposes
5. **Limited product catalog** - Sample telecom products only

### Production Considerations

#### For Real-World Deployment:
1. **Add persistent storage** (Redis/Database) for cart state
2. **Implement authentication/authorization** (OAuth 2.0, JWT)
3. **Add rate limiting** and request throttling
4. **Integrate with real Salesforce API** using proper SDK
5. **Add monitoring and observability** (metrics, logging, tracing)
6. **Implement proper tax calculation** with tax service integration
7. **Add input sanitization** and security hardening
8. **Support horizontal scaling** with load balancing

#### Performance Enhancements:
1. **Connection pooling** for external API calls
2. **Response compression** (gzip)
3. **CDN integration** for static resources
4. **Background job processing** for heavy operations

#### Operational Requirements:
1. **Health checks and readiness probes** for Kubernetes
2. **Graceful shutdown handling**
3. **Configuration management** (environment-specific configs)
4. **Secret management** for API keys and credentials

## Development

### Code Style
- **ESLint** configuration for consistent code style
- **Prettier** integration for code formatting
- **TypeScript strict mode** for type safety

### Git Workflow
- **Feature branches** for new development
- **Pull request reviews** required
- **Automated testing** on CI/CD pipeline

### Debugging
```bash
# Start with debug mode
DEBUG=* npm run dev

# TypeScript compilation in watch mode
npm run build -- --watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details