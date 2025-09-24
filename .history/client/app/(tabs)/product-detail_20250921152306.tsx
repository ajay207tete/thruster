import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Text, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PageHeader from '@/components/PageHeader';
import { getShopProductById } from '@/services/sanityClient';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  sizes: string[];
  colors: string[];
  category: string;
  stock: number;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      let id = params?.id;
      if (Array.isArray(id)) {
        id = id[0];
      }
      if (!id) {
        setHasError(true);
        setErrorMessage('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching product with ID:', id);
        const data = await getShopProductById(id);
        console.log('Fetched product data:', data);
        setProduct(data);
        if (data && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data && data.colors.length > 0) setSelectedColor(data.colors[0]);
      } catch (error) {
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch product');
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  if (hasError) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title="PRODUCT DETAIL" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>An error occurred: {errorMessage}</Text>
        </View>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title="PRODUCT DETAIL" />
        <View style={styles.content}>
          <ThemedText style={styles.cyberText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <PageHeader title="PRODUCT DETAIL" />
        <View style={styles.content}>
          <ThemedText style={styles.cyberText}>Product not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleBuy = () => {
    router.push({
      pathname: '/checkout',
      params: {
        productId: product._id,
        size: selectedSize,
        color: selectedColor,
      },
    });
  };

  const handleAddToCart = () => {
    const cartItem = {
      _id: product._id + selectedSize + selectedColor,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    };

    router.push({
      pathname: '/cart',
      params: {
        cartItems: JSON.stringify([cartItem]),
      },
    });

    Alert.alert('Added to Cart', `${product.name} (${selectedSize}, ${selectedColor}) has been added to your cart.`);
  };

  return (
    <ThemedView style={styles.container}>
      <PageHeader title="PRODUCT DETAIL" />

      <ScrollView contentContainerStyle={styles.content}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.productImage} />
        ) : (
          <Ionicons name="shirt" size={100} color="#00ff00" style={styles.productIcon} />
        )}
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={styles.productPrice}>${product.price}</ThemedText>
        <ThemedText style={styles.productDescription}>{product.description}</ThemedText>

        <ThemedText style={styles.sectionTitle}>Choose Size</ThemedText>
        <View style={styles.optionsContainer}>
          {product.sizes.map((size: string) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.optionButton,
                selectedSize === size && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <ThemedText style={styles.optionText}>{size}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>Choose Color</ThemedText>
        <View style={styles.optionsContainer}>
          {product.colors.map((color: string) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.optionButton,
                selectedColor === color && styles.optionButtonSelected,
              ]}
              onPress={() => setSelectedColor(color)}
            >
              <ThemedText style={styles.optionText}>{color}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
          <ThemedText style={styles.buyButtonText}>Buy</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <ThemedText style={styles.addToCartButtonText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 50,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  cyberText: {
    color: '#00ff00',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  productIcon: {
    marginVertical: 20,
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  productName: {
    color: '#00ff00',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    color: '#00ff00',
    fontSize: 24,
    marginVertical: 10,
    fontFamily: 'SpaceMono',
  },
  productDescription: {
    color: '#ffffff',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: '600',
  },
  addToCartButton: {
    marginTop: 20,
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  addToCartButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  optionButtonSelected: {
    backgroundColor: '#00ff00',
  },
  optionText: {
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  buyButton: {
    marginTop: 30,
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buyButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  backButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  backButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
});
