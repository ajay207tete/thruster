import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Product } from '@/app/(tabs)/shop';

export default function CartScreen() {
  const { cartItems: cartItemsParam } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

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
              // Force reload cart items to update UI
              await loadCartItems();
            } catch (error) {
              console.error('Error removing item from cart:', error);
              Alert.alert('Error', 'Failed to remove item from cart. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleBackToShop = () => {
    router.back();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your cart before checking out.');
      return;
    }
    // Navigate to checkout screen
    router.push({
      pathname: '/checkout',
      params: { cartItems: JSON.stringify(cartItems) },
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2);
  };

  const handleQuantityChange = async (id: string, delta: number) => {
    const updatedItems = cartItems.map(item =>
      item._id === id
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) }
        : item
    );
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleSizeChange = async (id: string, size: string) => {
    const updatedItems = cartItems.map(item =>
      item._id === id
        ? { ...item, size }
        : item
    );
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleColorChange = async (id: string, color: string) => {
    const updatedItems = cartItems.map(item =>
      item._id === id
        ? { ...item, color }
        : item
    );
    setCartItems(updatedItems);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };
  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.cartItem}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <Ionicons name="shirt" size={40} color="#00ff00" style={styles.itemIcon} />
      )}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemText}>{item.name}</ThemedText>
        {editingItem === item._id ? (
          <>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Size:</ThemedText>
              {item.sizes?.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    item.size === size && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSizeChange(item._id, size)}
                >
                  <ThemedText style={styles.optionText}>{size}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Color:</ThemedText>
              {item.colors?.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.optionButton,
                    item.color === color && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleColorChange(item._id, color)}
                >
                  <ThemedText style={styles.optionText}>{color}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item._id, -1)}
              >
                <ThemedText style={styles.optionText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{item.quantity || 1}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item._id, 1)}
              >
                <ThemedText style={styles.optionText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <ThemedText style={styles.itemDetailsText}>Size: {item.size || 'N/A'}</ThemedText>
            <ThemedText style={styles.itemDetailsText}>Color: {item.color || 'N/A'}</ThemedText>
            <ThemedText style={styles.itemDetailsText}>Quantity: {item.quantity || 1}</ThemedText>
          </>
        )}
      </View>
      <ThemedText style={styles.priceText}>${(item.price * (item.quantity || 1)).toFixed(2)}</ThemedText>
      <TouchableOpacity
        onPress={() => setEditingItem(editingItem === item._id ? null : item._id)}
        style={styles.editButton}
      >
        <Ionicons name={editingItem === item._id ? "checkmark" : "create"} size={24} color="#00ff00" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
        <Ionicons name="trash" size={24} color="#ff0000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToShop} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>Your Cart</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart" size={80} color="#333333" />
          <ThemedText style={styles.emptyText}>Your cart is empty.</ThemedText>
          <TouchableOpacity onPress={handleBackToShop} style={styles.shopButton}>
            <ThemedText style={styles.shopButtonText}>Go to Shop</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          {/* Total and Checkout */}
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <ThemedText style={styles.totalText}>Total: ${getTotalPrice()}</ThemedText>
            </View>
            <TouchableOpacity onPress={handleCheckout} style={styles.checkoutButton}>
              <ThemedText style={styles.checkoutButtonText}>Checkout</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  list: {
    padding: 20,
    paddingBottom: 100,
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
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  itemIcon: {
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
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
  editButton: {
    padding: 6,
  },
  removeButton: {
    padding: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
  },
  totalContainer: {
    marginBottom: 15,
  },
  totalText: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  optionLabel: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginRight: 10,
    minWidth: 50,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#00ff00',
  },
  optionText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 5,
  },
  quantityText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    minWidth: 20,
    textAlign: 'center',
  },
});
