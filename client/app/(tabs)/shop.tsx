
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { tonService } from '@/services/tonService-updated';
import Header from '@/components/Header';

export interface Product {
  id: string;
  title: string;
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    console.log("Shop mounted");
    checkWalletConnection();
    fetchProducts();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const address = tonService.getWalletAddress();
      if (address) {
        setWalletAddress(address);
        console.log('Shop Page - Wallet Address:', address);
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      console.log(`Shop: Fetching products from backend API (page ${page})...`);
      console.log('Shop: API base URL:', process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5002/api');

      const data = await apiService.getProducts(page, 10); // 10 products per page
      console.log('Shop: Raw API response:', data);
      console.log('Shop: Response type:', typeof data);

      // Add response guard to prevent undefined.name errors
      if (!Array.isArray(data) && !data.products) {
        console.error('Shop: Invalid API response format - expected array or object with products property');
        throw new Error('Invalid API response format');
      }

      // Check if response has the new pagination structure
      if (data.products && Array.isArray(data.products)) {
        console.log('Shop: Using paginated response format');
        console.log('Shop: Products length:', data.products.length);
        console.log('Shop: Pagination info:', data.pagination);

        // Filter out undefined/null products and normalize product data from backend to match frontend interface
        const processedProducts = data.products
          .filter((product: any) => product && typeof product === 'object')
          .map((product: any, index: number) => {
            console.log(`Shop: Processing product ${index}:`, product);
            return {
              id: product._id || product.id || `product-${index}`,
              title: product.name || 'Unnamed Product',
              description: product.description || 'No description available',
              price: product.price || 0,
              image: product.imageUrl || null,
              sizes: Array.isArray(product.sizes) ? product.sizes : [],
              colors: Array.isArray(product.colors) ? product.colors : [],
              category: product.category || 'General',
              stock: product.stock || 0
            };
          });

        console.log('Shop: Processed products array length:', processedProducts.length);

        if (append) {
          setProducts(prev => [...prev, ...processedProducts]);
        } else {
          setProducts(processedProducts);
        }

        setCurrentPage(data.pagination.currentPage);
        setHasNextPage(data.pagination.hasNextPage);
        setTotalProducts(data.pagination.totalProducts);

        console.log('Shop: Products set in state successfully - Products fetched → Products rendered');
      } else if (Array.isArray(data)) {
        // Fallback for old format (direct array)
        console.log('Shop: Using legacy response format (direct array)');
        console.log('Shop: Products length:', data.length);

        if (data.length === 0) {
          console.log('Shop: No products found in database');
        } else {
          console.log('Shop: First product sample:', data[0]);
        }

        // Filter out undefined/null products and normalize product data from backend to match frontend interface
        const processedProducts = data
          .filter((product: any) => product && typeof product === 'object')
          .map((product: any, index: number) => {
            console.log(`Shop: Processing product ${index}:`, product);
            return {
              id: product._id || product.id || `product-${index}`,
              title: product.name || 'Unnamed Product',
              description: product.description || 'No description available',
              price: product.price || 0,
              image: product.imageUrl || null,
              sizes: Array.isArray(product.sizes) ? product.sizes : [],
              colors: Array.isArray(product.colors) ? product.colors : [],
              category: product.category || 'General',
              stock: product.stock || 0
            };
          });

        console.log('Shop: Processed products array length:', processedProducts.length);
        console.log('Shop: Setting products in state...');
        setProducts(processedProducts);
        setCurrentPage(1);
        setHasNextPage(false); // Assume no pagination in legacy mode
        setTotalProducts(processedProducts.length);
        console.log('Shop: Products set in state successfully - Products fetched → Products rendered');
      } else {
        console.error('Shop: Invalid response format - expected array or paginated object, got:', data);
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Shop: Failed to fetch backend products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (hasNextPage && !loadingMore) {
      const nextPage = currentPage + 1;
      console.log(`Shop: Loading more products - next page: ${nextPage}`);
      fetchProducts(nextPage, true);
    }
  };

  useEffect(() => {
    console.log('React state after setProducts:', products);
  }, [products]);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = async (product: Product) => {
    const size = selectedSize[product.id] || (product.sizes.length > 0 ? product.sizes[0] : '');
    const color = selectedColor[product.id] || (product.colors.length > 0 ? product.colors[0] : '');
    const quantity = selectedQuantity[product.id] || 1;

    if (quantity < 1) {
      alert('Please select a quantity of at least 1.');
      return;
    }

    await addToCart(product.id, quantity, size, color);
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
        <ThemedText style={styles.productName}>{item.title}</ThemedText>
        <ThemedText style={styles.productDescription}>{item.description}</ThemedText>
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
                    selectedSize[item.id] === size && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectSize(item.id, size)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    selectedSize[item.id] === size && styles.optionTextSelected
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
                    selectedColor[item.id] === color && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectColor(item.id, color)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    selectedColor[item.id] === color && styles.optionTextSelected
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
                  [item.id]: Math.max(1, (prev[item.id] || 1) - 1),
                }))}
              >
                <Ionicons name="remove" size={16} color="#00ff00" />
              </TouchableOpacity>
              <ThemedText style={styles.quantityText}>{selectedQuantity[item.id] || 1}</ThemedText>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity((prev) => ({
                  ...prev,
                  [item.id]: (prev[item.id] || 1) + 1,
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

  if (walletLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <ThemedText style={styles.loadingText}>Checking wallet...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={true} />

      <View style={styles.content}>
        {selectedProduct ? (
          <ScrollView style={styles.productDetailContainer}>
            <View style={styles.productDetailHeader}>
              <TouchableOpacity onPress={handleCloseProductDetail} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#00ff00" />
              </TouchableOpacity>
            </View>
            <View style={styles.productDetailContent}>
              <Image
                source={{ uri: selectedProduct.image || undefined }}
                style={styles.productDetailImage}
                resizeMode="contain"
              />
              <ThemedText style={styles.productDetailName}>{selectedProduct.title}</ThemedText>
              <ThemedText style={styles.productDetailDescription}>{selectedProduct.description}</ThemedText>
              <ThemedText style={styles.productDetailPrice}>${selectedProduct.price}</ThemedText>
              <ThemedText style={styles.productDetailCategory}>Category: {selectedProduct.category}</ThemedText>
              <ThemedText style={styles.productDetailStock}>Stock: {selectedProduct.stock}</ThemedText>
              <TouchableOpacity style={styles.addToCartButton} onPress={() => handleAddToCart(selectedProduct)}>
                <Ionicons name="cart" size={20} color="#000000" />
                <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : loading ? (
          <View style={styles.loadingState}>
            <Ionicons name="refresh" size={60} color="#00ff00" />
            <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle" size={60} color="#ff0000" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setError(null);
              setLoading(true);
              // Re-fetch products
              const fetchProducts = async () => {
                try {
                  console.log('Retrying to fetch products from backend API...');
                  const data = await apiService.getProducts();
                  console.log('Fetched products:', data);
                  console.log('Number of products:', data.products.length);

                  const processedProducts = data.products
                    .filter((product: any) => product && typeof product === 'object')
                    .map((product: any, index: number) => ({
                      id: product._id || product.id || `product-${index}`,
                      title: product.name || 'Unnamed Product',
                      description: product.description || 'No description available',
                      price: product.price || 0,
                      image: product.imageUrl || null,
                      sizes: Array.isArray(product.sizes) ? product.sizes : [],
                      colors: Array.isArray(product.colors) ? product.colors : [],
                      category: product.category || 'General',
                      stock: product.stock || 0
                    }));

                  setProducts(processedProducts);
                } catch (retryError) {
                  console.error('Failed to retry fetching products:', retryError);
                  setError('Failed to load products. Please try again.');
                } finally {
                  setLoading(false);
                }
              };
              fetchProducts();
            }}>
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : Array.isArray(products) && products.length > 0 ? (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              hasNextPage ? (
                <View style={styles.loadMoreContainer}>
                  {loadingMore ? (
                    <View style={styles.loadingMore}>
                      <ActivityIndicator size="small" color="#00ff00" />
                      <ThemedText style={styles.loadingMoreText}>Loading more products...</ThemedText>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreProducts}>
                      <Ionicons name="add-circle" size={20} color="#000000" />
                      <ThemedText style={styles.loadMoreText}>Load More Products</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
          />
        ) : !loading && Array.isArray(products) ? (
          <View style={styles.emptyState}>
            <Ionicons name="shirt" size={80} color="#333333" />
            <ThemedText style={styles.emptyText}>No products available</ThemedText>
          </View>
        ) : (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle" size={60} color="#ff0000" />
            <ThemedText style={styles.errorText}>Failed to load products data</ThemedText>
          </View>
        )}
      </View>
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
    marginBottom: 4,
    fontFamily: 'SpaceMono',
  },
  productDescription: {
    fontSize: 14,
    color: '#cccccc',
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 18,
    color: '#00ff00',
    marginTop: 16,
    fontFamily: 'SpaceMono',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  retryButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  retryText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  productDetailContainer: {
    flex: 1,
  },
  productDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  closeButton: {
    padding: 10,
  },
  productDetailContent: {
    padding: 20,
    alignItems: 'center',
  },
  productDetailImage: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  productDetailDescription: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  productDetailPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  productDetailCategory: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 5,
    fontFamily: 'SpaceMono',
  },
  productDetailStock: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  loadMoreButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loadMoreText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'SpaceMono',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingMoreText: {
    color: '#00ff00',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'SpaceMono',
  },
});
