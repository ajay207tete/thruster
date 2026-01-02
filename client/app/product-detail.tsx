import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  sizes: ('S' | 'M' | 'L')[];
  colors: string[];
  category: string;
  stock: number;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { state: cartState, addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product from backend API:', id);
        const data = await apiService.getProductById(id as string);
        console.log('Fetched product:', data);
        setProduct(data);

        // Set default selections
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (!selectedSize && product.sizes.length > 0) {
      Alert.alert('Please select a size');
      return;
    }

    if (!selectedColor && product.colors.length > 0) {
      Alert.alert('Please select a color');
      return;
    }

    if (selectedQuantity < 1) {
      Alert.alert('Please select a quantity of at least 1');
      return;
    }

    try {
      await addToCart(product._id, selectedQuantity, selectedSize, selectedColor);
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading product...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>Product not found</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#00ff00" />
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
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
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Product Details</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartButton}>
          <Ionicons name="cart" size={24} color="#00ff00" />
          {cartState.cart?.items && cartState.cart.items.length > 0 && (
            <View style={styles.cartBadge}>
              <ThemedText style={styles.cartBadgeText}>{cartState.cart.items.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="shirt" size={80} color="#00ff00" />
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <ThemedText style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={styles.productPrice}>${product.price}</ThemedText>
          <ThemedText style={styles.productDescription}>{product.description}</ThemedText>

          <View style={styles.optionsContainer}>
            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.optionGroup}>
                <ThemedText style={styles.optionLabel}>Size:</ThemedText>
                <View style={styles.optionButtons}>
                  {product.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.optionButton,
                        selectedSize === size && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <ThemedText style={[
                        styles.optionText,
                        selectedSize === size && styles.optionTextSelected
                      ]}>
                        {size}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {product.colors && product.colors.length > 0 && (
              <View style={styles.optionGroup}>
                <ThemedText style={styles.optionLabel}>Color:</ThemedText>
                <View style={styles.optionButtons}>
                  {product.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.optionButton,
                        selectedColor === color && styles.optionButtonSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <ThemedText style={[
                        styles.optionText,
                        selectedColor === color && styles.optionTextSelected
                      ]}>
                        {color}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.optionGroup}>
              <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                >
                  <Ionicons name="remove" size={16} color="#00ff00" />
                </TouchableOpacity>
                <ThemedText style={styles.quantityText}>{selectedQuantity}</ThemedText>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setSelectedQuantity(selectedQuantity + 1)}
                >
                  <Ionicons name="add" size={16} color="#00ff00" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color="#000000" />
            <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#00ff00',
    marginLeft: 8,
    fontSize: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'SpaceMono',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
  },
  productDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'SpaceMono',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 12,
    fontFamily: 'SpaceMono',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#00ff00',
  },
  optionText: {
    fontSize: 14,
    color: '#00ff00',
    fontFamily: 'SpaceMono',
  },
  optionTextSelected: {
    color: '#000000',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    minWidth: 30,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  addToCartButton: {
    backgroundColor: '#00ff00',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  addToCartText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    fontFamily: 'SpaceMono',
  },
});
