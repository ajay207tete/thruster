import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { apiService } from '@/services/api';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function TravelScreen() {
  const [cityCode, setCityCode] = useState('');
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(today);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(tomorrow);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [adults, setAdults] = useState('1');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New state for location suggestions and input focus
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationFocused, setLocationFocused] = useState(false);

  // Function to fetch location suggestions (mock or real API)
  const fetchLocationSuggestions = (input: string) => {
    // Expanded static list of major cities with their codes
    const locations = [
      'NYC', 'LON', 'PAR', 'BER', 'TOK', 'SYD', 'LAX', 'CHI', 'HOU', 'PHX',
      'PHI', 'SAN', 'DAL', 'SAN', 'DET', 'BOS', 'SEA', 'MIA', 'DEN', 'ATL',
      'AMS', 'ROM', 'MAD', 'BAR', 'VIE', 'ZUR', 'CPH', 'OSL', 'STO', 'HEL',
      'DUB', 'EDI', 'GLA', 'MAN', 'BIR', 'BKK', 'HKG', 'SIN', 'KUL', 'SHA',
      'PEK', 'CAN', 'BOM', 'DEL', 'MUM', 'BLR', 'IST', 'CAI', 'JNB', 'CPT'
    ];
    const filtered = locations.filter(loc => loc.toLowerCase().startsWith(input.toLowerCase()));
    setLocationSuggestions(filtered);
  };

  // Handle location input change with suggestions
  const handleLocationChange = (text: string) => {
    setCityCode(text);
    if (text.length > 0) {
      fetchLocationSuggestions(text);
      setLocationFocused(true);
    } else {
      setLocationSuggestions(['NYC', 'LON', 'PAR', 'BER', 'TOK', 'SYD']); // Show all on empty
      setLocationFocused(true);
    }
  };

  // Handle selecting a location from suggestions
  const handleSelectLocation = (loc: string) => {
    setCityCode(loc);
    setLocationSuggestions([]);
    setLocationFocused(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSearch = async () => {
    if (!cityCode || !checkInDate || !checkOutDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Validate dates
    if (checkOutDate <= checkInDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return;
    }

    // Additional validation: check-in date should not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInDateOnly = new Date(checkInDate);
    checkInDateOnly.setHours(0, 0, 0, 0);

    if (checkInDateOnly < today) {
      Alert.alert('Invalid Check-in Date', 'Check-in date cannot be in the past.');
      return;
    }

    setLoading(true);
    try {
      console.log('Searching hotels with params:', { cityCode, checkInDate: checkInDate.toISOString().split('T')[0], checkOutDate: checkOutDate.toISOString().split('T')[0], adults });
      const checkInStr = checkInDate.toISOString().split('T')[0];
      const checkOutStr = checkOutDate.toISOString().split('T')[0];
      const results = await apiService.searchHotels(cityCode, checkInStr, checkOutStr, parseInt(adults));
      console.log('Hotel search results:', results);
      setHotels(results);

      if (!results || results.length === 0) {
        Alert.alert('No Results', 'No hotels found for the selected criteria. Please try different dates or location.');
      }
    } catch (error: any) {
      console.error('Hotel search error:', error);
      let errorMessage = 'Failed to fetch hotels. Please try again.';

      if (error.response?.status === 400) {
        errorMessage = 'Invalid search parameters. Please check your dates and location.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please contact support.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Search Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHotel = (hotel: any) => {
    router.push({
      pathname: '/travel-product-detail',
      params: {
        id: hotel.hotel.hotelId,
        name: hotel.hotel.name,
        price: hotel.offers[0].price.total,
        rating: hotel.hotel.rating ? hotel.hotel.rating.toString() : 'N/A',
        amenities: hotel.hotel.amenities ? hotel.hotel.amenities.join(',') : '',
        description: hotel.hotel.description || '',
        checkInDate: checkInDate ? checkInDate.toISOString().split('T')[0] : '',
        checkOutDate: checkOutDate ? checkOutDate.toISOString().split('T')[0] : '',
        adults: adults,
      },
    });
  };

  const onCheckInChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      if (checkOutDate && selectedDate >= checkOutDate) {
        setCheckOutDate(undefined);
      }
    }
  };

  const onCheckOutChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(false);
    if (selectedDate) {
      setCheckOutDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#007bff" onPress={handleBackPress} />
        <View style={styles.headerTitle}>
          <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Section */}
        <ThemedView style={styles.searchSection}>
          <ThemedText style={styles.searchTitle}>Find Your Stay</ThemedText>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter city code (e.g. NYC, LON, PAR)"
              placeholderTextColor="#666666"
              value={cityCode}
              onChangeText={handleLocationChange}
            onFocus={() => {
              setLocationFocused(true);
              if (cityCode.length === 0) {
                setLocationSuggestions(['NYC', 'LON', 'PAR', 'BER', 'TOK', 'SYD', 'LAX', 'CHI', 'AMS', 'ROM']);
              }
            }}
            onBlur={() => setTimeout(() => setLocationFocused(false), 200)} // Delay to allow selection
            />
            {locationFocused && locationSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {locationSuggestions.map((loc) => (
                  <TouchableOpacity key={loc} style={styles.suggestionItem} onPress={() => handleSelectLocation(loc)}>
                    <ThemedText>{loc}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.dateInputs}>
            <TouchableOpacity onPress={() => setShowCheckInPicker(true)} style={[styles.searchInput, styles.dateInput, { justifyContent: 'center' }]}>
              <ThemedText>{checkInDate ? checkInDate.toISOString().split('T')[0] : 'Check-in Date'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCheckOutPicker(true)} style={[styles.searchInput, styles.dateInput, { justifyContent: 'center' }]}>
              <ThemedText>{checkOutDate ? checkOutDate.toISOString().split('T')[0] : 'Check-out Date'}</ThemedText>
            </TouchableOpacity>
          </View>
          {showCheckInPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={checkInDate || new Date()}
                mode="date"
                display="default"
                onChange={onCheckInChange}
                minimumDate={new Date()}
              />
            </View>
          )}
          {showCheckOutPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={checkOutDate || new Date()}
                mode="date"
                display="default"
                onChange={onCheckOutChange}
                minimumDate={checkInDate || new Date()}
              />
            </View>
          )}
          <TextInput
            style={styles.searchInput}
            placeholder="Number of guests"
            placeholderTextColor="#666666"
            keyboardType="numeric"
            value={adults}
            onChangeText={setAdults}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            <Ionicons name="search" size={20} color="#ffffff" />
            <ThemedText style={styles.searchButtonText}>{loading ? 'Searching...' : 'Search Hotels'}</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Hotels List */}
        <ThemedView style={styles.hotelsSection}>
          <ThemedText style={styles.sectionTitle}>Available Hotels</ThemedText>
          {hotels.length === 0 ? (
            <ThemedText>No hotels found. Please search to see results.</ThemedText>
          ) : (
            hotels.map((hotel) => (
              <View key={hotel.hotel.hotelId} style={styles.hotelCard}>
                <View style={styles.hotelHeader}>
                  <ThemedText style={styles.hotelName}>{hotel.hotel.name}</ThemedText>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#007bff" />
                    <ThemedText style={styles.ratingText}>{hotel.hotel.rating || 'N/A'}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.hotelDescription}>{hotel.hotel.description || 'No description available.'}</ThemedText>
                <View style={styles.amenitiesContainer}>
                  {hotel.hotel.amenities && hotel.hotel.amenities.map((amenity: string) => (
                    <ThemedText key={amenity} style={styles.amenityText}>{amenity}</ThemedText>
                  ))}
                </View>
                <View style={styles.hotelFooter}>
                  <ThemedText style={styles.priceText}>From ${hotel.offers[0].price.total} / night</ThemedText>
                  <TouchableOpacity style={styles.viewButton} onPress={() => handleViewHotel(hotel)}>
                    <ThemedText style={styles.viewButtonText}>View Details</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ThemedView>
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
    justifyContent: 'center',
  },
  titleText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollContent: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 30,
  },
  searchTitle: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    color: '#333333',
    marginBottom: 15,
  },
  dateInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  hotelsSection: {
    flex: 1,
  },
  sectionTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  hotelCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 15,
    marginBottom: 15,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  hotelName: {
    color: '#333333',
    fontSize: 18,
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
    fontSize: 14,
    marginBottom: 10,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
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
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  viewButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  locationInputContainer: {
    position: 'relative',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 1000,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
});
