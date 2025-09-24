import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import PageHeader from '@/components/PageHeader';
import { apiService, User } from '@/services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // For demo, fetch user with ID '1' - replace with actual user ID logic
        const userId = '1';
        const userData = await apiService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
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
        <ThemedText style={styles.title}>Profile</ThemedText>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.subtitle}>Manage your profile information.</ThemedText>
        {user ? (
          <>
            <ThemedText style={styles.profileText}>Name: {user.name}</ThemedText>
            <ThemedText style={styles.profileText}>Email: {user.email}</ThemedText>
            <ThemedText style={styles.profileText}>Shipping Address:</ThemedText>
            <ThemedText style={styles.profileText}>
              {user.shippingDetails.address}, {user.shippingDetails.city},{' '}
              {user.shippingDetails.postalCode}, {user.shippingDetails.country}
            </ThemedText>
          </>
        ) : (
          <ThemedText style={styles.placeholder}>No profile data available.</ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  content: {
    paddingBottom: 20,
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
  profileText: {
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'SpaceMono',
    marginBottom: 10,
  },
  placeholder: {
    color: '#ffffff',
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
});
