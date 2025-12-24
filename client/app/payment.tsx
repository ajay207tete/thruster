import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Image, FlatList } from 'react-native';
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
        <ThemedText style={styles.proceedButtonText}>
          {isProcessing ? 'Processing...' : 'Proceed to Payment'}
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000000',
    flexGrow: 1,
  },
  header: {
    height: 50,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#00ff00',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 4,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    color: '#00ff00',
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  productInfo: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 2,
  },
  productPrice: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  emptyCart: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginVertical: 20,
  },
  totalContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
    alignItems: 'center',
  },
  totalText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  shippingInfo: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#111',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#00ff00',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 15,
    flex: 1,
  },
  paymentMethodTitle: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  paymentMethodDescription: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  proceedButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#333',
  },
  proceedButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
});
