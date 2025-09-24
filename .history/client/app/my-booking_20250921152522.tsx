import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PageHeader from '@/components/PageHeader';
import { apiService, Booking } from '@/services/api';

export default function MyBookingScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // For demo, fetch user with ID '1' - replace with actual user ID logic
        const userId = '1';
        const user = await apiService.getUserById(userId);
        setBookings(user.bookings);
      } catch (err) {
        setError('Failed to load bookings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingItem}>
      <ThemedText style={styles.bookingText}>Product ID: {item.productId}</ThemedText>
      <ThemedText style={styles.bookingText}>Quantity: {item.quantity}</ThemedText>
      <ThemedText style={styles.bookingText}>Date: {new Date(item.bookingDate).toLocaleDateString()}</ThemedText>
      <ThemedText style={styles.bookingText}>Status: {item.status}</ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading bookings...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>My Bookings</ThemedText>
        <View style={styles.headerSpacer} />
      </View>
      {bookings.length === 0 ? (
        <ThemedText style={styles.subtitle}>No bookings yet.</ThemedText>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 32,
  },
  title: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  subtitle: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
  },
  placeholder: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  bookingItem: {
    backgroundColor: '#111111',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  bookingText: {
    color: '#00ff00',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  loadingText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
