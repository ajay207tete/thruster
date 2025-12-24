import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import TonConnectButton from '../../components/TonConnectButton';
import MenuDropdown from '../../components/MenuDropdown';
import { ThemedText } from '@/components/ThemedText';

export default function Index() {
  return (
    <ImageBackground
      source={require('../../assets/images/welcome.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <MenuDropdown />
        <TonConnectButton />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.welcomeSection}>
            <ThemedText style={styles.title}>Welcome to Thruster</ThemedText>
            <ThemedText style={styles.subtitle}>
              Experience the future of shopping with our blockchain based commerce platform
            </ThemedText>
          </View>

          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/shop')}
            >
              <ThemedText style={styles.ctaButtonText}>Start Shopping</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'SpaceMono',
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#00ff00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'SpaceMono',
  },
});
