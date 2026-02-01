import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PageHeader from '@/components/PageHeader';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const { state: cartState, updateCartItem, removeFromCart } = useCart();
  const [editingItem, setEditingItem] = useState<string | null>(null);

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
              await removeFromCart(id);
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
    if (!cartState.cart || cartState.cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Add some items to your cart before checking out.');
      return;
    }
    // Navigate to checkout screen
    router.push('/checkout');
  };

  const getTotalPrice = () => {
    return cartState.cart ? cartState.cart.totalPrice.toFixed(2) : '0.00';
  };

  const handleQuantityChange = async (itemId: string, delta: number) => {
    const item = cartState.cart?.items.find(item => item._id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleSizeChange = async (itemId: string, size: string) => {
    // Note: Size change would require updating the cart item with new size
    // This might need a new method in CartContext or API call
    Alert.alert('Info', 'Size change not implemented yet');
  };

  const handleColorChange = async (itemId: string, color: string) => {
    // Note: Color change would require updating the cart item with new color
    // This might need a new method in CartContext or API call
    Alert.alert('Info', 'Color change not implemented yet');
  };
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      {item.product?.image ? (
        <Image source={{ uri: item.product.image }} style={styles.itemImage} />
      ) : (
        <Ionicons name="shirt" size={40} color="#00ff00" style={styles.itemIcon} />
      )}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemText}>{item.product?.name || 'Product'}</ThemedText>
        {editingItem === item._id ? (
          <>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Size:</ThemedText>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  item.size === 'S' && styles.optionButtonSelected,
                ]}
                onPress={() => handleSizeChange(item._id, 'S')}
              >
                <ThemedText style={styles.optionText}>S</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  item.size === 'M' && styles.optionButtonSelected,
                ]}
                onPress={() => handleSizeChange(item._id, 'M')}
              >
                <ThemedText style={styles.optionText}>M</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  item.size === 'L' && styles.optionButtonSelected,
                ]}
                onPress={() => handleSizeChange(item._id, 'L')}
              >
                <ThemedText style={styles.optionText}>L</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Color:</ThemedText>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  item.color === 'Red' && styles.optionButtonSelected,
                ]}
                onPress={() => handleColorChange(item._id, 'Red')}
              >
                <ThemedText style={styles.optionText}>Red</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  item.color === 'Blue' && styles.optionButtonSelected,
                ]}
                onPress={() => handleColorChange(item._id, 'Blue')}
              >
                <ThemedText style={styles.optionText}>Blue</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item._id, -1)}
              >
                <ThemedText style={styles.optionText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
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
            <ThemedText style={styles.itemDetailsText}>Quantity: {item.quantity}</ThemedText>
          </>
        )}
      </View>
      <ThemedText style={styles.priceText}>${item.price.toFixed(2)}</ThemedText>
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
      <PageHeader
        title="Your Cart"
        onBackPress={handleBackToShop}
      />

      {!cartState.cart || cartState.cart.items.length === 0 ? (
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
            data={cartState.cart.items}
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
