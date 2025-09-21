import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Product } from '@/app/(tabs)/shop';
import { tonService, TonContractConfig } from '@/services/tonService';

// TON Contract Configuration
const contractConfig: TonContractConfig = {
  address: '0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS',
  network: 'testnet',
  endpoint: 'https://testnet.toncenter.com/api/v2'
};

export default function CheckoutScreen() {
  const { cartItems: cartItemsParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  const loadCartItems = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading cart items...');

      // First try to get from URL parameters
      if (cartItemsParam && typeof cartItemsParam === 'string') {
        console.log('Loading from URL params');
        try {
          const decodedParam = decodeURIComponent(cartItemsParam);
          console.log('Decoded param:', decodedParam);

          const parsedItems = JSON.parse(decodedParam);
          console.log('Parsed items:', parsedItems);

          const updatedItems = parsedItems.map((item: any) => ({
            ...item,
            quantity: item.quantity || 1,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          }));
          setCartItems(updatedItems);
          console.log('Cart items loaded from URL:', updatedItems.length);
        } catch (parseError) {
          console.error('Error parsing URL cart items:', parseError);
          // If URL parsing fails, try AsyncStorage
          const storedCart = await AsyncStorage.getItem('cartItems');
          if (storedCart) {
            const parsedItems = JSON.parse(storedCart);
            const updatedItems = parsedItems.map((item: any) => ({
              ...item,
              quantity: item.quantity || 1,
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            }));
            setCartItems(updatedItems);
            console.log('Cart items loaded from storage after URL parse error:', updatedItems.length);
          } else {
            setCartItems([]);
          }
        }
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

    const totalAmount = parseFloat(getTotalPrice());

    Alert.alert(
      'Confirm Payment',
      `You are about to pay $${totalAmount} TON using the smart contract.\n\nContract Address: ${contractConfig.address}\n\nThis will create an order on the blockchain.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'default',
          onPress: async () => {
            await processPayment();
          },
        },
      ]
    );
  };

  const processPayment = async () => {
    try {
      setProcessingPayment(true);

      // Create product details string
      const productDetails = cartItems.map(item =>
        `${item.name} (Size: ${item.size || 'N/A'}, Color: ${item.color || 'N/A'}, Qty: ${item.quantity || 1})`
      ).join('; ');

      // Get first product image or use a default
      const productImage = cartItems[0]?.image || 'https://via.placeholder.com/400x400?text=No+Image';

      const orderData = {
        productDetails,
        productImage
      };

      console.log('Creating order with data:', orderData);

      // Create order on blockchain
      const result = await tonService.createOrder(orderData);

      if (result.success) {
        const orderId = result.orderId;
        console.log('Order created successfully with ID:', orderId);

        Alert.alert(
          'Order Created',
          `Order #${orderId} has been created on the blockchain!\n\nContract: ${contractConfig.address}\n\nPlease send ${getTotalPrice()} TON to the contract address to complete payment.\n\nOnce payment is received, your order will be marked as paid.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear cart after successful order creation
                setCartItems([]);
                AsyncStorage.removeItem('cartItems');
                router.replace('/my-order');
              }
            }
          ]
        );
      } else {
        console.error('Failed to create order:', result.error);
        Alert.alert('Payment Error', `Failed to create order: ${result.error}`);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      Alert.alert('Payment Error', 'An error occurred while processing payment. Please try again.');
    } finally {
      setProcessingPayment(false);
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

          {/* Smart Contract Info */}
          <View style={styles.contractInfo}>
            <ThemedText style={styles.contractTitle}>💎 TON Smart Contract Payment</ThemedText>
            <ThemedText style={styles.contractText}>
              Contract: {contractConfig.address}
            </ThemedText>
            <ThemedText style={styles.contractText}>
              Network: {contractConfig.network}
            </ThemedText>
            <ThemedText style={styles.contractText}>
              Amount: ${getTotalPrice()} TON
            </ThemedText>
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            onPress={handlePayment}
            style={[styles.paymentButton, processingPayment && styles.paymentButtonDisabled]}
            disabled={processingPayment}
          >
            <ThemedText style={styles.paymentButtonText}>
              {processingPayment ? 'Processing...' : '💎 Pay with TON Smart Contract'}
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
  contractInfo: {
    backgroundColor: '#111111',
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  contractTitle: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  contractText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
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
    backgroundColor: '#333333',
    borderColor: '#666666',
  },
  paymentButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
});
