import { TelecomCartService } from '../src/services/cart-service';
import { CreateCartRequest, AddItemRequest } from '../src/models/types';

describe('TelecomCartService', () => {
  let cartService: TelecomCartService;

  beforeEach(() => {
    cartService = new TelecomCartService();
  });

  describe('createCart', () => {
    it('should create a new cart with valid customer ID', async () => {
      const request: CreateCartRequest = { customerId: 'test-customer' };
      const cart = await cartService.createCart(request);

      expect(cart.cartId).toMatch(/^cart_\d+$/);
      expect(cart.customerId).toBe('test-customer');
      expect(cart.items).toEqual([]);
      expect(cart.total).toBe(0);
      expect(cart.createdAt).toBeDefined();
    });

    it('should throw error for empty customer ID', async () => {
      const request: CreateCartRequest = { customerId: '' };
      
      await expect(cartService.createCart(request))
        .rejects
        .toThrow('Customer ID is required');
    });
  });

  describe('addItem', () => {
    it('should add item to cart successfully', async () => {
      // Create cart first
      const cart = await cartService.createCart({ customerId: 'test-customer' });
      
      // Add item
      const addRequest: AddItemRequest = { productId: 'plan-basic', quantity: 1 };
      const updatedCart = await cartService.addItem(cart.cartId, addRequest);

      expect(updatedCart.items).toHaveLength(1);
      expect(updatedCart.items[0].productId).toBe('plan-basic');
      expect(updatedCart.items[0].quantity).toBe(1);
      expect(updatedCart.total).toBe(30);
    });

    it('should prevent mixing prepaid and postpaid products', async () => {
      // Create cart and add prepaid plan
      const cart = await cartService.createCart({ customerId: 'test-customer' });
      await cartService.addItem(cart.cartId, { productId: 'plan-basic', quantity: 1 });

      // Try to add postpaid device - should fail
      await expect(cartService.addItem(cart.cartId, { productId: 'device-phone', quantity: 1 }))
        .rejects
        .toThrow('Cannot mix prepaid and postpaid products');
    });
  });

  describe('getAllProducts', () => {
    it('should return all available products', async () => {
      const products = await cartService.getAllProducts();
      
      expect(products).toHaveLength(3);
      expect(products.map(p => p.productId)).toEqual([
        'plan-basic',
        'plan-unlimited', 
        'device-phone'
      ]);
    });
  });
});