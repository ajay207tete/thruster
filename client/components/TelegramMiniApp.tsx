import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getShopProducts } from '@/services/sanityClient';
import { useCart } from '@/contexts/CartContext';
import { useTelegramMiniApp } from '@/hooks/useTelegramMiniApp';

const { width: screenWidth } = Dimensions.get('window');

// Screen types for conditional rendering
type ScreenType = 'home' | 'shop' | 'cart' | 'checkout' | 'profile';

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

export function TelegramMiniApp() {
  const {
    webApp,
    themeParams,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    offBackButtonClick,
    showMainButton,
    hideMainButton,
    setMainButtonText,
    onMainButtonClick,
    offMainButtonClick,
    enableMainButton,
    disableMainButton,
    setHeaderColor,
    setBackgroundColor,
    setBottomBarColor,
    close,
  } = useTelegramMiniApp();

  const { state: cartState, addToCart } = useCart();

  // State for navigation and data
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});

  // Initialize Telegram Mini App
  useEffect(() => {
    if (webApp) {
      setHeaderColor(themeParams?.bg_color || '#ffffff');
      setBottomBarColor(themeParams?.bg_color || '#ffffff');
    }
  }, [webApp, themeParams, setHeaderColor, setBottomBarColor]);

  // Handle back button
  useEffect(() => {
    const handleBack = () => {
      if (screenHistory.length > 1) {
        const newHistory = [...screenHistory];
        newHistory.pop();
        const previousScreen = newHistory[newHistory.length - 1];
        setCurrentScreen(previousScreen);
        setScreenHistory(newHistory);
      } else {
        // Close the mini app if at home screen
        close();
      }
    };

    onBackButtonClick(handleBack);

    // Show/hide back button based on screen history
    if (screenHistory.length > 1) {
      showBackButton();
    } else {
      hideBackButton();
    }

    return () => {
      offBackButtonClick(handleBack);
    };
  }, [screenHistory, onBackButtonClick, offBackButtonClick, showBackButton, hideBackButton, close]);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getShopProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (currentScreen === 'shop') {
      fetchProducts();
    }
  }, [currentScreen]);

  // Navigation function
  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setScreenHistory(prev => [...prev, screen]);
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    const size = selectedSize[product._id] || (product.sizes.length > 0 ? product.sizes[0] : '');
    const color = selectedColor[product._id] || (product.colors.length > 0 ? product.colors[0] : '');
    const quantity = selectedQuantity[product._id] || 1;

    await addToCart(product._id, quantity, size, color);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen navigateTo={navigateTo} themeParams={themeParams} />;
      case 'shop':
        return (
          <ShopScreen
            products={products}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            selectedQuantity={selectedQuantity}
            setSelectedSize={setSelectedSize}
            setSelectedColor={setSelectedColor}
            setSelectedQuantity={setSelectedQuantity}
            onAddToCart={handleAddToCart}
            navigateTo={navigateTo}
            themeParams={themeParams}
          />
        );
      case 'cart':
        return <CartScreen navigateTo={navigateTo} themeParams={themeParams} />;
      case 'checkout':
        return <CheckoutScreen navigateTo={navigateTo} themeParams={themeParams} />;
      case 'profile':
        return <ProfileScreen navigateTo={navigateTo} themeParams={themeParams} />;
      default:
        return <HomeScreen navigateTo={navigateTo} themeParams={themeParams} />;
    }
  };

  return (
    <View style={[styles.container, {
      backgroundColor: themeParams?.bg_color || '#ffffff',
      maxWidth: Math.min(screenWidth, 420), // Telegram Mini App max width
    }]}>
      {renderScreen()}
    </View>
  );
}

// Home Screen Component
function HomeScreen({ navigateTo, themeParams }: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        <ThemedText style={[styles.title, { color: themeParams?.text_color || '#000000' }]}>
          Cyberpunk App
        </ThemedText>
      </View>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeParams?.button_color || '#007bff' }]}
          onPress={() => navigateTo('shop')}
        >
          <Ionicons name="shirt" size={32} color={themeParams?.button_text_color || '#ffffff'} />
          <ThemedText style={[styles.menuText, { color: themeParams?.button_text_color || '#ffffff' }]}>
            Shop
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeParams?.button_color || '#007bff' }]}
          onPress={() => navigateTo('cart')}
        >
          <Ionicons name="cart" size={32} color={themeParams?.button_text_color || '#ffffff'} />
          <ThemedText style={[styles.menuText, { color: themeParams?.button_text_color || '#ffffff' }]}>
            Cart
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeParams?.button_color || '#007bff' }]}
          onPress={() => navigateTo('profile')}
        >
          <Ionicons name="person" size={32} color={themeParams?.button_text_color || '#ffffff'} />
          <ThemedText style={[styles.menuText, { color: themeParams?.button_text_color || '#ffffff' }]}>
            Profile
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: themeParams?.button_color || '#007bff' }]}
          onPress={() => navigateTo('checkout')}
        >
          <Ionicons name="card" size={32} color={themeParams?.button_text_color || '#ffffff'} />
          <ThemedText style={[styles.menuText, { color: themeParams?.button_text_color || '#ffffff' }]}>
            Checkout
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Shop Screen Component
function ShopScreen({
  products,
  selectedSize,
  selectedColor,
  selectedQuantity,
  setSelectedSize,
  setSelectedColor,
  setSelectedQuantity,
  onAddToCart,
  navigateTo,
  themeParams
}: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={[styles.screenTitle, { color: themeParams?.text_color || '#000000' }]}>
        Clothing Shop
      </ThemedText>

      {products.map((product: Product) => (
        <View key={product._id} style={[styles.productCard, {
          backgroundColor: themeParams?.secondary_bg_color || '#f8f9fa',
          borderColor: themeParams?.section_bg_color || '#e9ecef'
        }]}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <Ionicons name="shirt" size={50} color={themeParams?.text_color || '#000000'} />
          )}

          <ThemedText style={[styles.productName, { color: themeParams?.text_color || '#000000' }]}>
            {product.name}
          </ThemedText>
          <ThemedText style={[styles.productPrice, { color: themeParams?.link_color || '#007bff' }]}>
            ${product.price}
          </ThemedText>

          {/* Size selection */}
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionLabel, { color: themeParams?.text_color || '#000000' }]}>
              Size:
            </ThemedText>
            {product.sizes.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: selectedSize[product._id] === size
                      ? themeParams?.button_color || '#007bff'
                      : themeParams?.secondary_bg_color || '#f8f9fa',
                    borderColor: themeParams?.button_color || '#007bff'
                  }
                ]}
                onPress={() => setSelectedSize((prev: any) => ({ ...prev, [product._id]: size }))}
              >
                <ThemedText style={[styles.optionText, {
                  color: selectedSize[product._id] === size
                    ? themeParams?.button_text_color || '#ffffff'
                    : themeParams?.text_color || '#000000'
                }]}>
                  {size}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity selection */}
          <View style={styles.optionRow}>
            <ThemedText style={[styles.optionLabel, { color: themeParams?.text_color || '#000000' }]}>
              Qty:
            </ThemedText>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: themeParams?.button_color || '#007bff' }]}
              onPress={() => setSelectedQuantity((prev: any) => ({
                ...prev,
                [product._id]: Math.max(1, (prev[product._id] || 1) - 1)
              }))}
            >
              <ThemedText style={[styles.quantityText, { color: themeParams?.button_color || '#007bff' }]}>
                -
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.quantityValue, { color: themeParams?.text_color || '#000000' }]}>
              {selectedQuantity[product._id] || 1}
            </ThemedText>
            <TouchableOpacity
              style={[styles.quantityButton, { borderColor: themeParams?.button_color || '#007bff' }]}
              onPress={() => setSelectedQuantity((prev: any) => ({
                ...prev,
                [product._id]: (prev[product._id] || 1) + 1
              }))}
            >
              <ThemedText style={[styles.quantityText, { color: themeParams?.button_color || '#007bff' }]}>
                +
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: themeParams?.button_color || '#007bff' }]}
            onPress={() => onAddToCart(product)}
          >
            <ThemedText style={[styles.addToCartText, { color: themeParams?.button_text_color || '#ffffff' }]}>
              Add to Cart
            </ThemedText>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// Placeholder components for other screens
function CartScreen({ navigateTo, themeParams }: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={[styles.screenTitle, { color: themeParams?.text_color || '#000000' }]}>
        Shopping Cart
      </ThemedText>
      <ThemedText style={[styles.placeholderText, { color: themeParams?.hint_color || '#6c757d' }]}>
        Cart functionality would be implemented here
      </ThemedText>
    </ScrollView>
  );
}

function CheckoutScreen({ navigateTo, themeParams }: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={[styles.screenTitle, { color: themeParams?.text_color || '#000000' }]}>
        Checkout
      </ThemedText>
      <ThemedText style={[styles.placeholderText, { color: themeParams?.hint_color || '#6c757d' }]}>
        Checkout functionality would be implemented here
      </ThemedText>
    </ScrollView>
  );
}

function ProfileScreen({ navigateTo, themeParams }: any) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <ThemedText style={[styles.screenTitle, { color: themeParams?.text_color || '#000000' }]}>
        Profile
      </ThemedText>
      <ThemedText style={[styles.placeholderText, { color: themeParams?.hint_color || '#6c757d' }]}>
        Profile functionality would be implemented here
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Safe bottom spacing for Telegram UI
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  productCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 40,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityButton: {
    borderWidth: 1,
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
});
