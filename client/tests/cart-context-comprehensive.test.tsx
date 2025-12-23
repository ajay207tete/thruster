import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { CartProvider, useCart } from '../contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test component that uses the cart context
const TestComponent: React.FC = () => {
  const { state, addToCart, updateCartItem, removeFromCart, clearCart, refreshCart } = useCart();

  return (
    <View>
      <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
      <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
      <Text testID="cart-error">{state.error || 'null'}</Text>
      <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
      <TouchableOpacity
        testID="add-item"
        onPress={() => addToCart('product1', 2, 'M', 'Red')}
      >
        <Text>Add Item</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="update-item"
        onPress={() => updateCartItem('item_123', 5)}
      >
        <Text>Update Item</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="remove-item"
        onPress={() => removeFromCart('item_123')}
      >
        <Text>Remove Item</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="clear-cart"
        onPress={() => clearCart()}
      >
        <Text>Clear Cart</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="refresh-cart"
        onPress={() => refreshCart()}
      >
        <Text>Refresh Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('CartContext Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  describe('Initialization', () => {
    it('should initialize with empty cart when no local storage data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
        expect(getByTestId('cart-loading').props.children).toBe('false');
        expect(getByTestId('cart-error').props.children).toBe('null');
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData).toBeDefined();
        expect(cartData).not.toBeNull();
      });

      const cartData = JSON.parse(getByTestId('cart-data').props.children);
      expect(cartData).toEqual({
        _id: 'local',
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: expect.any(String)
      });
      expect(getByTestId('cart-loading').props.children).toBe('false');
      expect(getByTestId('cart-initialized').props.children).toBe('true');
    });

    it('should initialize with cart data from local storage', async () => {
      const storedCart = {
        _id: 'local',
        items: [
          {
            _id: 'item_123',
            product: { _id: 'product1', name: 'Test Product' },
            price: 10,
            quantity: 2,
            size: 'M',
            color: 'Red'
          }
        ],
        totalItems: 2,
        totalPrice: 20,
        lastUpdated: '2024-01-01T00:00:00.000Z'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedCart));

      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
      });

      const cartData = JSON.parse(getByTestId('cart-data').props.children);
      expect(cartData).toEqual(storedCart);
      expect(getByTestId('cart-loading').props.children).toBe('false');
      expect(getByTestId('cart-initialized').props.children).toBe('true');
    });

    it('should handle local storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
      });

      const cartData = JSON.parse(getByTestId('cart-data').props.children);
      expect(cartData).toEqual({
        _id: 'local',
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: expect.any(String)
      });
      expect(getByTestId('cart-error').props.children).toBe('Failed to load cart');
      expect(getByTestId('cart-loading').props.children).toBe('false');
      expect(getByTestId('cart-initialized').props.children).toBe('true');
    });
  });

  describe('Add to Cart', () => {
    it('should add new item to empty cart', async () => {
      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
      });

      act(() => {
        fireEvent.press(getByTestId('add-item'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.items[0]).toMatchObject({
          product: { _id: 'product1', name: 'Product product1' },
          price: 10,
          quantity: 2,
          size: 'M',
          color: 'Red'
        });
        expect(cartData.totalItems).toBe(2);
        expect(cartData.totalPrice).toBe(20);
      });
    });

    it('should increment quantity for existing item with same attributes', async () => {
      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
      });

      // Add first item
      act(() => {
        fireEvent.press(getByTestId('add-item'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.totalItems).toBe(2);
      });

      // Add same item again
      act(() => {
        fireEvent.press(getByTestId('add-item'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.totalItems).toBe(4);
        expect(cartData.totalPrice).toBe(40);
      });
    });

    it('should add different item as separate entry', async () => {
      const DifferentTestComponent: React.FC = () => {
        const { state, addToCart } = useCart();

        return (
          <View>
            <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
            <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
            <Text testID="cart-error">{state.error || 'null'}</Text>
            <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
            <TouchableOpacity
              testID="add-item-1"
              onPress={() => addToCart('product1', 1, 'M', 'Red')}
            >
              <Text>Add Item 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="add-item-2"
              onPress={() => addToCart('product2', 1, 'L', 'Blue')}
            >
              <Text>Add Item 2</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <DifferentTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        expect(getByTestId('cart-initialized').props.children).toBe('true');
      });

      act(() => {
        fireEvent.press(getByTestId('add-item-1'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
      });

      act(() => {
        fireEvent.press(getByTestId('add-item-2'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(2);
        expect(cartData.totalItems).toBe(2);
        expect(cartData.totalPrice).toBe(20);
      });
    });
  });

  describe('Update Cart Item', () => {
    it('should update item quantity', async () => {
      const UpdateTestComponent: React.FC = () => {
        const { state, addToCart, updateCartItem } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 2);
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
            <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
            <Text testID="cart-error">{state.error || 'null'}</Text>
            <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
            <TouchableOpacity
              testID="update-quantity"
              onPress={() => {
                if (state.cart && state.cart.items.length > 0) {
                  updateCartItem(state.cart.items[0]._id, 5);
                }
              }}
            >
              <Text>Update Quantity</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <UpdateTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.totalItems).toBe(2);
      });

      act(() => {
        fireEvent.press(getByTestId('update-quantity'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.items[0].quantity).toBe(5);
        expect(cartData.totalItems).toBe(5);
        expect(cartData.totalPrice).toBe(50);
      });
    });

    it('should remove item when quantity is set to 0', async () => {
      const UpdateTestComponent: React.FC = () => {
        const { state, addToCart, updateCartItem } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 2);
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
            <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
            <Text testID="cart-error">{state.error || 'null'}</Text>
            <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
            <TouchableOpacity
              testID="remove-via-update"
              onPress={() => {
                if (state.cart && state.cart.items.length > 0) {
                  updateCartItem(state.cart.items[0]._id, 0);
                }
              }}
            >
              <Text>Remove via Update</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <UpdateTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
      });

      act(() => {
        fireEvent.press(getByTestId('remove-via-update'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(0);
        expect(cartData.totalItems).toBe(0);
        expect(cartData.totalPrice).toBe(0);
      });
    });
  });

  describe('Remove from Cart', () => {
    it('should remove specific item from cart', async () => {
      const RemoveTestComponent: React.FC = () => {
        const { state, addToCart, removeFromCart } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 1);
            addToCart('product2', 1);
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
            <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
            <Text testID="cart-error">{state.error || 'null'}</Text>
            <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
            <TouchableOpacity
              testID="remove-first-item"
              onPress={() => {
                if (state.cart && state.cart.items.length > 0) {
                  removeFromCart(state.cart.items[0]._id);
                }
              }}
            >
              <Text>Remove First Item</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <RemoveTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(2);
        expect(cartData.totalItems).toBe(2);
      });

      act(() => {
        fireEvent.press(getByTestId('remove-first-item'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.totalItems).toBe(1);
        expect(cartData.totalPrice).toBe(10);
      });
    });
  });

  describe('Clear Cart', () => {
    it('should clear all items from cart', async () => {
      const ClearTestComponent: React.FC = () => {
        const { state, addToCart, clearCart } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 2);
            addToCart('product2', 1);
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-initialized">{state.isInitialized ? 'true' : 'false'}</Text>
            <Text testID="cart-loading">{state.loading ? 'true' : 'false'}</Text>
            <Text testID="cart-error">{state.error || 'null'}</Text>
            <Text testID="cart-data">{JSON.stringify(state.cart)}</Text>
            <TouchableOpacity
              testID="clear-cart-btn"
              onPress={() => clearCart()}
            >
              <Text>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <ClearTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(2);
        expect(cartData.totalItems).toBe(3);
      });

      act(() => {
        fireEvent.press(getByTestId('clear-cart-btn'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(0);
        expect(cartData.totalItems).toBe(0);
        expect(cartData.totalPrice).toBe(0);
      });
    });
  });

  describe('Refresh Cart', () => {
    it('should reload cart from local storage', async () => {
      const storedCart = {
        _id: 'local',
        items: [
          {
            _id: 'stored_item_1',
            product: { _id: 'stored_product', name: 'Stored Product' },
            price: 15,
            quantity: 3,
            size: 'L',
            color: 'Green'
          }
        ],
        totalItems: 3,
        totalPrice: 45,
        lastUpdated: '2024-01-01T00:00:00.000Z'
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedCart));

      const { getByTestId } = render(
        <CartProvider>
          <TestComponent />
        </CartProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData).toBeDefined();
      });

      // Modify cart locally
      act(() => {
        fireEvent.press(getByTestId('add-item'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(1);
        expect(cartData.totalItems).toBe(2);
      });

      // Refresh should load from storage
      act(() => {
        fireEvent.press(getByTestId('refresh-cart'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData).toEqual(storedCart);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during operations gracefully', async () => {
      // Test error handling by mocking a function that throws
      const ErrorTestComponent: React.FC = () => {
        const { state, addToCart } = useCart();

        return (
          <View>
            <Text testID="cart-state">{JSON.stringify(state)}</Text>
            <TouchableOpacity
              testID="add-item-error"
              onPress={() => {
                // This should not throw, but let's test error state
                addToCart('product1', -1); // Invalid quantity, but handled gracefully
              }}
            >
              <Text>Add Item Error</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <ErrorTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartState = JSON.parse(getByTestId('cart-state').textContent || '{}');
        expect(cartState.isInitialized).toBe(true);
      });

      act(() => {
        fireEvent.press(getByTestId('add-item-error'));
      });

      await waitFor(() => {
        const cartState = JSON.parse(getByTestId('cart-state').textContent || '{}');
        expect(cartState.cart.items).toHaveLength(1);
        expect(cartState.error).toBeNull();
      });
    });
  });

  describe('Integration with Checkout', () => {
    it('should provide cart data in correct format for checkout', async () => {
      const CheckoutTestComponent: React.FC = () => {
        const { state, addToCart } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 2, 'M', 'Red');
            addToCart('product2', 1, 'L', 'Blue');
          }
        }, [state.isInitialized, state.cart, addToCart]);

        const transformCartItemsToOrderItems = (cartItems: any[]) => {
          return cartItems.map(item => ({
            productId: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity
          }));
        };

        const orderItems = state.cart ? transformCartItemsToOrderItems(state.cart.items) : [];

        return (
          <View>
            <Text testID="cart-state">{JSON.stringify(state)}</Text>
            <Text testID="order-items">{JSON.stringify(orderItems)}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <CheckoutTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(2);
        expect(cartData.totalItems).toBe(3);
        expect(cartData.totalPrice).toBe(30);
      });

      const orderItems = JSON.parse(getByTestId('order-items').props.children);
      expect(orderItems).toHaveLength(2);
      expect(orderItems[0]).toMatchObject({
        productId: 'product1',
        name: 'Product product1',
        price: 10,
        quantity: 2
      });
      expect(orderItems[1]).toMatchObject({
        productId: 'product2',
        name: 'Product product2',
        price: 10,
        quantity: 1
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large number of items efficiently', async () => {
      const LargeCartTestComponent: React.FC = () => {
        const { state, addToCart } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            // Add multiple items quickly
            for (let i = 0; i < 10; i++) {
              addToCart(`product${i}`, 1);
            }
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-state">{JSON.stringify(state)}</Text>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <LargeCartTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items).toHaveLength(10);
        expect(cartData.totalItems).toBe(10);
        expect(cartData.totalPrice).toBe(100);
      });
    });

    it('should handle concurrent operations', async () => {
      const ConcurrentTestComponent: React.FC = () => {
        const { state, addToCart, updateCartItem } = useCart();

        React.useEffect(() => {
          if (state.isInitialized && state.cart && state.cart.items.length === 0) {
            addToCart('product1', 1);
          }
        }, [state.isInitialized, state.cart, addToCart]);

        return (
          <View>
            <Text testID="cart-state">{JSON.stringify(state)}</Text>
            <TouchableOpacity
              testID="concurrent-ops"
              onPress={() => {
                if (state.cart && state.cart.items.length > 0) {
                  // Simulate concurrent operations
                  addToCart('product2', 1);
                  updateCartItem(state.cart.items[0]._id, 3);
                }
              }}
            >
              <Text>Concurrent Ops</Text>
            </TouchableOpacity>
          </View>
        );
      };

      const { getByTestId } = render(
        <CartProvider>
          <ConcurrentTestComponent />
        </CartProvider>
      );

      await waitFor(() => {
        const cartState = JSON.parse(getByTestId('cart-state').textContent || '{}');
        expect(cartState.cart.items).toHaveLength(1);
      });

      act(() => {
        fireEvent.press(getByTestId('concurrent-ops'));
      });

      await waitFor(() => {
        const cartData = JSON.parse(getByTestId('cart-data').props.children);
        expect(cartData.items.length).toBeGreaterThanOrEqual(1);
        expect(cartData.totalItems).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
