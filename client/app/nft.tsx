import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { tonService } from '@/services/tonService-updated';
import Header from '@/components/Header';

export default function NFTPage() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const address = tonService.getWalletAddress();
      if (!address) {
        Alert.alert(
          'Wallet Required',
          'Please connect your wallet to view NFTs',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
            { text: 'Connect Wallet', onPress: () => router.push('/') }
          ]
        );
        setLoading(false);
        return;
      }
      setWalletAddress(address);
      console.log('NFT Page - Wallet Address:', address);
    } catch (error) {
      console.error('Error checking wallet:', error);
      Alert.alert('Error', 'Failed to check wallet connection');
    } finally {
      setLoading(false);
    }
  };

  const formatWalletAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <ThemedText style={styles.loadingText}>Checking wallet...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={false} />
      <View style={styles.walletSection}>
        <ThemedText style={styles.walletLabel}>Wallet:</ThemedText>
        <ThemedText style={styles.walletAddress}>
          {formatWalletAddress(walletAddress)}
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.nftPlaceholder}>
          <Ionicons name="image" size={80} color="#00ff00" />
          <ThemedText style={styles.nftTitle}>NFT Collection</ThemedText>
          <ThemedText style={styles.nftDescription}>
            Your NFT collection will appear here once connected to your wallet.
          </ThemedText>
        </View>
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
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
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
    marginTop: 10,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  walletSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 15,
  },
  walletLabel: {
    color: '#00ffff',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 10,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  walletAddress: {
    color: '#ffffff',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 2,
    borderColor: '#00ffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  nftPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  nftTitle: {
    color: '#00ffff',
    fontSize: isMobile ? 24 : 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  nftDescription: {
    color: '#cccccc',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  nftAddress: {
    color: '#ff0080',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
