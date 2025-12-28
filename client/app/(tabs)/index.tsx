import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, ScrollView, FlatList, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TonConnectButton from '../../components/TonConnectButton';
import MenuDropdown from '../../components/MenuDropdown';
import { ThemedText } from '@/components/ThemedText';
import { apiService } from '@/services/api';

interface Product {
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

export default function Index() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await apiService.getProducts();
        setProducts(data.slice(0, 4)); // Show first 4 products as featured
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleViewProduct = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { id: product._id },
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => handleViewProduct(item)} style={styles.productCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
      ) : (
        <View style={styles.placeholderImage}>
          <Ionicons name="shirt" size={60} color="#00ff00" />
        </View>
      )}
      <View style={styles.productInfo}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.productPrice}>${item.price}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../assets/images/home.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <MenuDropdown />
        <TonConnectButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.title}>Welcome to Thruster</ThemedText>
            <ThemedText style={styles.subtitle}>
              Experience the future of shopping with our blockchain based commerce platform
            </ThemedText>
          </View>

          {products.length > 0 && (
            <View style={styles.featuredSection}>
              <ThemedText style={styles.featuredTitle}>Featured Products</ThemedText>
              <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={renderProduct}
                numColumns={2}
                contentContainerStyle={styles.productList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/shop')}
            >
              <ThemedText style={styles.ctaButtonText}>Start Shopping</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'SpaceMono',
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#00ff00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'SpaceMono',
  },
  featuredSection: {
    marginBottom: 40,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
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
  productImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
    fontFamily: 'SpaceMono',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'SpaceMono',
  },
});
