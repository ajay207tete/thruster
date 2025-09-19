import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { nowPaymentsService, PaymentData, PaymentResponse } from '@/services/nowpaymentsapi';
import { apiService } from '@/services/api';

export default function TravelCheckoutScreen({ params }: { params?: { name?: string; price?: string; size?: string; color?: string; offerId?: string; hotelId?: string; checkInDate?: string; checkOutDate?: string; adults?: string } }) {
  const router = useRouter();

  const { name = 'Hotel Booking', price = '0', size = 'Room Type', color = 'Dates', offerId, hotelId, checkInDate, checkOutDate, adults } = params || {};

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleConfirmBooking = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      Alert.alert('Error', 'Please fill in all required guest details.');
      return;
    }

    // Validate email format
    if (!validateEmail(guestEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Validate phone number
    if (!validatePhone(guestPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
      return;
    }

    // Validate guest name (at least first and last name)
    const nameParts = guestName.trim().split(' ');
    if (nameParts.length < 2) {
      Alert.alert('Invalid Name', 'Please enter both first and last name.');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentPayload: PaymentData = {
        price_amount: price,
        price_currency: 'USD',
        pay_currency: 'BTC',
        order_id: `order_${Date.now()}`,
        order_description: `Booking for ${name}`,
        ipn_callback_url: 'https://your-production-domain.com/api/payment-callback',
        success_url: 'https://your-production-domain.com/success',
        cancel_url: 'https://your-production-domain.com/cancel',
      };

      const response = await nowPaymentsService.createPayment(paymentPayload);
      setPaymentData(response);

      // Create order in backend
      const orderData = {
        userId: 'user123', // Replace with actual user ID from auth
        items: [
          {
            product: 'hotel-booking', // Placeholder for hotel booking
            quantity: 1,
            price: parseFloat(price),
          },
        ],
        totalAmount: parseFloat(price),
        paymentId: response.id,
        paymentCurrency: response.pay_currency,
        shippingDetails: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          address: specialRequests || '',
          city: '',
          postalCode: '',
          country: '',
        },
        // Hotel booking details
        hotelId: hotelId,
        offerId: offerId,
        hotelName: name,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adults: adults,
      };

      await apiService.createOrder(orderData);

      // Redirect to NowPayments payment page
      if (response.hosted_checkout_url) {
        Linking.openURL(response.hosted_checkout_url);
      } else {
        Alert.alert('Payment Error', 'Unable to get payment URL. Please try again.');
        return;
      }

      // Show order summary after redirection
      Alert.alert(
        'Redirecting to Payment',
        `Order Summary:\n\nHotel: ${name}\nRoom: ${size}\nDates: ${color}\nTotal: $${price}\n\nRedirecting to NowPayments...`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to order summary or my bookings
              router.push('/my-booking');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Payment creation failed:', error);
      Alert.alert('Payment Error', 'Failed to create payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#00ff00" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Booking Summary */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Booking Summary</ThemedText>
        <ThemedText style={styles.bookingText}>Hotel: {name}</ThemedText>
        <ThemedText style={styles.bookingText}>Room Type: {size}</ThemedText>
        <ThemedText style={styles.bookingText}>Dates: {color}</ThemedText>
        <View style={styles.subtotalContainer}>
          <ThemedText style={styles.subtotalText}>Subtotal: ${price}</ThemedText>
          <ThemedText style={styles.totalText}>Total: ${price}</ThemedText>
        </View>
      </View>

      {/* Guest Details */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Guest Details</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor="#00ff00"
          value={guestName}
          onChangeText={setGuestName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address *"
          placeholderTextColor="#00ff00"
          value={guestEmail}
          onChangeText={setGuestEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          placeholderTextColor="#00ff00"
          value={guestPhone}
          onChangeText={setGuestPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Special Requests (Optional)"
          placeholderTextColor="#00ff00"
          value={specialRequests}
          onChangeText={setSpecialRequests}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Payment Instructions */}
      {paymentData && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Instructions</ThemedText>
          <View style={styles.paymentInfo}>
            <ThemedText style={styles.paymentText}>
              Send {paymentData.pay_amount} {paymentData.pay_currency}
            </ThemedText>
            <ThemedText style={styles.paymentAddress}>
              To: {paymentData.pay_address}
            </ThemedText>
            <ThemedText style={styles.paymentNote}>
              Payment expires: {new Date(paymentData.valid_until).toLocaleString()}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Confirm Booking Button */}
      <TouchableOpacity
        style={[styles.confirmButton, isProcessing && styles.disabledButton]}
        onPress={handleConfirmBooking}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <ThemedText style={styles.confirmButtonText}>
            {paymentData ? 'Payment Created' : 'Pay with Crypto'}
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  header: {
    height: 50,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: '#00ff00',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  bookingText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#00ff00',
    fontFamily: 'SpaceMono',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  paymentInfo: {
    backgroundColor: '#111111',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  paymentText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  paymentAddress: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
    marginBottom: 10,
    backgroundColor: '#222222',
    padding: 10,
    borderRadius: 4,
  },
  paymentNote: {
    color: '#ffaa00',
    fontSize: 12,
    fontFamily: 'SpaceMono',
  },
  disabledButton: {
    opacity: 0.6,
  },
  subtotalContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
  },
  subtotalText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  totalText: {
    color: '#00ff00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    textAlign: 'right',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
