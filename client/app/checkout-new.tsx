import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { CheckoutFlow } from '../components/CheckoutFlow';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';

export default function CheckoutNew() {
  const router = useRouter();
  const { state: cartState } = useCart();
  const cart = cartState.cart;
  const { cartItems: cartItemsParam } = useLocalSearchParams();

  const [showCheckoutFlow, setShowCheckoutFlow] = useState(true);
  const [urlCartItems, setUrlCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (cartItemsParam && typeof cartItemsParam === 'string') {
      try {
        const decoded = decodeURIComponent(cartItemsParam);
        const parsed = JSON.parse(decoded);
        setUrlCartItems(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error parsing cartItems from URL:', error);
        setUrlCartItems([]);
      }
    } else if (cart?.items && cart.items.length > 0) {
      // If no URL params, use cart from context
      setUrlCartItems(cart.items);
    } else if (cartState.isInitialized && !cartItemsParam) {
      // If cart is initialized but empty, set empty array
      setUrlCartItems([]);
    }
  }, [cartItemsParam, cart, cartState.isInitialized]);

  const handleOrderComplete = (order: any) => {
    console.log('Order completed:', order);
    router.push('/my-order');
  };

  const handleCancelCheckout = () => {
    setShowCheckoutFlow(false);
    router.back();
  };

  // Transform cart items to OrderItem format
  const transformCartItemsToOrderItems = (cartItems: any[]) => {
    return cartItems.map(item => ({
      productId: item._id || item.product?._id,
      name: item.name || item.product?.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || item.product?.image
    }));
  };

  // Show loading while cart is initializing
  if (!cartState.isInitialized) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading cart...</ThemedText>
      </ThemedView>
    );
  }

  if (showCheckoutFlow) {
    const cartItemsToUse = urlCartItems.length > 0 ? urlCartItems : (cart?.items || []);
    return (
      <ThemedView style={styles.container}>
        <CheckoutFlow
          cartItems={transformCartItemsToOrderItems(cartItemsToUse)}
          onOrderComplete={handleOrderComplete}
          onCancel={handleCancelCheckout}
        />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
});
