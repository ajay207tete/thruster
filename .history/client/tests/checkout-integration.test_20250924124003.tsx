/**
 * Checkout Integration Tests
 * Tests the complete checkout flow with TON payment integration
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockCartItems } from './test-utils';
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
  useLocalSearchParams: jest.fn(() => ({ cartItems: JSON.stringify(mockCartItems) })),
  router: mockRouter,
}));

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

import { useLocalSearchParams } from 'expo-router';
import CheckoutScreen from '../app/checkout';

describe('Checkout Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCartItems));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: JSON.stringify(mockCartItems) });
  });

  describe('Complete Checkout Flow', () => {
    it('should handle successful TON payment flow', async () => {
      // Mock successful order creation
      (tonService.createOrder as jest.Mock).mockResolvedValue({
        success: true,
        orderId: 12345,
        transactionHash: 'tx_test_12345',
      });

      const { getByText } = render(<CheckoutScreen />);

      // Wait for checkout to load
      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Verify cart items are displayed
      expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
      expect(getByText('Neon Sneakers')).toBeTruthy();
      expect(getByText('VR Headset')).toBeTruthy();

      // Verify total calculation
      expect(getByText('$449.96')).toBeTruthy();

      // Click the Pay with TON button
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);

      // Verify payment processing
      await waitFor(() => {
        expect(tonService.createOrder).toHaveBeenCalledWith({
          productDetails: 'Cyberpunk T-Shirt x2, Neon Sneakers x1, VR Headset x1',
          productImage: 'https://example.com/cyberpunk-shirt.jpg',
        });
      });

      // Verify success message
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Order Created',
          'Order #12345 created successfully!'
        );
      });
    });

    it('should handle payment failure gracefully', async () => {
      // Mock failed order creation
      (tonService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Insufficient contract balance',
      });

      const { getByText } = render(<CheckoutScreen />);

      // Wait for checkout to load
      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Click the Pay with TON button
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);

      // Verify error handling
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Payment Error',
          'Insufficient contract balance'
        );
      });
    });

    it('should handle network errors during payment', async () => {
      // Mock network error
      (tonService.createOrder as jest.Mock).mockRejectedValue(
        new Error('Network connection failed')
      );

      const { getByText } = render(<CheckoutScreen />);

      // Wait for checkout to load
      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Click the Pay with TON button
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);

      // Verify error handling
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Payment Error',
          'Network connection failed'
        );
      });
    });

    it('should show processing state during payment', async () => {
      // Mock slow payment processing
      (tonService.createOrder as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, orderId: 12345 }), 100))
      );

      const { getByText } = render(<CheckoutScreen />);

      // Wait for checkout to load
      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Click the Pay with TON button
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);

      // Verify processing state
      await waitFor(() => {
        expect(getByText('Processing...')).toBeTruthy();
      });

      // Verify completion
      await waitFor(() => {
        expect(getByText('💎 Pay with TON Smart Contract')).toBeTruthy(); // Button should be back
      });
    });

    it('should handle empty cart gracefully', async () => {
      // Mock empty cart
      jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: null });

      const { getByText } = render(<CheckoutScreen />);

      // Wait for empty cart message
      await waitFor(() => {
        expect(getByText('Your cart is empty.')).toBeTruthy();
        expect(getByText('Back to Cart')).toBeTruthy();
      });

      // Verify payment button is not present
      expect(() => getByText('💎 Pay with TON Smart Contract')).toThrow();
    });

    it('should handle corrupted cart data', async () => {
      // Mock corrupted cart data
      jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: 'invalid-json' });

      const { getByText } = render(<CheckoutScreen />);

      // Wait for error message
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to load cart items. Please try again.'
        );
      });
    });

    it('should calculate correct order summary', async () => {
      const { getByText } = render(<CheckoutScreen />);

      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Verify order summary calculations
      expect(getByText('Subtotal:')).toBeTruthy();
      expect(getByText('$449.96')).toBeTruthy();
      expect(getByText('Shipping:')).toBeTruthy();
      expect(getByText('$0.00')).toBeTruthy();
      expect(getByText('Total:')).toBeTruthy();
      expect(getByText('$449.96')).toBeTruthy();
    });

    it('should display product details correctly', async () => {
      const { getByText } = render(<CheckoutScreen />);

      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // Verify product details are displayed
      expect(getByText('Cyberpunk T-Shirt')).toBeTruthy();
      expect(getByText('Size:')).toBeTruthy();
      expect(getByText('M')).toBeTruthy();
      expect(getByText('Color:')).toBeTruthy();
      expect(getByText('Black')).toBeTruthy();
      expect(getByText('Quantity:')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
      expect(getByText('$59.98')).toBeTruthy(); // 29.99 * 2
    });
  });

  describe('Payment Service Integration', () => {
    it('should initialize payment service correctly', async () => {
      const { getByText } = render(<CheckoutScreen />);

      // Wait for payment service initialization
      await waitFor(() => {
        expect(getByText('💎 Pay with TON Smart Contract')).toBeTruthy();
      });

      // Verify payment button is enabled and ready
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      expect(paymentButton).toBeTruthy();
    });

    it('should handle multiple payment attempts', async () => {
      // Mock successful payment
      (tonService.createOrder as jest.Mock).mockResolvedValue({
        success: true,
        orderId: 12345,
      });

      const { getByText } = render(<CheckoutScreen />);

      await waitFor(() => {
        expect(getByText('Checkout')).toBeTruthy();
      });

      // First payment attempt
      const paymentButton = getByText('💎 Pay with TON Smart Contract');
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(tonService.createOrder).toHaveBeenCalledTimes(1);
      });

      // Second payment attempt (after success)
      fireEvent.press(paymentButton);

      await waitFor(() => {
        expect(tonService.createOrder).toHaveBeenCalledTimes(2);
      });
    });
  });
});
