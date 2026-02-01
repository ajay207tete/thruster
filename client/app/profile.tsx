import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { apiService, User, Order } from '@/services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // For demo, fetch user with ID '1' - replace with actual user ID logic
        const userId = '1';
        const userData = await apiService.getUserById(userId);
        setUser(userData);

        // Fetch recent orders
        const ordersData = await apiService.getUserOrders(userId);
        setOrders(ordersData.orders?.slice(0, 3) || []); // Get last 3 orders
      } catch (err) {
        setError('Failed to load profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleViewOrders = () => {
    router.push('/my-order');
  };

  const handleViewRewards = () => {
    router.push('/rewards');
  };

  const handleViewNFTs = () => {
    router.push('/nft');
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#00ff00';
      case 'shipped':
        return '#00aaff';
      case 'processing':
        return '#ffaa00';
      case 'pending':
        return '#ffaa00';
      case 'cancelled':
        return '#ff0000';
      default:
        return '#666666';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header backgroundColor="#000000" showCartIcon={false} title="PROFILE" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="refresh-circle" size={60} color="#00ff00" />
          </View>
          <ThemedText style={styles.loadingText}>LOADING PROFILE...</ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header backgroundColor="#000000" showCartIcon={false} title="PROFILE" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color="#ff0000" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <ThemedText style={styles.retryButtonText}>RETRY</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={false} title="PROFILE" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={60} color="#00ff00" />
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>
              {user?.name || 'CYBER USER'}
            </ThemedText>
            <ThemedText style={styles.userEmail}>
              {user?.email || 'user@cyberpunk.com'}
            </ThemedText>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet" size={30} color="#00ff00" />
            </View>
            <View style={styles.statInfo}>
              <ThemedText style={styles.statValue}>
                {user?.totalPoints || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>POINTS</ThemedText>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="receipt" size={30} color="#00ffff" />
            </View>
            <View style={styles.statInfo}>
              <ThemedText style={styles.statValue}>
                {orders.length}
              </ThemedText>
              <ThemedText style={styles.statLabel}>ORDERS</ThemedText>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle" size={30} color="#ff0080" />
            </View>
            <View style={styles.statInfo}>
              <ThemedText style={styles.statValue}>
                {user?.isActive ? 'ONLINE' : 'OFFLINE'}
              </ThemedText>
              <ThemedText style={styles.statLabel}>STATUS</ThemedText>
            </View>
          </View>
        </View>

        {/* Wallet Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>WALLET INFORMATION</ThemedText>
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Ionicons name="hardware-chip" size={24} color="#00ff00" />
              <ThemedText style={styles.walletTitle}>TON WALLET</ThemedText>
            </View>
            <ThemedText style={styles.walletAddress}>
              {user?.walletAddress ?
                `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-8)}` :
                'Not Connected'
              }
            </ThemedText>
            <View style={styles.walletActions}>
              <TouchableOpacity style={styles.walletButton}>
                <Ionicons name="copy" size={16} color="#00ff00" />
                <ThemedText style={styles.walletButtonText}>COPY</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.walletButton}>
                <Ionicons name="open" size={16} color="#00ffff" />
                <ThemedText style={styles.walletButtonText}>VIEW</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>RECENT ORDERS</ThemedText>
            <TouchableOpacity onPress={handleViewOrders}>
              <ThemedText style={styles.viewAllText}>VIEW ALL</ThemedText>
            </TouchableOpacity>
          </View>

          {orders.length > 0 ? (
            orders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <ThemedText style={styles.orderId}>
                    #{order._id.slice(-8).toUpperCase()}
                  </ThemedText>
                  <View style={[styles.orderStatus, { borderColor: getOrderStatusColor(order.paymentStatus) }]}>
                    <ThemedText style={[styles.orderStatusText, { color: getOrderStatusColor(order.paymentStatus) }]}>
                      {order.paymentStatus.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={styles.orderTotal}>
                  ${order.totalAmount.toFixed(2)}
                </ThemedText>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt" size={48} color="#333333" />
              <ThemedText style={styles.emptyText}>No orders yet</ThemedText>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <ThemedText style={styles.shopButtonText}>START SHOPPING</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>QUICK ACTIONS</ThemedText>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewOrders}>
              <View style={styles.actionIcon}>
                <Ionicons name="receipt" size={32} color="#00ff00" />
              </View>
              <ThemedText style={styles.actionText}>My Orders</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleViewRewards}>
              <View style={styles.actionIcon}>
                <Ionicons name="gift" size={32} color="#ff0080" />
              </View>
              <ThemedText style={styles.actionText}>Rewards</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleViewNFTs}>
              <View style={styles.actionIcon}>
                <Ionicons name="image" size={32} color="#00ffff" />
              </View>
              <ThemedText style={styles.actionText}>My NFTs</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/shop')}>
              <View style={styles.actionIcon}>
                <Ionicons name="bag" size={32} color="#ffaa00" />
              </View>
              <ThemedText style={styles.actionText}>Shop</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    padding: isMobile ? 20 : 30,
    paddingBottom: 100,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    marginBottom: 20,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  loadingText: {
    color: '#00ff00',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#ff0000',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  retryButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ff0000',
    paddingVertical: isMobile ? 12 : 15,
    paddingHorizontal: isMobile ? 25 : 30,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  retryButtonText: {
    color: '#ff0000',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00ff00',
    padding: isMobile ? 20 : 25,
    marginBottom: 25,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isMobile ? 15 : 20,
  },
  avatar: {
    width: isMobile ? 80 : 100,
    height: isMobile ? 80 : 100,
    borderRadius: isMobile ? 40 : 50,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: isMobile ? 20 : 25,
    height: isMobile ? 20 : 25,
    borderRadius: isMobile ? 10 : 12.5,
    backgroundColor: '#00ff00',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#00ff00',
    fontSize: isMobile ? 20 : 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 5,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  userEmail: {
    color: '#cccccc',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: isMobile ? 10 : 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: isMobile ? 15 : 20,
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  statIcon: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  statInfo: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  statLabel: {
    color: '#cccccc',
    fontSize: isMobile ? 10 : 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#00ffff',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Wallet Card
  walletCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#00ff00',
    padding: isMobile ? 20 : 25,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  walletTitle: {
    color: '#00ff00',
    fontSize: isMobile ? 16 : 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 10,
  },
  walletAddress: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  walletButtonText: {
    color: '#00ff00',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 5,
  },

  // Order Cards
  orderCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    padding: isMobile ? 15 : 20,
    marginBottom: 10,
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    color: '#00ff00',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  orderStatus: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderStatusText: {
    fontSize: isMobile ? 10 : 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  orderDate: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  orderTotal: {
    color: '#00ff00',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#666666',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 15,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: 'transparent',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00ff00',
    paddingVertical: isMobile ? 12 : 15,
    paddingHorizontal: isMobile ? 25 : 30,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  shopButtonText: {
    color: '#00ff00',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: isMobile ? 15 : 20,
  },
  actionButton: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: isMobile ? 20 : 25,
    alignItems: 'center',
    width: isMobile ? '48%' : '23%',
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIcon: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  actionText: {
    color: '#ffffff',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
