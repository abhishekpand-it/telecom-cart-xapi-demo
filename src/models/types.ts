// Types for the telecom cart system

export type PlanType = 'prepaid' | 'postpaid';
export type ProductCategory = 'plan' | 'device' | 'addon';

export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  planType: PlanType;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  cartId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
}

export interface TelecomProduct {
  productId: string;
  name: string;
  description: string;
  category: ProductCategory;
  planType: PlanType;
  price: number;
}

// Request/Response DTOs
export interface CreateCartRequest {
  customerId: string;
}

export interface AddItemRequest {
  productId: string;
  quantity: number;
}

// Error class for cart operations
export class CartError extends Error {
  constructor(message: string, public code: string = 'CART_ERROR') {
    super(message);
    this.name = 'CartError';
  }
}