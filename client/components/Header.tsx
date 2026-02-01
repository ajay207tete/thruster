import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { ThemedText } from '@/components/ThemedText';

interface HeaderProps {
  backgroundColor?: string;
  showCartIcon?: boolean;
  showBackButton?: boolean;
  title?: string;
  onBackPress?: () => void;
}

export default function Header({
  backgroundColor = '#000000',
  showCartIcon = true,
  showBackButton = true,
  title = 'THRUSTER',
  onBackPress
}: HeaderProps) {
  const { state: cartState } = useCart();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00ff00" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.centerSection}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>
      <View style={styles.rightSection}>
        {showCartIcon && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.cartButton}>
            <Ionicons name="cart" size={30} color="#00ff00" />
            {cartState.cart?.items && cartState.cart.items.length > 0 && (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>{cartState.cart.items.length}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
});
