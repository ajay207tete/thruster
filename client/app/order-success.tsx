import React from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import Header from '@/components/Header';

export default function OrderSuccessScreen() {
  const router = useRouter();

  const handleContinueShopping = () => {
    router.push('/(tabs)/shop');
  };

  const handleViewOrders = () => {
    router.push('/my-order');
  };

  return (
    <View style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={false} title="SUCCESS" />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={120} color="#00ff00" />
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <ThemedText style={styles.successTitle}>ORDER SUCCESSFUL!</ThemedText>
          <ThemedText style={styles.successMessage}>
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </ThemedText>
        </View>

        {/* Order Details */}
        <View style={styles.detailsContainer}>
          <ThemedText style={styles.detailsTitle}>What happens next?</ThemedText>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>Order confirmation sent to your email</ThemedText>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>Payment processing (if applicable)</ThemedText>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>Order preparation and shipping</ThemedText>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>4</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>Delivery to your address</ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinueShopping}>
            <View style={styles.primaryButtonGlow}>
              <ThemedText style={styles.primaryButtonText}>Continue Shopping</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleViewOrders}>
            <ThemedText style={styles.secondaryButtonText}>View My Orders</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isMobile ? 20 : 40,
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 30,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successTitle: {
    color: '#00ff00',
    fontSize: isMobile ? 24 : 32,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  successMessage: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: isMobile ? 24 : 28,
    maxWidth: isMobile ? 300 : 500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailsContainer: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    padding: isMobile ? 20 : 30,
    marginBottom: 40,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  detailsTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00ffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  stepNumberText: {
    color: '#000000',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  stepText: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  primaryButtonGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isMobile ? 18 : 22,
    paddingHorizontal: isMobile ? 30 : 40,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: isMobile ? 16 : 20,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00ffff',
    paddingVertical: isMobile ? 15 : 18,
    paddingHorizontal: isMobile ? 25 : 30,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  secondaryButtonText: {
    color: '#00ffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
