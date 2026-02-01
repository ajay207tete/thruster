import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Alert, Dimensions } from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { OrderSummary } from '../../components/OrderSummary';
import { ShippingForm, ShippingDetails } from '../../components/ShippingForm';
import { PaymentService, defaultPaymentConfig } from '../../services/paymentService';
import { OrderService, OrderItem } from '../../services/orderService';
import Header from '@/components/Header';
import { router } from 'expo-router';
import { Collapsible } from '../../components/Collapsible';

export default function CheckoutScreen() {
  const { state: cartState } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails | null>(null);

  const cartItems = cartState.cart?.items || [];
  const totalAmount = cartState.cart?.totalPrice || 0;

  const handleShippingSubmit = (details: ShippingDetails) => {
    setShippingDetails(details);
  };

  const handleTonPayment = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!shippingDetails) {
      Alert.alert('Error', 'Please fill in your shipping information first');
      return;
    }

    setIsProcessing(true);
    try {
      const orderService = new OrderService();
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const orderResponse = await orderService.createOrder({
        userWallet: 'guest', // For now, using guest wallet
        items: orderItems,
        paymentMethod: 'TON_NATIVE',
        shippingDetails: shippingDetails
      });

      if (orderResponse) {
        Alert.alert('Success', 'Order created successfully! Payment processing...');
        router.push('/order-success');
      } else {
        Alert.alert('Error', 'Failed to create order');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNowPayments = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!shippingDetails) {
      Alert.alert('Error', 'Please fill in your shipping information first');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentService = new PaymentService(defaultPaymentConfig);

      // Create order first
      const orderService = new OrderService();
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        image: item.product.image
      }));

      const order = await orderService.createOrder({
        userWallet: 'guest',
        items: orderItems,
        paymentMethod: 'NOWPAYMENTS',
        shippingDetails: shippingDetails
      });

      if (order) {
        // Create NOWPayments invoice
        const invoiceResponse = await paymentService.createNOWPaymentsInvoice(order.id);
        router.push('/payment');
      } else {
        Alert.alert('Error', 'Failed to create order');
      }
    } catch (error) {
      console.error('NOWPayments error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderCartItem = (item: any) => (
    <View key={item._id} style={styles.cartItem}>
      {item.product?.image ? (
        <Image source={{ uri: item.product.image }} style={styles.productImage} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product?.name || 'Product'}</Text>
        <Text style={styles.productInfo}>Size: {item.size || 'N/A'}</Text>
        <Text style={styles.productInfo}>Color: {item.color || 'N/A'}</Text>
        <Text style={styles.productInfo}>Quantity: {item.quantity}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)} each</Text>
      </View>
      <Text style={styles.productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Header backgroundColor="#000000" showCartIcon={false} title="CHECKOUT" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/shop')}
          >
            <Text style={styles.shopButtonText}>Back to Shop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={false} title="CHECKOUT" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cartItems.map(renderCartItem)}
          <OrderSummary
            cartItems={cartItems.map(item => ({
              productId: item.product._id,
              name: item.product.name,
              price: item.price,
              quantity: item.quantity,
              image: item.product.image
            }))}
            totalAmount={totalAmount}
          />
        </View>

        {/* Shipping Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Details Input</Text>
          <ShippingForm
            onSubmit={handleShippingSubmit}
            onCancel={() => {}}
          />
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Payment Method</Text>
          {!shippingDetails ? (
            <View style={styles.paymentDisabled}>
              <Text style={styles.paymentDisabledText}>
                Please complete shipping information above to proceed with payment
              </Text>
            </View>
          ) : (
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.paymentMethod, isProcessing && styles.disabledButton]}
                onPress={handleTonPayment}
                disabled={isProcessing}
              >
                <View style={styles.paymentMethodContent}>
                  <Text style={styles.paymentMethodText}>
                    <Text style={styles.paymentMethodTitle}>💎 Pay with TON Smart Contract</Text>
                    <Text style={styles.paymentMethodDescription}>
                      Fast and secure payment using TON blockchain
                    </Text>
                  </Text>
                </View>
                {isProcessing && <Text style={styles.processingText}>Processing...</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentMethod, isProcessing && styles.disabledButton]}
                onPress={handleNowPayments}
                disabled={isProcessing}
              >
                <View style={styles.paymentMethodContent}>
                  <Text style={styles.paymentMethodText}>
                    <Text style={styles.paymentMethodTitle}>Pay with Crypto (NOWPayments)</Text>
                    <Text style={styles.paymentMethodDescription}>
                      Pay with various cryptocurrencies
                    </Text>
                  </Text>
                </View>
                {isProcessing && <Text style={styles.processingText}>Processing...</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Processing Section */}
        {isProcessing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Processing</Text>
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processing your payment...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  // Main Container with Cyberpunk Background
  mainContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ffff',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666666',
    fontSize: isMobile ? 20 : 24,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  shopButtonText: {
    color: '#000000',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
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

  // Cyberpunk Header
  header: {
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
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: isMobile ? 18 : 22,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Scroll Content
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },

  // Section with Cyberpunk Styling
  section: {
    marginBottom: isMobile ? 30 : 40,
    paddingHorizontal: isMobile ? 20 : 30,
  },
  sectionTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 24,
    fontWeight: '900',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },

  // Cyberpunk Input Fields
  input: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 2,
    borderColor: '#00ffff',
    borderRadius: 15,
    paddingVertical: isMobile ? 12 : 15,
    paddingHorizontal: isMobile ? 20 : 25,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: isMobile ? 14 : 16,
    marginBottom: 15,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  inputError: {
    borderColor: '#ff4444',
    shadowColor: '#ff4444',
  },
  // Cyberpunk Cart Items
  cartItem: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    padding: isMobile ? 15 : 20,
    marginBottom: isMobile ? 15 : 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  productImage: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 60 : 80,
    borderRadius: 10,
    marginRight: isMobile ? 15 : 20,
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  placeholderImage: {
    width: isMobile ? 60 : 80,
    height: isMobile ? 60 : 80,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    marginRight: isMobile ? 15 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  placeholderText: {
    fontSize: isMobile ? 20 : 24,
    color: '#ff0080',
  },
  itemDetails: {
    flex: 1,
  },
  productName: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  productInfo: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productPrice: {
    color: '#ff0080',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Empty Cart Styling
  emptyCart: {
    color: '#666666',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginVertical: 30,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Total Container with Cyberpunk Effects
  totalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#ff0080',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderRadius: 15,
    padding: isMobile ? 15 : 20,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  totalText: {
    color: '#ffffff',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Cyberpunk Delete Button
  deleteButton: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },

  // Cyberpunk Payment Method Selection
  paymentMethod: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: isMobile ? 15 : 20,
    marginBottom: isMobile ? 15 : 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#00ffff',
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: isMobile ? 12 : 15,
    flex: 1,
  },
  paymentMethodTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  paymentMethodDescription: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cyberpunk Place Order Button
  placeOrderButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#00ffff',
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: isMobile ? 20 : 30,
    marginTop: 30,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  placeOrderButtonGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 18 : 22,
    paddingHorizontal: isMobile ? 30 : 40,
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // Continue Button
  continueButton: {
    backgroundColor: '#00ffff',
    paddingVertical: isMobile ? 15 : 18,
    paddingHorizontal: isMobile ? 25 : 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Shipping Summary
  shippingSummary: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    padding: isMobile ? 15 : 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  shippingText: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Edit Button
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff0080',
    borderRadius: 10,
    paddingVertical: isMobile ? 8 : 10,
    paddingHorizontal: isMobile ? 15 : 20,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  editButtonText: {
    color: '#ff0080',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Collapsible Header
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  collapsibleIcon: {
    color: '#ff0080',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
  },

  // Cart Items Container
  cartItemsContainer: {
    maxHeight: 300, // Limit height for better UX
  },

  // Checkout Summary Header
  checkoutSummary: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    padding: isMobile ? 15 : 20,
    borderBottomWidth: 2,
    borderBottomColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryValue: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressComplete: {
    backgroundColor: '#00ff00',
    width: '100%',
  },
  progressIncomplete: {
    backgroundColor: '#ff4444',
    width: '30%',
  },
  progressText: {
    color: '#ffffff',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },

  // Collapsible Content
  collapsibleContent: {
    paddingHorizontal: isMobile ? 20 : 30,
    paddingVertical: 20,
  },

  // Requirement Message
  requirementMessage: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: '#ff4444',
    borderRadius: 15,
    padding: isMobile ? 15 : 20,
    marginHorizontal: isMobile ? 20 : 30,
    marginBottom: 30,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  requirementText: {
    color: '#ff4444',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: '#ff4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Processing Text
  processingText: {
    color: '#00ff00',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 10,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Step-based Layout
  stepContainer: {
    marginBottom: isMobile ? 25 : 35,
    paddingHorizontal: isMobile ? 20 : 30,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#00ffff',
  },
  stepNumber: {
    width: isMobile ? 35 : 45,
    height: isMobile ? 35 : 45,
    borderRadius: isMobile ? 17.5 : 22.5,
    backgroundColor: '#ff0080',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  stepTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  stepComplete: {
    color: '#00ff00',
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  stepContent: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    padding: isMobile ? 20 : 25,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },

  // Payment Disabled State
  paymentDisabled: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: '#ff4444',
    borderRadius: 15,
    padding: isMobile ? 20 : 25,
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentDisabledText: {
    color: '#ff4444',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: '#ff4444',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Payment Options
  paymentOptions: {
    // Container for payment methods
  },

  // Disabled Button Style
  disabledButton: {
    opacity: 0.5,
  },

  // Processing Container
  processingContainer: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    padding: isMobile ? 20 : 25,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
});
