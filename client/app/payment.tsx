import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { paymentService } from '../services/paymentService';
import { tonService } from '../services/tonService-updated';

export default function PaymentScreen() {
  const router = useRouter();
  const { orderData: orderDataParam } = useLocalSearchParams();

  const [orderData, setOrderData] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'nowpayments' | 'ton' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (orderDataParam && typeof orderDataParam === 'string') {
      try {
        const decoded = decodeURIComponent(orderDataParam);
        const parsed = JSON.parse(decoded);
        setOrderData(parsed);
      } catch (error) {
        console.error('Error parsing orderData:', error);
        Alert.alert('Error', 'Invalid order data');
        router.back();
      }
    } else {
      Alert.alert('Error', 'No order data provided');
      router.back();
    }
  }, [orderDataParam]);

  const handlePaymentMethodSelect = (method: 'nowpayments' | 'ton') => {
    setSelectedPaymentMethod(method);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPaymentMethod || !orderData) return;

    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === 'nowpayments') {
        // Handle NowPayments
        const response = await fetch('/api/create-invoice', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: orderData.totalAmount,
            currency: 'USD',
            orderId: `order_${Date.now()}`,
            orderDescription: `Payment for order`,
          }),
        });

        const data = await response.json();

        if (data.success && data.invoice_url) {
          // Redirect to NowPayments invoice
          router.push(data.invoice_url);
        } else {
          Alert.alert('Error', 'Failed to create payment invoice');
        }
      } else if (selectedPaymentMethod === 'ton') {
        // Handle TON native payment
        const result = await tonService.sendPayment(
          `order_${Date.now()}`,
          orderData.totalAmount
        );

        if (result.success) {
          Alert.alert('Success', 'Payment sent successfully!', [
            {
              text: 'OK',
              onPress: () => router.push('/my-order'),
            },
          ]);
        } else {
          Alert.alert('Error', result.error || 'Payment failed');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <ThemedText style={styles.placeholderText}>📦</ThemedText>
        </View>
      )}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.productName}>{item.name || 'Product'}</ThemedText>
        <ThemedText style={styles.productInfo}>Qty: {item.quantity || 1}</ThemedText>
        <ThemedText style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</ThemedText>
      </View>
    </View>
  );

  if (!orderData) {
    return (
      <View style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#00ff00" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <ThemedText style={styles.headerText}>PAYMENT</ThemedText>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
        {orderData.cartItems.length > 0 ? (
          <FlatList
            data={orderData.cartItems}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyCart}>No items in order</ThemedText>
        )}
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>Total: ${orderData.totalAmount.toFixed(2)}</ThemedText>
        </View>
      </View>

      {/* Shipping Details */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Shipping Details</ThemedText>
        <ThemedText style={styles.shippingInfo}>
          {orderData.shippingDetails.name}
        </ThemedText>
        <ThemedText style={styles.shippingInfo}>
          {orderData.shippingDetails.address}
        </ThemedText>
        <ThemedText style={styles.shippingInfo}>
          {orderData.shippingDetails.city}, {orderData.shippingDetails.postalCode}
        </ThemedText>
        <ThemedText style={styles.shippingInfo}>
          {orderData.shippingDetails.country}
        </ThemedText>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Choose Payment Method</ThemedText>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === 'nowpayments' && styles.selectedPaymentMethod
          ]}
          onPress={() => handlePaymentMethodSelect('nowpayments')}
        >
          <View style={styles.paymentMethodContent}>
            <Ionicons name="card" size={24} color="#00ff00" />
            <View style={styles.paymentMethodText}>
              <ThemedText style={styles.paymentMethodTitle}>NowPayments</ThemedText>
              <ThemedText style={styles.paymentMethodDescription}>
                Pay with crypto, card, or other methods
              </ThemedText>
            </View>
          </View>
          {selectedPaymentMethod === 'nowpayments' && (
            <Ionicons name="checkmark-circle" size={24} color="#00ff00" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === 'ton' && styles.selectedPaymentMethod
          ]}
          onPress={() => handlePaymentMethodSelect('ton')}
        >
          <View style={styles.paymentMethodContent}>
            <Ionicons name="wallet" size={24} color="#00ff00" />
            <View style={styles.paymentMethodText}>
              <ThemedText style={styles.paymentMethodTitle}>TON Native</ThemedText>
              <ThemedText style={styles.paymentMethodDescription}>
                Pay directly with TON cryptocurrency
              </ThemedText>
            </View>
          </View>
          {selectedPaymentMethod === 'ton' && (
            <Ionicons name="checkmark-circle" size={24} color="#00ff00" />
          )}
        </TouchableOpacity>
      </View>

      {/* Proceed Button */}
      <TouchableOpacity
        style={[
          styles.proceedButton,
          (!selectedPaymentMethod || isProcessing) && styles.disabledButton
        ]}
        onPress={handleProceedToPayment}
        disabled={!selectedPaymentMethod || isProcessing}
      >
        <View style={styles.proceedButtonGlow}>
          <ThemedText style={styles.proceedButtonText}>
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  // Main Container with Cyberpunk Background
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },

  // Cyberpunk Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
    paddingTop: isMobile ? 40 : 50,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderBottomWidth: 2,
    borderBottomColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: isMobile ? 18 : 22,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Section with Cyberpunk Styling
  section: {
    marginBottom: isMobile ? 30 : 40,
    paddingHorizontal: isMobile ? 20 : 30,
  },
  sectionTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 24,
    fontWeight: '900',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },

  // Cyberpunk Cart Items
  cartItem: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    padding: isMobile ? 15 : 20,
    marginBottom: isMobile ? 15 : 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  productImage: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 60 : 80,
    borderRadius: 10,
    marginRight: isMobile ? 15 : 20,
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  placeholderImage: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 60 : 80,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    marginRight: isMobile ? 15 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  placeholderText: {
    fontSize: isMobile ? 20 : 24,
    color: '#ff0080',
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  productInfo: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productPrice: {
    color: '#ff0080',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Empty Cart Styling
  emptyCart: {
    color: '#666666',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 30,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Total Container with Cyberpunk Effects
  totalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#ff0080',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderRadius: 15,
    padding: isMobile ? 15 : 20,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  totalText: {
    color: '#ffffff',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Shipping Info Styling
  shippingInfo: {
    color: '#cccccc',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cyberpunk Payment Method Selection
  paymentMethod: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: isMobile ? 15 : 20,
    marginBottom: isMobile ? 15 : 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#00ffff',
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: isMobile ? 12 : 15,
    flex: 1,
  },
  paymentMethodTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  paymentMethodDescription: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cyberpunk Proceed Button
  proceedButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#00ffff',
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: isMobile ? 20 : 30,
    marginTop: 30,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  disabledButton: {
    borderColor: '#666666',
    shadowColor: '#666666',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  proceedButtonGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 18 : 22,
    paddingHorizontal: isMobile ? 30 : 40,
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
