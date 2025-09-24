import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckoutScreen from '../app/checkout';
import { PaymentService } from '../services/paymentService';
import { TonService } from '../services/tonService-updated';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
jest.mock('../services/paymentService');
jest.mock('../services/tonService-updated');

const mockCartItems = [
  {
    _id: '1',
    name: 'Cyberpunk T-Shirt',
    price: 29.99,
    image: 'cyberpunk-shirt.jpg',
    size: 'M',
    color: 'Black',
    quantity: 2,
  },
  {
    _id: '2',
    name: 'Neon Sneakers',
    price: 89.99,
    image: 'neon-sneakers.jpg',
    size: 'M',
    color: 'Black',
    quantity: 1,
  },
  {
    _id: '3',
    name: 'VR Headset',
    price: 299.99,
    image: 'vr-headset.jpg',
    size: 'M',
    color: 'Black',
    quantity: 1,
  },
];

describe('CheckoutScreen Component Tests', () => {
  let mockPaymentService: jest.Mocked<PaymentService>;
  let mockTonService: jest.Mocked<TonService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCartItems));

    // Mock PaymentService
    mockPaymentService = {
      initialize: jest.fn().mockResolvedValue({ success: true }),
      createOrder: jest.fn().mockResolvedValue({ success: true, orderId: '12345' }),
      checkPaymentStatus: jest.fn().mockResolvedValue({ paid: true }),
    } as any;

    (PaymentService as jest.Mock).mockImplementation(() => mockPaymentService);

    // Mock TonService
    mockTonService = {
      createOrder: jest.fn().mockResolvedValue({ success: true, orderId: 12345 }),
      checkPaymentStatus: jest.fn().mockResolvedValue({ orderId: 12345, isPaid: true }),
      getContractBalance: jest.fn().mockResolvedValue(1000),
    } as any;

    (TonService as jest.Mock).mockImplementation(() => mockTonService);
  });

  it('should render checkout page with cart items', async () => {
    const { getByText } = render(<CheckoutScreen />);

    // Wait for cart items to load
    await waitFor(() => {
      expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
    });

    // Verify product details are displayed correctly
    expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
    expect(getByText('Neon Sneakers')).toBeTruthy();
    expect(getByText('VR Headset')).toBeTruthy();

    // Verify prices are displayed
    expect(getByText('$29.99')).toBeTruthy();
    expect(getByText('$89.99')).toBeTruthy();
    expect(getByText('$299.99')).toBeTruthy();

    // Verify quantities
    expect(getByText('Quantity: 2')).toBeTruthy();
    expect(getByText('Quantity: 1')).toBeTruthy();
  });

  it('should calculate order summary correctly', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
    });

    // Verify order summary calculations
    expect(getByText('Subtotal:')).toBeTruthy();
    expect(getByText('$449.96')).toBeTruthy(); // (29.99 * 2) + 89.99 + 299.99
    expect(getByText('Shipping:')).toBeTruthy();
    expect(getByText('$0.00')).toBeTruthy();
    expect(getByText('Total:')).toBeTruthy();
    expect(getByText('$449.96')).toBeTruthy();
  });

  it('should handle successful payment flow', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('💎 Pay with TON Smart Contract')).toBeTruthy();
    });

    // Mock successful payment
    mockTonService.createOrder.mockResolvedValue({ success: true, orderId: 12345 });

    // Click the payment button
    fireEvent.press(getByText('💎 Pay with TON Smart Contract'));

    // Verify payment service methods were called
    await waitFor(() => {
      expect(mockTonService.createOrder).toHaveBeenCalled();
    });
  });

  it('should handle payment failure gracefully', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('💎 Pay with TON Smart Contract')).toBeTruthy();
    });

    // Mock payment failure
    mockTonService.createOrder.mockRejectedValue(new Error('Payment failed'));

    // Click the payment button
    fireEvent.press(getByText('💎 Pay with TON Smart Contract'));

    // Verify error handling
    await waitFor(() => {
      expect(mockTonService.createOrder).toHaveBeenCalled();
    });
  });

  it('should handle empty cart gracefully', async () => {
    // Mock empty cart
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Your cart is empty.')).toBeTruthy();
    });

    expect(getByText('Back to Cart')).toBeTruthy();
  });

  it('should handle corrupted cart data', async () => {
    // Mock corrupted cart data
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Your cart is empty.')).toBeTruthy();
    });
  });
});
