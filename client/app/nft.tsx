import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export default function NFTPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>NFT Collection</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Empty page content */}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
    paddingTop: isMobile ? 50 : 60,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    color: '#00ff00',
    fontFamily: 'SpaceMono',
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
