import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PaymentData, PaymentResponse } from '@/services/api';
import { apiService } from '@/services/api';
import { Product } from '@/app/(tabs)/shop';

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export default function CheckoutScreen() {
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
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<any>(null);

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

  useFocusEffect(useCallback(() => { loadCartItems().catch(error => console.error('Error in focus effect:', error)); }, [loadCartItems]));


  useEffect(() => {
    if (paymentData) {
      console.log('Payment data:', paymentData);
    }
  }, [paymentData]);

  useEffect(() => {
    if (paymentStatus) {
      console.log('Payment status:', paymentStatus);
    }
  }, [paymentStatus]);

  const getTotalPrice = () => {
    // Include all cart items, assuming they are available for purchase
    const total = cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    console.log('Cart items:', cartItems);
    console.log('Total price:', total);
    return total;
  };

  const handlePayment = async () => {
    Alert.alert('Payment Disabled', 'Payment processing has been disabled as per your request.');
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
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
            {['BTC', 'ETH', 'USDT', 'USD'].map((currency) => (
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.disabledButton]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <ThemedText style={styles.payButtonText}>Pay Now</ThemedText>
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

