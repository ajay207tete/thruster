/**
 * Test Utilities for Shopping Flow and Smart Contract Testing
 * Provides mock data, helper functions, and test utilities
 */

import { Product } from '../app/(tabs)/shop';
import { TonContractConfig, OrderData } from '../services/tonService-updated';

// Mock product data for testing
export const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Cyberpunk T-Shirt',
    price: 29.99,
    description: 'A stylish cyberpunk-themed t-shirt',
    image: 'https://example.com/cyberpunk-shirt.jpg',
    category: 'clothing',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Neon Green', 'Purple'],
    stock: 10,
    quantity: 1,
    size: 'M',
    color: 'Black',
  },
  {
    _id: '2',
    name: 'Neon Sneakers',
    price: 89.99,
    description: 'High-tech sneakers with LED lights',
    image: 'https://example.com/neon-sneakers.jpg',
    category: 'footwear',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White', 'Neon Blue'],
    stock: 5,
    quantity: 1,
    size: 'M',
    color: 'Black',
  },
  {
    _id: '3',
    name: 'VR Headset',
    price: 299.99,
    description: 'Immersive virtual reality headset',
    image: 'https://example.com/vr-headset.jpg',
    category: 'electronics',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    stock: 3,
    quantity: 1,
    size: 'M',
    color: 'Black',
  },
];

// Mock cart items for testing
export const mockCartItems: Product[] = [
  {
    ...mockProducts[0],
    quantity: 2,
  },
  {
    ...mockProducts[1],
    quantity: 1,
  },
  {
    ...mockProducts[2],
    quantity: 1,
  },
];

// Mock order data for testing
export const mockOrderData: OrderData = {
  productDetails: 'Cyberpunk T-Shirt (Size: M, Color: Black, Qty: 2); Neon Sneakers (Size: 9, Color: Black, Qty: 1)',
  productImage: 'https://example.com/cyberpunk-shirt.jpg',
};

// Mock TON contract configuration
export const mockTonConfig: TonContractConfig = {
  address: '0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS',
  network: 'testnet',
  endpoint: 'https://testnet.toncenter.com/api/v2',
};

// Test helper functions
export const createMockCartItem = (overrides: Partial<Product> = {}): Product => ({
  _id: 'test-id',
  name: 'Test Product',
  price: 19.99,
  description: 'Test description',
  image: 'https://example.com/test.jpg',
  category: 'test',
  sizes: ['S', 'M', 'L'],
  colors: ['Black', 'White'],
  stock: 10,
  quantity: 1,
  size: 'M',
  color: 'Black',
  ...overrides,
});

export const createMockOrderData = (overrides: Partial<OrderData> = {}): OrderData => ({
  productDetails: 'Test Product (Size: M, Color: Black, Qty: 1)',
  productImage: 'https://example.com/test.jpg',
  ...overrides,
});

export const calculateCartTotal = (cartItems: Product[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 0)), 0);
};

export const calculateTotal = (cartItems: Product[]): number => {
  return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 0)), 0);
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const validateCartItems = (cartItems: Product[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  cartItems.forEach((item, index) => {
    if (!item.price || item.price <= 0) {
      errors.push(`Invalid price detected`);
    }
    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Invalid quantity detected`);
    }
    if (!item.name || !item._id) {
      errors.push(`Missing required fields`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const formatProductDetails = (items: Product[]): string => {
  return items.map(item =>
    `${item.name} (Size: ${item.size}, Color: ${item.color}, Qty: ${item.quantity})`
  ).join('; ');
};

// Test data generators
export const generateRandomOrderId = (): number => {
  return Math.floor(Math.random() * 1000000) + 1;
};

export const generateRandomTransactionHash = (): string => {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMockCartItems = (count: number): Product[] => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `item_${i + 1}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 100) + 10,
    description: `Description for product ${i + 1}`,
    image: `https://example.com/product${i + 1}.jpg`,
    category: 'test',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'White'],
    stock: Math.floor(Math.random() * 20) + 1,
    quantity: Math.floor(Math.random() * 3) + 1,
    size: 'M',
    color: 'Black',
  }));
};

// AsyncStorage mock helpers
export const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

export const setupAsyncStorageMock = () => {
  mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCartItems));
  mockAsyncStorage.setItem.mockResolvedValue(undefined);
  mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  mockAsyncStorage.clear.mockResolvedValue(undefined);
};

export const resetAsyncStorageMock = () => {
  jest.clearAllMocks();
  setupAsyncStorageMock();
};

// TON service mock helpers
export const mockTonService = {
  createOrder: jest.fn(),
  checkPaymentStatus: jest.fn(),
  getContractBalance: jest.fn(),
  withdrawFunds: jest.fn(),
  getAllOrders: jest.fn(),
};

export const setupTonServiceMock = () => {
  mockTonService.createOrder.mockResolvedValue({
    success: true,
    orderId: generateRandomOrderId(),
  });

  mockTonService.checkPaymentStatus.mockResolvedValue({
    orderId: 12345,
    isPaid: Math.random() > 0.5,
    transactionHash: generateRandomTransactionHash(),
  });

  mockTonService.getContractBalance.mockResolvedValue(
    (Math.random() * 1000).toFixed(2)
  );

  mockTonService.withdrawFunds.mockResolvedValue({
    success: true,
    transactionHash: generateRandomTransactionHash(),
  });

  mockTonService.getAllOrders.mockResolvedValue([]);
};

export const resetTonServiceMock = () => {
  jest.clearAllMocks();
  setupTonServiceMock();
};

// Alert mock helper
export const mockAlert = jest.fn();
export const setupAlertMock = () => {
  (global as any).Alert = { alert: mockAlert };
  mockAlert.mockClear();
};

// Router mock helper
export const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
};

export const setupRouterMock = () => {
  jest.clearAllMocks();
};

// Test timeout helpers
export const TEST_TIMEOUT = {
  short: 1000,
  medium: 5000,
  long: 10000,
};

export const waitForAsync = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Error simulation helpers
export const simulateNetworkError = (message: string = 'Network error') => {
  return new Error(message);
};

export const simulateTimeoutError = (message: string = 'Timeout') => {
  return new Error(message);
};

export const simulateContractError = (message: string = 'Contract execution failed') => {
  return new Error(message);
};

// Performance testing helpers
export const measurePerformance = async (operation: () => Promise<any>): Promise<number> => {
  const startTime = Date.now();
  await operation();
  const endTime = Date.now();
  return endTime - startTime;
};

export const expectPerformance = async (
  operation: () => Promise<any>,
  maxDuration: number
): Promise<void> => {
  const duration = await measurePerformance(operation);
  expect(duration).toBeLessThan(maxDuration);
};
