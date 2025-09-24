/**
 * Checkout Page Component Tests - Final Fixed Version
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
  useLocalSearchParams: jest.fn(() => ({ cartItems: JSON.stringify(mockCartItems) })),
  router: mockRouter,
}));

// Mock useFocusEffect
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}));

import { useLocalSearchParams } from 'expo-router';
import CheckoutScreen from '../app/checkout';

describe('CheckoutScreen Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCartItems));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    // Mock useLocalSearchParams to return cart items
    jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: JSON.stringify(mockCartItems) });
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
    const { getAllByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      const totalElements = getAllByText('$449.96');
      expect(totalElements.length).toBeGreaterThan(0); // (29.99 * 2) + 89.99 + 299.99
    });
  });

  it('should show smart contract information', async () => {
    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('💎 Pay with TON Smart Contract')).toBeTruthy();
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
        productImage: 'https://example.com/cyberpunk-shirt.jpg',
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
        'Order #12345 created successfully!'
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
        'Contract execution failed'
      );
    });
  });

  it('should handle empty cart', async () => {
    // Mock empty cart
    jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: JSON.stringify([]) });

    const { getByText } = render(<CheckoutScreen />);

    await waitFor(() => {
      expect(getByText('Your cart is empty.')).toBeTruthy();
      expect(getByText('Back to Cart')).toBeTruthy();
    });
  });

  it('should show empty cart state initially', () => {
    // Mock empty cart for loading test
    jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: JSON.stringify([]) });

    const { getByText } = render(<CheckoutScreen />);

    // When cart is empty, it shows empty state instead of loading
    expect(getByText('Your cart is empty.')).toBeTruthy();
  });

  it('should handle AsyncStorage errors', async () => {
    jest.mocked(useLocalSearchParams).mockReturnValue({ cartItems: 'invalid-json' });

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

  it('should handle multiple payment attempts correctly', async () => {
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

    // After successful payment, cart should be cleared and show empty state
    await waitFor(() => {
      expect(getByText('Your cart is empty.')).toBeTruthy();
    });

    // Verify only one payment attempt was made (cart is now empty, no more payments possible)
    expect(tonService.createOrder).toHaveBeenCalledTimes(1);
  });
});
