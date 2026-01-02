import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, Image, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { CheckoutFlow } from '../../components/CheckoutFlow';
import { useCart } from '../../contexts/CartContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { state: cartState, removeFromCart } = useCart();
  const cart = cartState.cart;
  const { cartItems: cartItemsParam } = useLocalSearchParams();

  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);
  const [urlCartItems, setUrlCartItems] = useState<any[]>([]);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

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
    }
  }, [cartItemsParam, cart]);

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

  const handleProceedToPayment = () => {
    setShowCheckoutFlow(true);
  };

  if (showCheckoutFlow) {
    const cartItemsToUse = urlCartItems.length > 0 ? urlCartItems : (cart?.items || []);
    return (
      <View style={styles.container}>
        <CheckoutFlow
          cartItems={transformCartItemsToOrderItems(cartItemsToUse)}
          onOrderComplete={handleOrderComplete}
          onCancel={handleCancelCheckout}
        />
      </View>
    );
  }

  const cartItemsToUse = urlCartItems.length > 0 ? urlCartItems : (cart?.items || []);
  const totalAmount = cartItemsToUse.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);

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
        <ThemedText style={styles.productInfo}>Size: {item.size || 'N/A'}</ThemedText>
        <ThemedText style={styles.productInfo}>Color: {item.color || 'N/A'}</ThemedText>
        <ThemedText style={styles.productInfo}>Qty: {item.quantity || 1}</ThemedText>
        <ThemedText style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveItem(item._id)}
      >
        <Ionicons name="trash" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      // Update local state
      setUrlCartItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const handlePlaceOrder = () => {
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode || !shippingCountry) {
      Alert.alert('Error', 'Please fill in all shipping details.');
      return;
    }
    // Navigate to payment page with cart items and shipping details
    const cartItemsToUse = urlCartItems.length > 0 ? urlCartItems : (cart?.items || []);
    const orderData = {
      cartItems: cartItemsToUse,
      shippingDetails: {
        name: shippingName,
        address: shippingAddress,
        city: shippingCity,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      },
      totalAmount: cartItemsToUse.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
    };
    router.push({
      pathname: '/payment',
      params: {
        orderData: encodeURIComponent(JSON.stringify(orderData)),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#00ff00" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <ThemedText style={styles.headerText}>CHECKOUT</ThemedText>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
        {cartItemsToUse.length > 0 ? (
          <FlatList
            data={cartItemsToUse}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderCartItem}
            scrollEnabled={false}
          />
        ) : (
          <ThemedText style={styles.emptyCart}>No items in cart</ThemedText>
        )}
        <View style={styles.totalContainer}>
          <ThemedText style={styles.totalText}>Total: ${totalAmount.toFixed(2)}</ThemedText>
        </View>
      </View>

      {/* Shipping Details */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Shipping Details</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#00ff00"
          value={shippingName}
          onChangeText={setShippingName}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor="#00ff00"
          value={shippingAddress}
          onChangeText={setShippingAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#00ff00"
          value={shippingCity}
          onChangeText={setShippingCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          placeholderTextColor="#00ff00"
          value={shippingPostalCode}
          onChangeText={setShippingPostalCode}
        />
        <TextInput
          style={styles.input}
          placeholder="Country"
          placeholderTextColor="#00ff00"
          value={shippingCountry}
          onChangeText={setShippingCountry}
        />
      </View>

      {/* Place Order Button */}
      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <View style={styles.placeOrderButtonGlow}>
          <ThemedText style={styles.placeOrderButtonText}>Proceed to Payment</ThemedText>
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

  // Animated Grid Background with Particles
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLines: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderStyle: 'dashed',
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

  // Scroll Content
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
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

  // Cyberpunk Input Fields
  input: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 15,
    paddingVertical: isMobile ? 12 : 15,
    paddingHorizontal: isMobile ? 20 : 25,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: isMobile ? 14 : 16,
    marginBottom: 15,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
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

  // Cyberpunk Delete Button
  deleteButton: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },

  // Cyberpunk Place Order Button
  placeOrderButton: {
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
  placeOrderButtonGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 18 : 22,
    paddingHorizontal: isMobile ? 30 : 40,
  },
  placeOrderButtonText: {
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
