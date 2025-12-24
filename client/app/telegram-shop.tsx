import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TelegramScreen, TelegramCard, TelegramButton, TelegramText } from '@/components/TelegramScreen';
import { getShopProducts } from '@/services/sanityClient';
import { useCart } from '@/contexts/CartContext';
import { useTelegramMiniApp } from '@/hooks/useTelegramMiniApp';

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

export default function TelegramShopScreen() {
  const { state: cartState, addToCart } = useCart();
  const { themeParams, showMainButton, setMainButtonText, onMainButtonClick } = useTelegramMiniApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [key: string]: string }>({});
  const [selectedQuantity, setSelectedQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getShopProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Set up main button for cart
  useEffect(() => {
    const cartItemCount = cartState.items.reduce((total, item) => total + item.quantity, 0);
    if (cartItemCount > 0) {
      showMainButton(`View Cart (${cartItemCount})`);
      onMainButtonClick(() => {
        // Navigate to cart - this would be handled by parent navigation
        console.log('Navigate to cart');
      });
    } else {
      // Hide main button if no items
      // Note: The SDK doesn't have a direct hide method, so we set empty text
      setMainButtonText('');
    }
  }, [cartState.items, showMainButton, setMainButtonText, onMainButtonClick]);

  const handleAddToCart = async (product: Product) => {
    const size = selectedSize[product._id] || (product.sizes.length > 0 ? product.sizes[0] : '');
    const color = selectedColor[product._id] || (product.colors.length > 0 ? product.colors[0] : '');
    const quantity = selectedQuantity[product._id] || 1;

    try {
      await addToCart(product._id, quantity, size, color);
      // Show success feedback
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: size }));
  };

  const handleSelectColor = (productId: string, color: string) => {
    setSelectedColor((prev) => ({ ...prev, [productId]: color }));
  };

  return (
    <TelegramScreen title="Clothing Shop">
      <TelegramText style={styles.description}>
        Discover the latest fashion. Upgrade your style with modern designs.
      </TelegramText>

      {products.map((product) => (
        <TelegramCard key={product._id}>
          <View style={styles.productHeader}>
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.placeholderImage, {
                backgroundColor: themeParams?.secondary_bg_color || '#f0f0f0'
              }]}>
                <Ionicons name="shirt" size={40} color={themeParams?.hint_color || '#999999'} />
              </View>
            )}

            <View style={styles.productInfo}>
              <TelegramText style={styles.productName}>{product.name}</TelegramText>
              <TelegramText type="accent" style={styles.productPrice}>
                ${product.price}
              </TelegramText>
            </View>
          </View>

          {/* Size Selection */}
          {product.sizes.length > 0 && (
            <View style={styles.optionGroup}>
              <TelegramText type="secondary" style={styles.optionLabel}>
                Size:
              </TelegramText>
              <View style={styles.optionButtons}>
                {product.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedSize[product._id] === size
                          ? themeParams?.button_color || '#2481cc'
                          : themeParams?.secondary_bg_color || '#f0f0f0',
                        borderColor: themeParams?.button_color || '#2481cc',
                      }
                    ]}
                    onPress={() => handleSelectSize(product._id, size)}
                  >
                    <TelegramText
                      style={[
                        styles.optionText,
                        {
                          color: selectedSize[product._id] === size
                            ? themeParams?.button_text_color || '#ffffff'
                            : themeParams?.text_color || '#000000',
                        }
                      ]}
                    >
                      {size}
                    </TelegramText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <View style={styles.optionGroup}>
              <TelegramText type="secondary" style={styles.optionLabel}>
                Color:
              </TelegramText>
              <View style={styles.optionButtons}>
                {product.colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedColor[product._id] === color
                          ? themeParams?.button_color || '#2481cc'
                          : themeParams?.secondary_bg_color || '#f0f0f0',
                        borderColor: themeParams?.button_color || '#2481cc',
                      }
                    ]}
                    onPress={() => handleSelectColor(product._id, color)}
                  >
                    <TelegramText
                      style={[
                        styles.optionText,
                        {
                          color: selectedColor[product._id] === color
                            ? themeParams?.button_text_color || '#ffffff'
                            : themeParams?.text_color || '#000000',
                        }
                      ]}
                    >
                      {color}
                    </TelegramText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selection */}
          <View style={styles.optionGroup}>
            <TelegramText type="secondary" style={styles.optionLabel}>
              Quantity:
            </TelegramText>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: themeParams?.button_color || '#2481cc' }]}
                onPress={() => setSelectedQuantity((prev) => ({
                  ...prev,
                  [product._id]: Math.max(1, (prev[product._id] || 1) - 1),
                }))}
              >
                <TelegramText type="accent">-</TelegramText>
              </TouchableOpacity>

              <TelegramText style={styles.quantityValue}>
                {selectedQuantity[product._id] || 1}
              </TelegramText>

              <TouchableOpacity
                style={[styles.quantityButton, { borderColor: themeParams?.button_color || '#2481cc' }]}
                onPress={() => setSelectedQuantity((prev) => ({
                  ...prev,
                  [product._id]: (prev[product._id] || 1) + 1,
                }))}
              >
                <TelegramText type="accent">+</TelegramText>
              </TouchableOpacity>
            </View>
          </View>

          <TelegramButton
            title="Add to Cart"
            onPress={() => handleAddToCart(product)}
            style={styles.addToCartButton}
          />
        </TelegramCard>
      ))}
    </TelegramScreen>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionGroup: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
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
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    marginTop: 16,
  },
});
