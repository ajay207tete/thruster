import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, SearchParams } from 'expo-router';


import { ThemedText } from '@/components/ThemedText';

export default function CheckoutScreen({ params }: { params?: { name?: string; price?: string; size?: string; color?: string } }) {
  const router = useRouter();

  const { name = 'Product', price = '0', size = 'M', color = 'Neon Green' } = params || {};

  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

  const handlePlaceOrder = () => {
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode || !shippingCountry) {
      Alert.alert('Error', 'Please fill in all shipping details.');
      return;
    }
    Alert.alert('Order Placed', `Thank you for your order of ${name} (${size}, ${color})!`);
    router.push('/shop');
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
        <ThemedText style={styles.orderText}>Product: {name}</ThemedText>
        <ThemedText style={styles.orderText}>Size: {size}</ThemedText>
        <ThemedText style={styles.orderText}>Color: {color}</ThemedText>
        <ThemedText style={styles.orderText}>Subtotal: ${price}</ThemedText>
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
        <ThemedText style={styles.placeOrderButtonText}>Place Order</ThemedText>
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
});
