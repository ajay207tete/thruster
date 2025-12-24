import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Cart Actions
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_INITIALIZED'; payload: boolean };

// Initial State
const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  isInitialized: false,
};

// Cart Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_CART':
      return {
        ...state,
        cart: action.payload,
        loading: false,
        error: null,
        isInitialized: true
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'ADD_ITEM':
      if (!state.cart) return state;
      const existingItemIndex = state.cart.items.findIndex(
        item => item.product._id === action.payload.product._id &&
                item.size === action.payload.size &&
                item.color === action.payload.color
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...state.cart.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        updatedItems = [...state.cart.items, action.payload];
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          lastUpdated: new Date().toISOString()
        }
      };

    case 'UPDATE_ITEM':
      if (!state.cart) return state;
      const updatedItems2 = state.cart.items.map(item =>
        item._id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems2,
          totalItems: updatedItems2.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems2.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          lastUpdated: new Date().toISOString()
        }
      };

    case 'REMOVE_ITEM':
      if (!state.cart) return state;
      const filteredItems = state.cart.items.filter(item => item._id !== action.payload);

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          lastUpdated: new Date().toISOString()
        }
      };

    case 'CLEAR_CART':
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };

    default:
      return state;
  }
}

// Cart Context Interface
interface CartContextType {
  state: CartState;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Props
interface CartProviderProps {
  children: ReactNode;
}

// Cart Provider Component
export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, []);

  const initializeCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Try to load from local storage first (legacy support)
      const localCartData = await AsyncStorage.getItem('localCart');
      const cartItemsData = await AsyncStorage.getItem('cartItems');

      let cart: Cart;

      if (localCartData) {
        cart = JSON.parse(localCartData);
      } else if (cartItemsData) {
        // Convert legacy cartItems format to new Cart format
        const cartItems = JSON.parse(cartItemsData);
        cart = {
          _id: 'local',
          items: cartItems.map((item: any, index: number) => ({
            _id: item._id || `item_${Date.now()}_${index}`,
            product: {
              _id: item._id || item.product?._id,
              name: item.name || item.product?.name || `Product ${item._id}`,
              image: item.image || item.product?.image
            },
            price: item.price,
            quantity: item.quantity || 1,
            size: item.size,
            color: item.color
          })),
          totalItems: cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0),
          totalPrice: cartItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0),
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Create empty cart
        cart = {
          _id: 'local',
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    }
  };

  const addToCart = async (productId: string, quantity: number = 1, size?: string, color?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // For now, just add to local state
      // TODO: Implement proper server-side cart management
      const newItem: CartItem = {
        _id: `item_${Date.now()}`,
        product: {
          _id: productId,
          name: `Product ${productId}`, // TODO: Get from server
        },
        price: 10, // TODO: Get from server
        quantity,
        size,
        color
      };

      dispatch({ type: 'ADD_ITEM', payload: newItem });

      // Persist to AsyncStorage
      if (state.cart) {
        const updatedCart = {
          ...state.cart,
          items: [...state.cart.items, newItem],
          totalItems: state.cart.totalItems + quantity,
          totalPrice: state.cart.totalPrice + (newItem.price * quantity),
          lastUpdated: new Date().toISOString()
        };
        await AsyncStorage.setItem('localCart', JSON.stringify(updatedCart));
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      dispatch({ type: 'UPDATE_ITEM', payload: { itemId, quantity } });

      // Persist to AsyncStorage
      if (state.cart) {
        const updatedItems = state.cart.items.map(item =>
          item._id === itemId
            ? { ...item, quantity }
            : item
        ).filter(item => item.quantity > 0);

        const updatedCart = {
          ...state.cart,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          lastUpdated: new Date().toISOString()
        };
        await AsyncStorage.setItem('localCart', JSON.stringify(updatedCart));
      }
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });

      // Persist to AsyncStorage
      if (state.cart) {
        const filteredItems = state.cart.items.filter(item => item._id !== itemId);
        const updatedCart = {
          ...state.cart,
          items: filteredItems,
          totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          lastUpdated: new Date().toISOString()
        };
        await AsyncStorage.setItem('localCart', JSON.stringify(updatedCart));
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      dispatch({ type: 'CLEAR_CART' });

      // Persist to AsyncStorage
      if (state.cart) {
        const clearedCart = {
          ...state.cart,
          items: [],
          totalItems: 0,
          totalPrice: 0,
          lastUpdated: new Date().toISOString()
        };
        await AsyncStorage.setItem('localCart', JSON.stringify(clearedCart));
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // For now, just reload from local storage
      const localCartData = await AsyncStorage.getItem('localCart');
      if (localCartData) {
        const localCart = JSON.parse(localCartData);
        dispatch({ type: 'SET_CART', payload: localCart });
      }
    } catch (error: any) {
      console.error('Error refreshing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const mergeGuestCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // For now, just refresh the cart
      await refreshCart();
    } catch (error: any) {
      console.error('Error merging cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const contextValue: CartContextType = {
    state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    mergeGuestCart,
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
