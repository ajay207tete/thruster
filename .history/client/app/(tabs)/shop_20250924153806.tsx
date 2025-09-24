import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getShopProducts } from '@/services/sanityClient';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  sizes: ('S' | 'M' | 'L')[];
  colors: string[];
  category: string;
  stock: number;
  size?: string;
  color?: string;
  quantity?: number;
}

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from Sanity...');
        const data = await getShopProducts();
        console.log('Fetched products:', data);
        console.log('Number of products:', data.length);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch Sanity products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleViewProduct = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: {
        id: product._id,
      },
    });
  };

  const handleAddToCart = async (product: Product) => {
    const size = selectedSize[product._id] || (product.sizes.length > 0 ? product.sizes[0] : '');
    const color = selectedColor[product._id] || (product.colors.length > 0 ? product.colors[0] : '');
    const quantity = selectedQuantity[product._id] || 1;

    if (quantity < 1) {
      alert('Please select a quantity of at least 1.');
      return;
    }

    const newCartItems = [...cartItems];
    const existingItemIndex = newCartItems.findIndex(
      (item) => item._id === product._id && item.size === size && item.color === color
    );
    if (existingItemIndex !== -1) {
      // Update quantity for existing item
      newCartItems[existingItemIndex].quantity = (newCartItems[existingItemIndex].quantity || 1) + quantity;
    } else {
      newCartItems.push({ ...product, size, color, quantity });
    }

    setCartItems(newCartItems);
    await AsyncStorage.setItem('cartItems', JSON.stringify(newCartItems));
  };

  const handleGoToCart = () => {
    router.push({
      pathname: '/cart',
      params: { cartItems: encodeURIComponent(JSON.stringify(cartItems)) },
    });
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId: string, color: string) => {
    setSelectedColor((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#007bff" onPress={handleBackPress} />
        <View style={styles.headerTitle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>
        <TouchableOpacity onPress={handleGoToCart} style={styles.cartButton}>
          <Ionicons name="cart" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ThemedView style={styles.content}>
        <ThemedText style={styles.shopTitle}>Clothing Shop</ThemedText>
        <ThemedText style={styles.shopDescription}>
          Discover the latest fashion. Upgrade your style with modern designs.
        </ThemedText>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {products.map((product) => (
            <View key={product._id} style={styles.shopItem}>
              <TouchableOpacity onPress={() => handleViewProduct(product)}>
                {product.image ? (
                  <>
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="contain"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                    <ThemedText style={styles.imageUrlText}>{product.image}</ThemedText>
                  </>
                ) : (
                  <Ionicons name="shirt" size={50} color="#007bff" />
                )}
              </TouchableOpacity>
            <ThemedText style={styles.itemText}>{product.name}</ThemedText>
            <ThemedText style={styles.priceText}>${product.price}</ThemedText>

            <View style={styles.optionsContainer}>
              <View style={styles.optionGroup}>
                <ThemedText style={styles.optionLabel}>Size:</ThemedText>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      selectedSize[product._id] === size && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSelectSize(product._id, size)}
                  >
                    <ThemedText style={styles.optionText}>{size}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.optionGroup}>
                <ThemedText style={styles.optionLabel}>Color:</ThemedText>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.optionButton,
                      selectedColor[product._id] === color && styles.optionButtonSelected,
                    ]}
                    onPress={() => handleSelectColor(product._id, color)}
                  >
                    <ThemedText style={styles.optionText}>{color}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.optionGroup}>
                <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setSelectedQuantity((prev) => ({
                    ...prev,
                    [product._id]: Math.max(1, (prev[product._id] || 1) - 1),
                  }))}
                >
                  <ThemedText style={styles.optionText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.quantityText}>{selectedQuantity[product._id] || 1}</ThemedText>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setSelectedQuantity((prev) => ({
                    ...prev,
                    [product._id]: (prev[product._id] || 1) + 1,
                  }))}
                >
                  <ThemedText style={styles.optionText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(product)}>
              <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
        </ScrollView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 50,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  shopTitle: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 20,
  },
  shopDescription: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  shopItem: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '100%',
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  itemText: {
    color: '#333333',
    fontSize: 16,
    marginBottom: 5,
  },
  priceText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  optionGroup: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  optionLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginBottom: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#000000',
  },
  optionText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    minWidth: 20,
    textAlign: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  imageUrlText: {
    fontSize: 10,
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  cartButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    alignItems: 'center',
    minHeight: 600,
    width: '100%',
  },
});
