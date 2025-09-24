import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Product } from './(tabs)/shop';
import { paymentService, defaultPaymentConfig } from '../services/paymentService';
import { tonService } from '../services/tonService-updated';

export default function CheckoutScreen() {
  const { cartItems: cartItemsParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const cartItemsParam = useMemo(() => {
    const params = useLocalSearchParams();
    return params.cartItems;
  }, []);

  const loadCartItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading cart items...');

      // First try to get from URL parameters
      if (cartItemsParam && typeof cartItemsParam === 'string') {
        console.log('Loading from URL params');
        const parsedItems = JSON.parse(cartItemsParam);
        const updatedItems = parsedItems.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        }));
        setCartItems(updatedItems);
        console.log('Cart items loaded from URL:', updatedItems.length);
      } else {
        // Fallback to AsyncStorage
        console.log('Loading from AsyncStorage');
        const storedCart = await AsyncStorage.getItem('cartItems');
        if (storedCart) {
          const parsedItems = JSON.parse(storedCart);
          const updatedItems = parsedItems.map((item: any) => ({
            ...item,
            quantity: item.quantity || 1,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          }));
          setCartItems(updatedItems);
          console.log('Cart items loaded from storage:', updatedItems.length);
        } else {
          console.log('No cart items found');
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      Alert.alert('Error', 'Failed to load cart items. Please try again.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [cartItemsParam]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        console.log('Initializing payment service...');
        const result = await paymentService.initialize();
        if (result.success) {
          setPaymentInitialized(true);
          console.log('Payment service initialized successfully');
        } else {
          Alert.alert('Payment Initialization Error', result.errors.join(', '));
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
        Alert.alert('Payment Initialization Error', 'Failed to initialize payment systems.');
      }
    };
    initializePayment();
  }, []); // Empty dependency array to run only once

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems])
  );

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedItems = cartItems.filter(item => item._id !== id);
              setCartItems(updatedItems);
              await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
            } catch (error) {
              console.error('Error removing item from cart:', error);
              Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBackToCart = () => {
    router.back();
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your cart before proceeding.');
      return;
    }
    if (!paymentInitialized) {
      Alert.alert('Payment Not Ready', 'Payment systems are still initializing. Please wait.');
      return;
    }
    setPaymentProcessing(true);
    try {
      const productDetails = cartItems.map(item => `${item.name} x${item.quantity}`).join(', ');
      const productImage = cartItems[0]?.image || 'https://example.com/default.jpg';
      const result = await tonService.createOrder({
        productDetails,
        productImage,
      });
      if (result.success) {
        Alert.alert('Order Created', `Order #${result.orderId} created successfully!`);
        await AsyncStorage.removeItem('cartItems');
        setCartItems([]);
      } else {
        Alert.alert('Payment Error', result.error || 'Payment failed');
      }
    } catch (error: any) {
      Alert.alert('Payment Error', error.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  const renderCartItem = ({ item }: { item: Product }) => (
    <View style={styles.cartItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <Ionicons name="shirt" size={40} color="#00ff00" style={styles.itemIcon} />
      )}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemText}>{item.name}</ThemedText>
        <ThemedText style={styles.itemDetailsText}>Size: {item.size || 'N/A'}</ThemedText>
        <ThemedText style={styles.itemDetailsText}>Color: {item.color || 'N/A'}</ThemedText>
        <ThemedText style={styles.itemDetailsText}>Quantity: {item.quantity || 1}</ThemedText>
      </View>
      <ThemedText style={styles.priceText}>${(item.price * (item.quantity || 1)).toFixed(2)}</ThemedText>
      <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
        <Ionicons name="trash" size={24} color="#ff0000" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading cart items...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToCart} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Checkout</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart" size={80} color="#333333" />
          <ThemedText style={styles.emptyText}>Your cart is empty.</ThemedText>
          <TouchableOpacity onPress={handleBackToCart} style={styles.shopButton}>
            <ThemedText style={styles.shopButtonText}>Back to Cart</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* Order Summary */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item._id}
              renderItem={renderCartItem}
              contentContainerStyle={styles.list}
              scrollEnabled={false}
            />
          </View>

          {/* Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Subtotal:</ThemedText>
              <ThemedText style={styles.totalValue}>${getTotalPrice()}</ThemedText>
            </View>
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Shipping:</ThemedText>
              <ThemedText style={styles.totalValue}>$0.00</ThemedText>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <ThemedText style={styles.finalTotalLabel}>Total:</ThemedText>
              <ThemedText style={styles.finalTotalValue}>${getTotalPrice()}</ThemedText>
            </View>
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            onPress={handlePayment}
            style={[
              styles.paymentButton,
              (!paymentInitialized || paymentProcessing) && styles.paymentButtonDisabled
            ]}
            disabled={!paymentInitialized || paymentProcessing}
          >
            <ThemedText style={styles.paymentButtonText}>
              {paymentProcessing ? 'Processing...' : paymentInitialized ? '💎 Pay with TON Smart Contract' : 'Initializing Payment...'}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'SpaceMono',
  },
  headerSpacer: {
    width: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#00ff00',
    fontSize: 18,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  shopButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 15,
  },
  list: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
    justifyContent: 'space-between',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 15,
  },
  itemIcon: {
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  itemDetailsText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  priceText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginRight: 15,
  },
  removeButton: {
    padding: 6,
  },
  totalSection: {
    backgroundColor: '#111111',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  totalValue: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  finalTotalLabel: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  finalTotalValue: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  paymentButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonDisabled: {
    opacity: 0.5,
  },
  paymentButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
});
