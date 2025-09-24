 /**
 * Checkout Page Component Tests
 * Tests the checkout page functionality and smart contract integration
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockCartItems, mockTonConfig } from './test-utils';
import { tonService } from '../services/tonService-updated';

// Mock the TON service
jest.mock('../services/tonService-updated', () => ({
  tonService: {
    createOrder: jest.fn(),
    checkPaymentStatus: jest.fn(),
    getContractBalance: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock router
const mockRouter = {
  back: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  router: mockRouter,
}));

import CheckoutScreen from '../app/checkout';

describe('CheckoutScreen Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCartItems));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render checkout page with cart items', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Checkout')).toBeTruthy();
      expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
      expect(getByText('Neon Sneakers')).toBeTruthy();
      expect(getByText('VR Headset')).toBeTruthy();
    });
  });

  it('should display correct total price', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('$449.96')).toBeTruthy(); // (29.99 * 2) + 89.99 + 299.99
    });
  });

  it('should show smart contract information', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('💎 TON Smart Contract Payment')).toBeTruthy();
      expect(getByText(/0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS/)).toBeTruthy();
      expect(getByText('testnet')).toBeTruthy();
    });
  });

  it('should handle payment button press', async () => {
    (tonService.createOrder as jest.Mock).mockResolvedValue({
      success: true,
      orderId: 12345,
    });

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);
    });

    // Should process payment directly
    await waitFor(() => {
      expect(tonService.createOrder).toHaveBeenCalledWith({
        productDetails: 'Cyberpunk T-Shirt x2, Neon Sneakers x1, VR Headset x1',
        productImage: 'https://example.com/default.jpg',
      });
    });
  });

  it('should process successful payment', async () => {
    (tonService.createOrder as jest.Mock).mockResolvedValue({
      success: true,
      orderId: 12345,
    });

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);
    });

    // Should show success message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Order Created',
        expect.stringContaining('Order #12345'),
        expect.any(Array)
      );
    });
  });

  it('should handle payment failure', async () => {
    (tonService.createOrder as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Contract execution failed',
    });

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);
    });

    // Should show error message
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Payment Error',
        expect.stringContaining('Contract execution failed'),
        expect.any(Array)
      );
    });
  });

  it('should handle empty cart', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Your cart is empty.')).toBeTruthy();
      expect(getByText('Back to Cart')).toBeTruthy();
    });
  });

  it('should show loading state initially', () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByText } = render(<CheckoutScreen />);

    expect(getByText('Loading cart items...')).toBeTruthy();
  });

  it('should handle AsyncStorage errors', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load cart items. Please try again.'
      );
    });
  });

  it('should disable payment button during processing', async () => {
    (tonService.createOrder as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);
    });

    // Button should show "Processing..." state
    await waitFor(() => {
      expect(getByText('Processing...')).toBeTruthy();
    });
  });
});
