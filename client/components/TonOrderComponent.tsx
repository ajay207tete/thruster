/**
 * TON Order Component
 * Demonstrates how to integrate TON contract functionality in React Native
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useTonContract, useTonOrder } from '../hooks/useTonContract';
import { OrderData } from '../services/tonService-updated';

interface TonOrderComponentProps {
  style?: any;
}

const TonOrderComponent: React.FC<TonOrderComponentProps> = ({ style }) => {
  const {
    contractAddress,
    contractBalance,
    isLoading,
    createOrder,
    getAllOrders,
    withdrawFunds,
    refreshBalance
  } = useTonContract();

  const [productDetails, setProductDetails] = useState('');
  const [productImage, setProductImage] = useState('');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);

  // Handle order creation
  const handleCreateOrder = async () => {
    if (!productDetails.trim() || !productImage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await createOrder({
      productDetails: productDetails.trim(),
      productImage: productImage.trim()
    });

    if (result.success && result.orderId) {
      Alert.alert(
        'Success',
        `Order created successfully!\nOrder ID: ${result.orderId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setLastOrderId(result.orderId!);
              setProductDetails('');
              setProductImage('');
              loadOrders();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to create order');
    }
  };

  // Load all orders
  const loadOrders = async () => {
    const allOrders = await getAllOrders();
    setOrders(allOrders);
  };

  // Handle withdrawal (owner function)
  const handleWithdraw = async () => {
    Alert.alert(
      'Confirm Withdrawal',
      'Are you sure you want to withdraw all funds from the contract?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            const result = await withdrawFunds();
            if (result.success) {
              Alert.alert('Success', 'Funds withdrawn successfully!');
              refreshBalance();
            } else {
              Alert.alert('Error', result.error || 'Failed to withdraw funds');
            }
          }
        }
      ]
    );
  };

  // Format TON balance
  const formatTonBalance = (nanoTons: string) => {
    const tons = parseInt(nanoTons) / 1e9;
    return `${tons.toFixed(4)} TON`;
  };

  return (
    <ScrollView style={[styles.container, style]}>
      <Text style={styles.title}>TON Shopping Contract</Text>

      {/* Contract Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Contract Address:</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {contractAddress}
        </Text>

        <Text style={styles.infoLabel}>Contract Balance:</Text>
        <Text style={styles.infoValue}>
          {formatTonBalance(contractBalance)}
        </Text>
      </View>

      {/* Create Order Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Create New Order</Text>

        <TextInput
          style={styles.input}
          placeholder="Product Details"
          value={productDetails}
          onChangeText={setProductDetails}
          multiline
          numberOfLines={3}
        />

        <TextInput
          style={styles.input}
          placeholder="Product Image URL"
          value={productImage}
          onChangeText={setProductImage}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleCreateOrder}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating Order...' : 'Create Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Status Check */}
      {lastOrderId && (
        <PaymentStatusChecker orderId={lastOrderId} />
      )}

      {/* Orders List */}
      <View style={styles.ordersContainer}>
        <View style={styles.ordersHeader}>
          <Text style={styles.sectionTitle}>All Orders</Text>
          <TouchableOpacity
            style={[styles.button, styles.smallButton]}
            onPress={loadOrders}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <Text style={styles.noOrders}>No orders found</Text>
        ) : (
          orders.map((order, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.orderId}>Order #{order.orderId}</Text>
              <Text style={styles.orderDetails} numberOfLines={2}>
                {order.productDetails}
              </Text>
              <Text style={styles.orderImage} numberOfLines={1}>
                {order.productImage}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Owner Functions */}
      <View style={styles.ownerContainer}>
        <Text style={styles.sectionTitle}>Owner Functions</Text>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleWithdraw}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Withdraw Funds</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Payment Status Checker Component
const PaymentStatusChecker: React.FC<{ orderId: number }> = ({ orderId }) => {
  const { paymentStatus, isChecking } = useTonOrder(orderId);

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.sectionTitle}>Payment Status - Order #{orderId}</Text>

      {isChecking ? (
        <Text style={styles.statusText}>Checking payment status...</Text>
      ) : paymentStatus ? (
        <View style={styles.statusInfo}>
          <Text style={[
            styles.statusText,
            { color: paymentStatus.isPaid ? '#4CAF50' : '#F44336' }
          ]}>
            Status: {paymentStatus.isPaid ? '✅ PAID' : '⏳ PENDING'}
          </Text>

          {paymentStatus.transactionHash && (
            <Text style={styles.txHash}>
              TX: {paymentStatus.transactionHash}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.statusText}>Unable to check status</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  ordersContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noOrders: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  orderItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderImage: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  ownerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  statusInfo: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  txHash: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default TonOrderComponent;
