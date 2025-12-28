import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';

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
  const { state: cartState, addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from backend API...');
        const data = await apiService.getProducts();
        console.log('Fetched products:', data);
        console.log('Number of products:', data.length);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch backend products:', error);
      }
    };
    fetchProducts();
  }, []);

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

    await addToCart(product._id, quantity, size, color);
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId: string, color: string) => {
    setSelectedColor((prev) => ({ ...prev, [productId]: color }));
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => handleViewProduct(item)} style={styles.productImageContainer}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.productImage}
            resizeMode="contain"
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="shirt" size={60} color="#00ff00" />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>${item.price}</ThemedText>

        <View style={styles.optionsContainer}>
          <View style={styles.optionGroup}>
            <ThemedText style={styles.optionLabel}>Size:</ThemedText>
            <View style={styles.optionButtons}>
              {item.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    selectedSize[item._id] === size && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectSize(item._id, size)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    selectedSize[item._id] === size && styles.optionTextSelected
                  ]}>
                    {size}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <ThemedText style={styles.optionLabel}>Color:</ThemedText>
            <View style={styles.optionButtons}>
              {item.colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.optionButton,
                    selectedColor[item._id] === color && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectColor(item._id, color)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    selectedColor[item._id] === color && styles.optionTextSelected
                  ]}>
                    {color}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <ThemedText style={styles.optionLabel}>Qty:</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity((prev) => ({
                  ...prev,
                  [item._id]: Math.max(1, (prev[item._id] || 1) - 1),
                }))}
              >
                <Ionicons name="remove" size={16} color="#00ff00" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{selectedQuantity[item._id] || 1}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity((prev) => ({
                  ...prev,
                  [item._id]: (prev[item._id] || 1) + 1,
                }))}
              >
                <Ionicons name="add" size={16} color="#00ff00" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(item)}>
          <Ionicons name="cart" size={20} color="#000000" />
          <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00ff00" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerSection}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={() => router.push('/cart')} style={styles.cartButton}>
            <Ionicons name="cart" size={30} color="#00ff00" />
            {cartState.cart?.items && cartState.cart.items.length > 0 && (
              <View style={styles.cartBadge}>
                <ThemedText style={styles.cartBadgeText}>{cartState.cart.items.length}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.subtitle}>
          Discover cutting-edge fashion and accessories
        </ThemedText>

        {products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="shirt" size={80} color="#333333" />
            <ThemedText style={styles.emptyText}>No products available</ThemedText>
          </View>
        )}
      </View>
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
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'SpaceMono',
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
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
  },
  productList: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    marginBottom: 20,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
    overflow: 'hidden',
    width: '48%',
    shadowColor: '#00ff00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  productImageContainer: {
    width: '100%',
    height: 250,
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
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 16,
    fontFamily: 'SpaceMono',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionGroup: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
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
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    minWidth: 24,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  addToCartButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'SpaceMono',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    fontFamily: 'SpaceMono',
  },
});
