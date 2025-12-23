import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useCart } from '../contexts/CartContext';
import { Product } from './(tabs)/shop';

export default function CartScreen() {
  const { state, removeFromCart } = useCart();

  const handleRemoveItem = async (id: string) => {
    try {
      await removeFromCart(id);
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handleBackToShop = () => {
    router.back();
  };

  const handleProceedToCheckout = () => {
    // Navigate to checkout
    router.push('/checkout');
  };

  const getTotalPrice = () => {
    return state.cart?.items.reduce((total: number, item: any) => total + (item.price * (item.quantity || 1)), 0).toFixed(2) || '0.00';
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {item.product?.image ? (
        <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      ) : (
        <Ionicons name="shirt" size={40} color="#00ff00" style={styles.itemIcon} />
      )}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemText}>{item.product?.name || 'Product'}</ThemedText>
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

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToShop} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Shopping Cart</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {state.cart?.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart" size={80} color="#333333" />
          <ThemedText style={styles.emptyText}>Your cart is empty.</ThemedText>
          <TouchableOpacity onPress={handleBackToShop} style={styles.shopButton}>
            <ThemedText style={styles.shopButtonText}>Continue Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* Cart Items */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Cart Items</ThemedText>
            <FlatList
              data={state.cart?.items}
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

          {/* Checkout Button */}
          <TouchableOpacity
            onPress={handleProceedToCheckout}
            style={styles.checkoutButton}
          >
            <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
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
  checkoutButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
});
