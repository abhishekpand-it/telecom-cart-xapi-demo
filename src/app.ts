import express from 'express';
import { TelecomCartService } from './services/cart-service';
import { CreateCartRequest, AddItemRequest } from './models/types';

const app = express();
const cartService = new TelecomCartService();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Cart creation endpoint
app.post('/api/carts', async (req, res) => {
  try {
    const request: CreateCartRequest = req.body;
    const cart = await cartService.createCart(request);
    res.status(201).json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message, code: error.code });
  }
});

// Cart endpoints
app.get('/api/cart/:cartId', async (req, res) => {
  try {
    const cart = await cartService.getCart(req.params.cartId);
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

app.post('/api/cart/:cartId/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body as AddItemRequest;
    
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const cart = await cartService.addItem(req.params.cartId, { productId, quantity });
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/cart/:cartId/items/:itemId', async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const cart = await cartService.removeItem(cartId, itemId);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.put('/api/cart/:cartId/items/:itemId', async (req, res) => {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({ error: 'Valid quantity is required' });
      return;
    }

    const cart = await cartService.updateQuantity(cartId, itemId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.delete('/api/cart/:cartId', async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.params.cartId);
    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Product endpoints
app.get('/api/products', async (req, res) => {
  try {
    const products = await cartService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Telecom Cart API',
    endpoints: {
      'GET /api/cart/:cartId': 'Get cart',
      'POST /api/cart/:cartId/items': 'Add item to cart',
      'DELETE /api/cart/:cartId/items/:itemId': 'Remove item from cart',
      'PUT /api/cart/:cartId/items/:itemId': 'Update item quantity',
      'DELETE /api/cart/:cartId': 'Clear cart',
      'GET /api/products': 'Get all products'
    },
    businessRules: [
      'Cannot mix prepaid and postpaid products in the same cart'
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Telecom Cart API running on port ${PORT}`);
});