import { Cart, CartItem, CreateCartRequest, AddItemRequest, CartError, TelecomProduct } from '../models/types';

// In-memory storage
const carts = new Map<string, Cart>();
const products = new Map<string, TelecomProduct>();
let cartCounter = 1;

// Initialize some products
products.set('plan-basic', {
  productId: 'plan-basic',
  name: 'Basic Plan',
  description: 'Basic prepaid plan',
  category: 'plan',
  planType: 'prepaid',
  price: 30
});

products.set('plan-unlimited', {
  productId: 'plan-unlimited',
  name: 'Unlimited Plan',
  description: 'Unlimited postpaid plan',
  category: 'plan',
  planType: 'postpaid',
  price: 80
});

products.set('device-phone', {
  productId: 'device-phone',
  name: 'Smartphone',
  description: 'Latest smartphone',
  category: 'device',
  planType: 'postpaid',
  price: 500
});

/**
 * Telecom Cart Service - In-memory implementation
 */
export class TelecomCartService {
  
  async createCart(request: CreateCartRequest): Promise<Cart> {
    if (!request.customerId?.trim()) {
      throw new CartError('Customer ID is required', 'INVALID_CUSTOMER_ID');
    }

    const cartId = `cart_${cartCounter++}`;
    const cart: Cart = {
      cartId,
      customerId: request.customerId,
      items: [],
      total: 0,
      createdAt: new Date().toISOString()
    };

    carts.set(cartId, cart);
    return cart;
  }

  async getCart(cartId: string): Promise<Cart | null> {
    if (!cartId?.trim()) {
      throw new CartError('Cart ID is required', 'INVALID_CART_ID');
    }

    return carts.get(cartId) || null;
  }

  async addItem(cartId: string, request: AddItemRequest): Promise<Cart> {
    if (!cartId?.trim()) {
      throw new CartError('Cart ID is required', 'INVALID_CART_ID');
    }

    const cart = carts.get(cartId);
    if (!cart) {
      throw new CartError('Cart not found', 'CART_NOT_FOUND');
    }

    const product = products.get(request.productId);
    if (!product) {
      throw new CartError('Product not found', 'PRODUCT_NOT_FOUND');
    }

    // Business rule: can't mix prepaid and postpaid
    if (cart.items.length > 0) {
      const existingPlanType = cart.items[0].planType;
      if (existingPlanType !== product.planType) {
        throw new CartError(
          `Cannot mix ${existingPlanType} and ${product.planType} products`,
          'PLAN_TYPE_MISMATCH'
        );
      }
    }

    // Check if item already exists
    const existingItem = cart.items.find(item => item.productId === request.productId);
    
    if (existingItem) {
      existingItem.quantity += request.quantity;
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
    } else {
      const newItem: CartItem = {
        itemId: `item_${Date.now()}`,
        productId: request.productId,
        productName: product.name,
        quantity: request.quantity,
        planType: product.planType,
        unitPrice: product.price,
        totalPrice: product.price * request.quantity
      };
      cart.items.push(newItem);
    }

    // Update cart total
    cart.total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return cart;
  }

  async updateQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart> {
    if (!cartId?.trim()) {
      throw new CartError('Cart ID is required', 'INVALID_CART_ID');
    }

    if (!itemId?.trim()) {
      throw new CartError('Item ID is required', 'INVALID_ITEM_ID');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new CartError('Quantity must be a positive integer', 'INVALID_QUANTITY');
    }

    const cart = carts.get(cartId);
    if (!cart) {
      throw new CartError('Cart not found', 'CART_NOT_FOUND');
    }

    const item = cart.items.find(item => item.itemId === itemId);
    if (!item) {
      throw new CartError('Item not found in cart', 'ITEM_NOT_FOUND');
    }

    item.quantity = quantity;
    item.totalPrice = item.unitPrice * quantity;

    // Update cart total
    cart.total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return cart;
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    if (!cartId?.trim()) {
      throw new CartError('Cart ID is required', 'INVALID_CART_ID');
    }

    if (!itemId?.trim()) {
      throw new CartError('Item ID is required', 'INVALID_ITEM_ID');
    }

    const cart = carts.get(cartId);
    if (!cart) {
      throw new CartError('Cart not found', 'CART_NOT_FOUND');
    }

    const itemIndex = cart.items.findIndex(item => item.itemId === itemId);
    if (itemIndex === -1) {
      throw new CartError('Item not found in cart', 'ITEM_NOT_FOUND');
    }

    cart.items.splice(itemIndex, 1);

    // Update cart total
    cart.total = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return cart;
  }

  async clearCart(cartId: string): Promise<Cart> {
    if (!cartId?.trim()) {
      throw new CartError('Cart ID is required', 'INVALID_CART_ID');
    }

    const cart = carts.get(cartId);
    if (!cart) {
      throw new CartError('Cart not found', 'CART_NOT_FOUND');
    }

    cart.items = [];
    cart.total = 0;

    return cart;
  }

  // Get all products for catalog
  async getAllProducts(): Promise<TelecomProduct[]> {
    return Array.from(products.values());
  }
}