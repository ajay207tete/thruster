import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PageHeader from '@/components/PageHeader';
import { apiService, Order } from '@/services/api';

export default function MyOrderScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserOrders('user123'); // In a real app, get from user authentication
      setOrders(response.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <ThemedText style={styles.orderId}>Order #{item._id.slice(-8)}</ThemedText>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <ThemedText style={styles.statusText}>{item.status}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.orderDate}>
        {new Date(item.orderDate).toLocaleDateString()}
      </ThemedText>
      <ThemedText style={styles.totalAmount}>Total: ${item.totalAmount.toFixed(2)}</ThemedText>
      <ThemedText style={styles.paymentStatus}>
        Payment: {item.paymentStatus} ({item.paymentCurrency})
      </ThemedText>
      <View style={styles.itemsContainer}>
        {item.items.map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <ThemedText style={styles.itemName}>
              {orderItem.product.name} x{orderItem.quantity}
            </ThemedText>
            <ThemedText style={styles.itemPrice}>${orderItem.price.toFixed(2)}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'shipped':
        return styles.statusShipped;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader
          title="My Orders"
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <ThemedText style={styles.loadingText}>Loading orders...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader
          title="My Orders"
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff0000" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>My Orders</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt" size={80} color="#333333" />
          <ThemedText style={styles.emptyText}>No orders yet.</ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/shop')} style={styles.shopButton}>
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 32,
  },
  title: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
  },
  placeholder: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  orderItem: {
    backgroundColor: '#111111',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  orderDate: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  totalAmount: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 4,
  },
  paymentStatus: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 8,
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    flex: 1,
  },
  itemPrice: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  statusPending: {
    backgroundColor: '#ffaa00',
  },
  statusConfirmed: {
    backgroundColor: '#00aaff',
  },
  statusShipped: {
    backgroundColor: '#aa00ff',
  },
  statusDelivered: {
    backgroundColor: '#00ff00',
  },
  statusCancelled: {
    backgroundColor: '#ff0000',
  },
  statusDefault: {
    backgroundColor: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
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
  list: {
    padding: 20,
    paddingBottom: 100,
  },
});
