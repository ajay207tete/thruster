import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '@/services/api';

// Interfaces
interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    image?: string;
  };
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  lastUpdated: string;
}

// Cart State Interface
interface CartState {
  cart: Cart;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Cart Context Interface
interface CartContextType {
  state: CartState;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Props
interface CartProviderProps {
  children: ReactNode;
}

// Cart Provider Component
export function CartProvider({ children }: CartProviderProps) {
  const [state, setState] = useState<CartState>({
    cart: {
      _id: "guest",
      items: [],
      totalItems: 0,
      totalPrice: 0,
      lastUpdated: new Date().toISOString()
    },
    loading: false,
    error: null,
    isInitialized: false,
  });

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, []);

  const initializeCart = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Try to load from local storage
      try {
        const localCartData = await AsyncStorage.getItem('localCart');
        if (localCartData) {
          const parsedCart = JSON.parse(localCartData);
          // Ensure totals are calculated correctly
          const totalItems = parsedCart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
          const totalPrice = parsedCart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

          const loadedCart: Cart = {
            ...parsedCart,
            totalItems,
            totalPrice,
            lastUpdated: new Date().toISOString()
          };

          setState(prev => ({ ...prev, cart: loadedCart, loading: false, isInitialized: true }));
          return;
        }
      } catch (storageError) {
        console.error('Storage error during initialization:', storageError);
        const emergencyCart: Cart = {
          _id: 'emergency',
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: new Date().toISOString()
        };
        setState(prev => ({ ...prev, cart: emergencyCart, error: 'Failed to load cart', loading: false, isInitialized: true }));
        return;
      }

      // Create guest cart if no stored cart
      const guestCart: Cart = {
        _id: 'guest',
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString()
      };

      setState(prev => ({ ...prev, cart: guestCart, loading: false, isInitialized: true }));

      // Save initial guest cart
      try {
        await AsyncStorage.setItem('localCart', JSON.stringify(guestCart));
      } catch (storageError) {
        console.error('Storage error saving initial cart:', storageError);
        setState(prev => ({ ...prev, error: 'Failed to save cart' }));
      }
    } catch (error) {
      console.error('Critical error initializing cart:', error);
      setState(prev => ({ ...prev, error: 'Failed to load cart', loading: false, isInitialized: true }));
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch product data
      const productData = await apiService.getProductById(productId);

      setState(prev => {
        const newItem:CartItem ={
          _id:'item_${Date.now()}_${Math.random()}',
          product:{
            _id:productId,
            name:productData?.name ||'product ${productId}'
            image:productData?.imageUrl,
          },
               price:productData?.price ||10,
               quantity,
               size,
               color,
      };

      // Check if item already exists
      const existingIndex = prev.cart.items.findIndex(
        item => item.product._id === productId &&
                item.size === size &&
                item.color === color
      );

      let updatedItems: CartItem[];
      if (existingIndex >= 0) {
        updatedItems = [...prev.cart.items];
        updatedItems[existingIndex].quantity += quantity;
      } else {
        updatedItems = [...prev.cart.items, newItem];
      }

      // Always compute totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedCart: Cart = {
        ...prev.cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      };

    

      // Save to storage
      asyncStorage.setItem('localCart',JSON.stringify(updatedCart));
    return{
      ..prev,
      cart:updatedCart,
      loading:false,
      };
});
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message || 'Failed to add item', loading: false }));
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedItems = state.cart.items
        .map(item =>
          item._id === itemId
            ? { ...item, quantity }
            : item
        )
        .filter(item => item.quantity > 0);

      // Always compute totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedCart: Cart = {
        ...state.cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      };

      setState(prev => ({ ...prev, cart: updatedCart, loading: false }));

      // Save to storage
      try {
        await AsyncStorage.setItem('localCart', JSON.stringify(updatedCart));
      } catch (storageError) {
        console.error('Storage error in updateCartItem:', storageError);
        setState(prev => ({ ...prev, error: 'Failed to save cart' }));
      }
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to update item', loading: false }));
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const updatedItems = state.cart.items.filter(item => item._id !== itemId);

      // Always compute totals
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedCart: Cart = {
        ...state.cart,
        items: updatedItems,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      };

      setState(prev => ({ ...prev, cart: updatedCart, loading: false }));

      // Save to storage
      try {
        await AsyncStorage.setItem('localCart', JSON.stringify(updatedCart));
      } catch (storageError) {
        console.error('Storage error in removeFromCart:', storageError);
        setState(prev => ({ ...prev, error: 'Failed to save cart' }));
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to remove item', loading: false }));
    }
  };

  const clearCart = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const clearedCart: Cart = {
        ...state.cart,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString()
      };

      setState(prev => ({ ...prev, cart: clearedCart, loading: false }));

      // Save to storage
      try {
        await AsyncStorage.setItem('localCart', JSON.stringify(clearedCart));
      } catch (storageError) {
        console.error('Storage error in clearCart:', storageError);
        setState(prev => ({ ...prev, error: 'Failed to save cart' }));
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to clear cart', loading: false }));
    }
  };

  const refreshCart = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load from storage
      try {
        const localCartData = await AsyncStorage.getItem('localCart');
        if (localCartData) {
          const parsedCart = JSON.parse(localCartData);
          // Ensure totals are calculated correctly
          const totalItems = parsedCart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
          const totalPrice = parsedCart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

          const refreshedCart: Cart = {
            ...parsedCart,
            totalItems,
            totalPrice,
            lastUpdated: new Date().toISOString()
          };

          setState(prev => ({ ...prev, cart: refreshedCart, loading: false }));
        } else {
          // If no stored cart, create guest cart
          const guestCart: Cart = {
            _id: 'guest',
            items: [],
            totalItems: 0,
            totalPrice: 0,
            lastUpdated: new Date().toISOString()
          };
          setState(prev => ({ ...prev, cart: guestCart, loading: false }));
        }
      } catch (storageError) {
        console.error('Storage error in refreshCart:', storageError);
        setState(prev => ({ ...prev, error: 'Failed to load cart', loading: false }));
      }
    } catch (error: any) {
      console.error('Error refreshing cart:', error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to refresh cart', loading: false }));
    }
  };

  const contextValue: CartContextType = {
    state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
