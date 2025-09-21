import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Product } from '@/app/(tabs)/shop';
import { useTonContract } from '@/hooks/useTonContract';
import { OrderData } from '@/services/tonService';

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export default function CheckoutTonScreen() {
  const { cartItems: cartItemsParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [selectedCurrency, setSelectedCurrency] = useState('TON');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<any>(null);

  // TON Contract Integration
  const {
    contractAddress,
    contractBalance,
    isLoading: tonLoading,
    createOrder,
    checkPaymentStatus,
    refreshBalance
  } = useTonContract();

  const loadCartItems = useCallback(async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cartItems');
      if (storedCart) {
        const parsedItems = JSON.parse(storedCart);
        const updatedItems = parsedItems.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        }));
        setCartItems(updatedItems);
      } else if (cartItemsParam && typeof cartItemsParam === 'string') {
        const parsedItems = JSON.parse(cartItemsParam);
        const updatedItems = parsedItems.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        }));
        setCartItems(updatedItems);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    }
  }, [cartItemsParam]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  useFocusEffect(useCallback(() => {
    loadCartItems().catch(error => console.error('Error in focus effect:', error));
  }, [loadCartItems]));

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    return total;
  };

  const handlePayment = async () => {
    // Validate shipping information
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address ||
        !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country) {
      Alert.alert('Error', 'Please fill in all required shipping information.');
      return;
    }

    // Validate cart
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order details
      const orderDetails = {
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`,
        phone: shippingInfo.phone,
        items: cartItems.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.image
        })),
        totalAmount: getTotalPrice(),
        currency: selectedCurrency,
        timestamp: new Date().toISOString()
      };

      // Create TON order
      const orderData: OrderData = {
        productDetails: JSON.stringify(orderDetails),
        productImage: cartItems[0]?.image || 'default_image_url'
      };

      console.log('Creating TON order with data:', orderData);

      const result = await createOrder(orderData);

      if (result.success && result.orderId) {
        setLastOrderId(result.orderId);

        Alert.alert(
          'Order Created Successfully!',
          `Order #${result.orderId} has been created on the TON blockchain.\n\nContract Address: ${contractAddress}\n\nPlease send TON payment to complete your order.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Start polling for payment status
                startPaymentPolling(result.orderId);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create order on blockchain');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An error occurred while processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startPaymentPolling = (orderId: number) => {
    setIsPolling(true);

    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(orderId);

        if (status.isPaid) {
          clearInterval(interval);
          setIsPolling(false);

          Alert.alert(
            'Payment Confirmed!',
            'Your payment has been confirmed on the TON blockchain. Your order will be processed shortly.',
            [
              {
                text: 'Continue Shopping',
                onPress: () => {
                  router.replace('/(tabs)/shop');
                }
              }
            ]
          );
        } else {
          console.log(`Order ${orderId} still pending payment...`);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    setPollingInterval(interval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsPolling(false);
      Alert.alert(
        'Payment Timeout',
        'Payment was not received within the expected time. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setLastOrderId(null);
            }
          }
        ]
      );
    }, 600000); // 10 minutes
  };

  const handleRemoveItem = async (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedItems = cartItems.filter(item => item._id !== id);
            setCartItems(updatedItems);
            await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
          },
        },
      ]
    );
  };

  const formatTonBalance = (nanoTons: string) => {
    const tons = parseInt(nanoTons) / 1e9;
    return `${tons.toFixed(4)} TON`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Contract Info */}
        <View style={styles.contractInfo}>
          <ThemedText style={styles.contractTitle}>TON Contract Information</ThemedText>
          <ThemedText style={styles.contractAddress}>
            Address: {contractAddress}
          </ThemedText>
          <ThemedText style={styles.contractBalance}>
            Balance: {formatTonBalance(contractBalance)}
          </ThemedText>
          {tonLoading && <ActivityIndicator size="small" color="#00ff00" />}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Shipping Information</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={shippingInfo.name}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={shippingInfo.email}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={shippingInfo.city}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Postal Code"
            value={shippingInfo.postalCode}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, postalCode: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Country"
            value={shippingInfo.country}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, country: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone (optional)"
            keyboardType="phone-pad"
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Payment Currency</ThemedText>
          <View style={styles.currencySelector}>
            {['TON', 'BTC', 'ETH', 'USDT', 'USD'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  selectedCurrency === currency && styles.selectedCurrency,
                ]}
                onPress={() => setSelectedCurrency(currency)}
              >
                <ThemedText style={styles.currencyText}>{currency}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Your cart is empty.</ThemedText>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <Image source={{ uri: item.image || undefined }} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <ThemedText style={styles.cartItemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.cartItemPrice}>${item.price.toFixed(2)}</ThemedText>
                  <ThemedText style={styles.cartItemQuantity}>Quantity: {item.quantity || 1}</ThemedText>
                </View>
                <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
                  <Ionicons name="trash" size={24} color="#ff0000" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={styles.totalContainer}>
            <ThemedText style={styles.totalText}>Total: ${getTotalPrice().toFixed(2)}</ThemedText>
          </View>
        </View>

        {/* Payment Status */}
        {lastOrderId && (
          <View style={styles.paymentStatus}>
            <ThemedText style={styles.statusTitle}>Payment Status</ThemedText>
            <ThemedText style={styles.statusText}>
              Order #{lastOrderId} - {isPolling ? 'Waiting for payment...' : 'Order created'}
            </ThemedText>
            {isPolling && <ActivityIndicator size="small" color="#00ff00" />}
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, (isProcessing || tonLoading) && styles.disabledButton]}
            onPress={handlePayment}
            disabled={isProcessing || tonLoading}
          >
            {isProcessing || tonLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <ThemedText style={styles.payButtonText}>
                {selectedCurrency === 'TON' ? 'Pay with TON' : `Pay with ${selectedCurrency}`}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 20,
  },
  contractInfo: {
    backgroundColor: '#001100',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  contractTitle: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  contractAddress: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  contractBalance: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  input: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyButton: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  selectedCurrency: {
    borderColor: '#00ff00',
    backgroundColor: '#001100',
  },
  currencyText: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#00ff00',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cartItemName: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  cartItemPrice: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  cartItemQuantity: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  totalContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
  },
  totalText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    textAlign: 'right',
  },
  paymentStatus: {
    backgroundColor: '#001100',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  statusTitle: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  footer: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
    padding: 20,
  },
  payButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  removeButton: {
    padding: 6,
  },
});
