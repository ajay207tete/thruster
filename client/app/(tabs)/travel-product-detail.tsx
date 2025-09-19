import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { apiService } from '@/services/api';

export default function TravelProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { id, name = 'Hotel', price = '0', rating = '0', amenities = '', description = '', checkInDate: paramCheckIn = '', checkOutDate: paramCheckOut = '', adults = '2' } = params;
  const amenitiesList = Array.isArray(amenities) ? amenities : (amenities as string).split(',');
  const checkInParam = Array.isArray(paramCheckIn) ? paramCheckIn[0] : paramCheckIn;
  const checkOutParam = Array.isArray(paramCheckOut) ? paramCheckOut[0] : paramCheckOut;
  const adultsParam = Array.isArray(adults) ? adults[0] : adults;

  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [checkInDate, setCheckInDate] = useState(checkInParam || '2024-07-01');
  const [checkOutDate, setCheckOutDate] = useState(checkOutParam || '2024-07-02');
  const [guests, setGuests] = useState(adultsParam);

  const roomTypes = [
    { type: 'Standard Room', price: 100, capacity: '2 guests' },
    { type: 'Deluxe Room', price: 150, capacity: '2 guests' },
    { type: 'Suite', price: 200, capacity: '4 guests' },
  ];
  const [selectedRoomType, setSelectedRoomType] = useState(roomTypes[0]);

  useEffect(() => {
    if (id) {
      fetchHotelDetails();
    }
  }, [id]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const details = await apiService.getHotelDetails(id as string, checkInDate, checkOutDate, parseInt(guests));
      setHotelDetails(details);
      if (details.offers && details.offers.length > 0) {
        setSelectedOffer(details.offers[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!selectedOffer) {
      Alert.alert('Error', 'Please select an offer.');
      return;
    }

    // Proceed to checkout with offer details
    router.push({
      pathname: '/travel-checkout',
      params: {
        name: name as string,
        price: selectedOffer.price.total,
        size: selectedOffer.room.typeEstimated.category,
        color: `${checkInDate} to ${checkOutDate}`,
        offerId: selectedOffer.id,
        hotelId: id as string,
        checkInDate,
        checkOutDate,
        adults: guests,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#007bff" onPress={() => router.back()} />
        <View style={styles.headerTitle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hotelHeader}>
          <ThemedText style={styles.hotelName}>{name}</ThemedText>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#00ff00" />
            <ThemedText style={styles.ratingText}>{rating}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.hotelDescription}>{description}</ThemedText>

        <View style={styles.amenitiesContainer}>
          <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
          <View style={styles.amenitiesList}>
            {amenitiesList.map((amenity) => (
              <ThemedText key={amenity} style={styles.amenityText}>{amenity}</ThemedText>
            ))}
          </View>
        </View>

        <View style={styles.bookingSection}>
          <ThemedText style={styles.sectionTitle}>Booking Details</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Check-in Date</ThemedText>
            <TouchableOpacity style={styles.dateButton}>
              <ThemedText style={styles.dateText}>{checkInDate}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Check-out Date</ThemedText>
            <TouchableOpacity style={styles.dateButton}>
              <ThemedText style={styles.dateText}>{checkOutDate}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Guests</ThemedText>
            <TouchableOpacity style={styles.dateButton}>
              <ThemedText style={styles.dateText}>{guests} Guests</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.roomSection}>
          <ThemedText style={styles.sectionTitle}>Select Offer</ThemedText>
          {hotelDetails && hotelDetails.offers ? hotelDetails.offers.map((offer: any) => (
            <TouchableOpacity
              key={offer.id}
              style={[
                styles.roomCard,
                selectedOffer && selectedOffer.id === offer.id && styles.roomCardSelected,
              ]}
              onPress={() => setSelectedOffer(offer)}
            >
              <View style={styles.roomHeader}>
                <ThemedText style={styles.roomType}>{offer.room.typeEstimated.category}</ThemedText>
                <ThemedText style={styles.roomPrice}>${offer.price.total}</ThemedText>
              </View>
              <ThemedText style={styles.roomCapacity}>{offer.room.description.text}</ThemedText>
            </TouchableOpacity>
          )) : (
            <ThemedText>No offers available.</ThemedText>
          )}
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 50,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  cyberText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    padding: 20,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  hotelName: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#333333',
    fontSize: 16,
    marginLeft: 5,
  },
  hotelDescription: {
    color: '#666666',
    fontSize: 16,
    marginBottom: 20,
  },
  amenitiesContainer: {
    marginBottom: 20,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  amenityText: {
    color: '#666666',
    fontSize: 12,
    backgroundColor: '#eeeeee',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 5,
  },
  bookingSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 5,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dateText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
  roomSection: {
    marginBottom: 20,
  },
  roomCard: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  roomCardSelected: {
    backgroundColor: '#00ff00',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  roomType: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  roomPrice: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  roomCapacity: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'SpaceMono',
  },
  sectionTitle: {
    color: '#00ff00',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
  bookButton: {
    marginTop: 30,
    backgroundColor: '#00ff00',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});
