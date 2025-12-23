import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { CheckoutFlow } from '../../components/CheckoutFlow';
import { useCart } from '../../contexts/CartContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { state: cartState } = useCart();
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
    </View>
  );

  const handlePlaceOrder = () => {
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode || !shippingCountry) {
      Alert.alert('Error', 'Please fill in all shipping details.');
      return;
    }
    handleProceedToPayment();
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
        <ThemedText style={styles.placeOrderButtonText}>Proceed to Payment</ThemedText>
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
  orderText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#00ff00',
    fontFamily: 'SpaceMono',
    marginBottom: 15,
  },
  placeOrderButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
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
});
