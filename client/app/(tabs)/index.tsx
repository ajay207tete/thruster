import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image, Dimensions, Text, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TonConnectButtonComponent from '../../components/TonConnectButton';
import MenuDropdown from '../../components/MenuDropdown';
import { ThemedText } from '@/components/ThemedText';
import { apiService } from '@/services/api';
import { tonService } from '@/services/tonService-updated';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products from API...');
        const data = await apiService.getProducts();
        console.log('Products fetched successfully:', data?.length || 0);
        setProducts(data.slice(0, 4)); // Show first 4 products as featured
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load featured products. Please check your connection.');
      } finally {
        setLoading(false);
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
    <TouchableOpacity onPress={() => handleViewProduct(item)} style={styles.cyberCard}>
      <View style={styles.cardGlow}>
        <View style={styles.cardBorder}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cyberImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="shirt" size={50} color="#ff0080" />
            </View>
          )}
          <View style={styles.cyberInfo}>
            <Text style={styles.cyberName}>{item.name}</Text>
            <Text style={styles.cyberPrice}>${item.price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.cyberContainer}>
      {/* Animated Grid Background */}
      <View style={styles.gridBackground}>
        <View style={styles.gridLines} />
      </View>

        <View style={styles.cyberHeader}>
        <MenuDropdown />
        <View style={styles.headerGlow}>
          <TonConnectButtonComponent />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cyberScrollContent}>
        {/* Hero Section with Advanced Cyberpunk Styling */}
        <View style={styles.cyberHero}>
          <View style={styles.heroSecondaryGlow} />
          <View style={styles.heroGlowEffect} />
          <View style={styles.dataStream} />
          <Text style={styles.cyberTitle}>THRUSTER</Text>
          <Text style={styles.cyberSubtitle}>NEURAL COMMERCE MATRIX</Text>
          <View style={styles.scanLine} />
        </View>

        {/* Two Column Featured Grids */}
        <View style={styles.twoColumnGridsContainer}>
          {/* Shop Grid */}
          <TouchableOpacity
            style={styles.twoColumnGrid}
            onPress={() => {
              console.log('Wallet connected:', tonService.isWalletConnected());
              if (tonService.isWalletConnected()) {
                router.push('/shop');
              } else {
                setShowWalletModal(true);
              }
            }}
          >
            <View style={styles.gridGlow}>
              <View style={styles.gridBorder}>
                <View style={styles.gridHeader}>
                  <Ionicons name="grid" size={32} color="#00ffff" />
                  <Text style={styles.gridTitle}>SHOP</Text>
                </View>
                <View style={styles.gridContent}>
                  <Text style={styles.gridSubtitle}>EXPLORE PRODUCTS</Text>
                  <Text style={styles.gridDescription}>Browse our neural commerce catalog</Text>
                </View>
                <View style={styles.gridScanLine} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Rewards Grid */}
          <TouchableOpacity
            style={styles.twoColumnGrid}
            onPress={() => router.push('/rewards')}
          >
            <View style={styles.gridGlow}>
              <View style={styles.gridBorder}>
                <View style={styles.gridHeader}>
                  <Ionicons name="gift" size={32} color="#ff0080" />
                  <Text style={styles.gridTitle}>REWARDS</Text>
                </View>
                <View style={styles.gridContent}>
                  <Text style={styles.gridSubtitle}>CLAIM BONUSES</Text>
                  <Text style={styles.gridDescription}>Earn tokens through engagement</Text>
                </View>
                <View style={styles.gridScanLine} />
              </View>
            </View>
          </TouchableOpacity>

          {/* NFT Grid */}
          <TouchableOpacity
            style={styles.twoColumnGrid}
            onPress={() => router.push('/nft')}
          >
            <View style={styles.gridGlow}>
              <View style={styles.gridBorder}>
                <View style={styles.gridHeader}>
                  <Ionicons name="diamond" size={32} color="#ffff00" />
                  <Text style={styles.gridTitle}>NFT</Text>
                </View>
                <View style={styles.gridContent}>
                  <Text style={styles.gridSubtitle}>DIGITAL ASSETS</Text>
                  <Text style={styles.gridDescription}>Collect unique blockchain art</Text>
                </View>
                <View style={styles.gridScanLine} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Products with Cyberpunk Cards */}
        {products.length > 0 && (
          <View style={styles.cyberSection}>
            <Text style={styles.cyberSectionTitle}>FEATURED PRODUCTS</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              renderItem={renderProduct}
              numColumns={2}
              contentContainerStyle={styles.cyberGrid}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Wallet Connection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWalletModal}
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Connect Wallet</Text>
            <Text style={styles.modalMessage}>Please connect your TON wallet to access the shop.</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowWalletModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  // Main Container with Cyberpunk Background
  cyberContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },

  // Animated Grid Background with Particles
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  gridLines: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00ffff',
    borderStyle: 'dashed',
  },
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#00ffff',
    borderRadius: 1,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },

  // Cyberpunk Header
  cyberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
    paddingTop: isMobile ? 40 : 50,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderBottomWidth: 2,
    borderBottomColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  headerGlow: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  headerButton: {
    marginRight: 10,
  },

  // Scroll Content
  cyberScrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },

  // Hero Section with Advanced Cyberpunk Styling
  cyberHero: {
    alignItems: 'center',
    padding: isMobile ? 40 : 60,
    backgroundColor: 'transparent',
    position: 'relative',
    marginTop: 20,
  },
  heroGlowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#ff0080',
    opacity: 0.08,
    transform: [{ translateX: -200 }, { translateY: -200 }],
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  heroSecondaryGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: '#00ffff',
    opacity: 0.03,
    transform: [{ translateX: -300 }, { translateY: -300 }],
  },
  cyberTitle: {
    fontSize: isMobile ? 42 : 72,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'monospace',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  cyberSubtitle: {
    fontSize: isMobile ? 14 : 18,
    color: '#00ffff',
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 4,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    opacity: 0.9,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff0080',
    opacity: 0.8,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  dataStream: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ffff',
    opacity: 0.6,
  },

  // Two Column Featured Grids Container
  twoColumnGridsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: isMobile ? 20 : 30,
    paddingVertical: 30,
    marginHorizontal: isMobile ? 10 : 20,
  },
  twoColumnGrid: {
    width: isMobile ? '100%' : '48%',
    marginBottom: isMobile ? 20 : 25,
    position: 'relative',
  },

  // Three Featured Grids Container
  featuredGridsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: isMobile ? 20 : 30,
    paddingVertical: 30,
    marginHorizontal: isMobile ? 10 : 20,
  },
  featuredGrid: {
    width: isMobile ? '100%' : '48%',
    marginBottom: isMobile ? 20 : 25,
    position: 'relative',
  },
  gridGlow: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  gridBorder: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    padding: isMobile ? 20 : 25,
    position: 'relative',
    overflow: 'hidden',
    minHeight: isMobile ? 160 : 200,
    justifyContent: 'space-between',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gridTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginLeft: 12,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gridContent: {
    flex: 1,
    justifyContent: 'center',
  },
  gridSubtitle: {
    fontSize: isMobile ? 12 : 14,
    color: '#00ffff',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  gridDescription: {
    fontSize: isMobile ? 10 : 12,
    color: '#cccccc',
    fontFamily: 'monospace',
    lineHeight: isMobile ? 16 : 18,
    opacity: 0.8,
  },
  gridScanLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff0080',
    opacity: 0.8,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  // Action Buttons with Cyberpunk Design
  cyberActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: isMobile ? 25 : 35,
    marginHorizontal: isMobile ? 20 : 30,
    marginVertical: 30,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  cyberActionButton: {
    alignItems: 'center',
    padding: isMobile ? 20 : 25,
    backgroundColor: 'transparent',
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ff0080',
    position: 'relative',
  },
  buttonGlow: {
    alignItems: 'center',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  cyberButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Featured Products Section
  cyberSection: {
    marginBottom: isMobile ? 40 : 50,
    paddingHorizontal: isMobile ? 20 : 30,
  },
  cyberSectionTitle: {
    fontSize: isMobile ? 18 : 24,
    fontWeight: '900',
    color: '#ff0080',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  cyberGrid: {
    paddingBottom: 30,
  },

  // Cyberpunk Product Cards
  cyberCard: {
    marginBottom: isMobile ? 20 : 25,
    marginHorizontal: isMobile ? 8 : 10,
    width: isMobile ? '47%' : '48%',
    position: 'relative',
  },
  cardGlow: {
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  cardBorder: {
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff0080',
    overflow: 'hidden',
    position: 'relative',
  },
  cyberImage: {
    width: '100%',
    height: isMobile ? 140 : 180,
    borderBottomWidth: 1,
    borderBottomColor: '#00ffff',
  },
  placeholderImage: {
    width: '100%',
    height: isMobile ? 140 : 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#00ffff',
  },
  cyberInfo: {
    padding: isMobile ? 12 : 15,
    alignItems: 'center',
  },
  cyberName: {
    fontSize: isMobile ? 11 : 13,
    fontWeight: 'bold',
    color: '#00ffff',
    marginBottom: 6,
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cyberPrice: {
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    color: '#ff0080',
    fontFamily: 'monospace',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  // CTA Section
  cyberCTA: {
    alignItems: 'center',
    padding: isMobile ? 30 : 40,
    marginTop: 20,
  },
  cyberCTAButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#00ffff',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isMobile ? 18 : 22,
    paddingHorizontal: isMobile ? 30 : 40,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  cyberCTAText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginRight: 15,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
    width: isMobile ? '80%' : '50%',
  },
  modalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '900',
    color: '#00ffff',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: isMobile ? 14 : 16,
    color: '#cccccc',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ff0080',
    paddingVertical: 12,
    paddingHorizontal: 30,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
