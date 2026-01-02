import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { tonService } from '@/services/tonService-updated';
import { rewardService } from '@/services/rewardService';

interface Reward {
  _id: string;
  actionType: string;
  platform: string;
  points: number;
  status: string;
  timestamp: string;
}

export default function RewardsScreen() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [pointsAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const address = tonService.getWalletAddress();
      if (!address) {
        Alert.alert('Error', 'Please connect your wallet first');
        setLoading(false);
        return;
      }

      setWalletAddress(address);
      const response = await rewardService.getRewards(address);

      if (response.success) {
        setTotalPoints(response.totalPoints);
        setRewards(response.rewards);
      } else {
        Alert.alert('Error', response.error || 'Failed to load rewards');
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const animatePoints = () => {
    Animated.sequence([
      Animated.timing(pointsAnimation, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pointsAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSocialAction = async (actionType: string, platform: string, url: string) => {
    try {
      // Open external link
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open link');
        return;
      }

      // Ask user to confirm they completed the action
      Alert.alert(
        'Action Completed?',
        `Did you successfully ${actionType.toLowerCase().replace('_', ' ')} on ${platform}?`,
        [
          { text: 'Not yet', style: 'cancel' },
          {
            text: 'Yes, claim points',
            onPress: () => claimReward(actionType, platform),
          },
        ]
      );
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const claimReward = async (actionType: string, platform: string) => {
    if (!walletAddress) return;

    setClaiming(`${actionType}-${platform}`);
    try {
      const response = await rewardService.claimReward(walletAddress, actionType, platform);

      if (response.success) {
        setTotalPoints(response.totalPoints);
        animatePoints();
        Alert.alert('Success', `${response.pointsAdded} Points Added 🎉`);
        await loadRewardsData(); // Refresh data
      } else {
        Alert.alert('Error', response.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const formatWalletAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityTypeLabel = (actionType: string): string => {
    const labels: { [key: string]: string } = {
      PURCHASE: 'Purchase',
      FOLLOW_X: 'Follow',
      FOLLOW_INSTAGRAM: 'Follow',
      SHARE_APP: 'Share',
    };
    return labels[actionType] || actionType;
  };

  const getPlatformLabel = (platform: string): string => {
    const labels: { [key: string]: string } = {
      STORE_PURCHASE: 'Store Purchase',
      X: 'X (Twitter)',
      INSTAGRAM: 'Instagram',
      APP_SHARE: 'App Share',
    };
    return labels[platform] || platform;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <ThemedText style={styles.loadingText}>Loading rewards...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00ff00" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>My Rewards</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ThemedText style={styles.subtitle}>
        Earn points by shopping and completing social tasks
      </ThemedText>

      {/* Wallet and Points Display */}
      <View style={styles.walletSection}>
        <ThemedText style={styles.walletLabel}>Wallet:</ThemedText>
        <ThemedText style={styles.walletAddress}>
          {formatWalletAddress(walletAddress)}
        </ThemedText>
      </View>

      <Animated.View style={[styles.pointsCard, { transform: [{ scale: pointsAnimation }] }]}>
        <ThemedText style={styles.pointsLabel}>Total Points</ThemedText>
        <ThemedText style={styles.pointsValue}>{totalPoints.toLocaleString()}</ThemedText>
      </Animated.View>

      {/* Points Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="cart" size={24} color="#00ff00" />
          <View style={styles.summaryText}>
            <ThemedText style={styles.summaryTitle}>Purchase Rewards</ThemedText>
            <ThemedText style={styles.summaryDesc}>
              Earn points every time you buy products or services
            </ThemedText>
            <ThemedText style={styles.summaryExample}>1 TON spent = 10 points</ThemedText>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="share-social" size={24} color="#00ff00" />
          <View style={styles.summaryText}>
            <ThemedText style={styles.summaryTitle}>Social Rewards</ThemedText>
            <ThemedText style={styles.summaryDesc}>
              Earn points by following and sharing
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Points History Table */}
      <View style={styles.tableContainer}>
        <ThemedText style={styles.tableTitle}>Points History</ThemedText>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.tableHeaderText, { flex: 1 }]}>Date</ThemedText>
          <ThemedText style={[styles.tableHeaderText, { flex: 1.5 }]}>Activity</ThemedText>
          <ThemedText style={[styles.tableHeaderText, { flex: 1 }]}>Platform</ThemedText>
          <ThemedText style={[styles.tableHeaderText, { flex: 0.8 }]}>Points</ThemedText>
          <ThemedText style={[styles.tableHeaderText, { flex: 0.8 }]}>Status</ThemedText>
        </View>

        {rewards.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No rewards yet. Start earning points!</ThemedText>
          </View>
        ) : (
          rewards.map((reward) => (
            <View key={reward._id} style={styles.tableRow}>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>
                {formatDate(reward.timestamp)}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1.5 }]}>
                {getActivityTypeLabel(reward.actionType)}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1 }]}>
                {getPlatformLabel(reward.platform)}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 0.8, color: '#00ff00' }]}>
                +{reward.points}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 0.8 }]}>
                {reward.status === 'COMPLETED' ? '✓' : 'Pending'}
              </ThemedText>
            </View>
          ))
        )}
      </View>

      {/* Social Tasks Section */}
      <View style={styles.tasksContainer}>
        <ThemedText style={styles.tasksTitle}>Earn More Points</ThemedText>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => handleSocialAction('FOLLOW_X', 'X', 'https://twitter.com/thruster_fi')}
          disabled={claiming === 'FOLLOW_X-X'}
        >
          <View style={styles.taskLeft}>
            <Ionicons name="logo-twitter" size={24} color="#00ff00" />
            <View style={styles.taskText}>
              <ThemedText style={styles.taskTitle}>Follow on X</ThemedText>
              <ThemedText style={styles.taskReward}>+100 Points</ThemedText>
            </View>
          </View>
          {claiming === 'FOLLOW_X-X' ? (
            <ActivityIndicator size="small" color="#00ff00" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#00ff00" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => handleSocialAction('FOLLOW_INSTAGRAM', 'INSTAGRAM', 'https://www.instagram.com/thruster.co.in?igsh=cTF2MG05ZDczNHU=')}
          disabled={claiming === 'FOLLOW_INSTAGRAM-INSTAGRAM'}
        >
          <View style={styles.taskLeft}>
            <Ionicons name="logo-instagram" size={24} color="#00ff00" />
            <View style={styles.taskText}>
              <ThemedText style={styles.taskTitle}>Follow on Instagram</ThemedText>
              <ThemedText style={styles.taskReward}>+100 Points</ThemedText>
            </View>
          </View>
          {claiming === 'FOLLOW_INSTAGRAM-INSTAGRAM' ? (
            <ActivityIndicator size="small" color="#00ff00" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#00ff00" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => handleSocialAction('SHARE_APP', 'APP_SHARE', 'https://t.me/Thruster_shop_bot')}
          disabled={claiming === 'SHARE_APP-APP_SHARE'}
        >
          <View style={styles.taskLeft}>
            <Ionicons name="share" size={24} color="#00ff00" />
            <View style={styles.taskText}>
              <ThemedText style={styles.taskTitle}>Share App Link</ThemedText>
              <ThemedText style={styles.taskReward}>+100 Points per valid share</ThemedText>
            </View>
          </View>
          {claiming === 'SHARE_APP-APP_SHARE' ? (
            <ActivityIndicator size="small" color="#00ff00" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#00ff00" />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const { width, height } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  // Main Container with Cyberpunk Background
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },

  // Cyberpunk Loading
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

  // Cyberpunk Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? 15 : 20,
    paddingTop: isMobile ? 40 : 50,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    borderBottomWidth: 2,
    borderBottomColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 32,
  },
  title: {
    color: '#ffffff',
    fontSize: isMobile ? 20 : 24,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#ff0080',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },

  // Wallet Section with Cyberpunk Styling
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

  // Cyberpunk Points Card
  pointsCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    marginHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
    padding: isMobile ? 20 : 25,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#00ffff',
    alignItems: 'center',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  pointsLabel: {
    color: '#ff0080',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pointsValue: {
    color: '#00ffff',
    fontSize: isMobile ? 32 : 36,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },

  // Summary Container
  summaryContainer: {
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    flexDirection: 'row',
    padding: isMobile ? 15 : 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ff0080',
    shadowColor: '#ff0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  summaryText: {
    flex: 1,
    marginLeft: isMobile ? 12 : 15,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  summaryDesc: {
    color: '#cccccc',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryExample: {
    color: '#888',
    fontSize: isMobile ? 10 : 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Table Container
  tableContainer: {
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
  },
  tableTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    padding: isMobile ? 12 : 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  tableHeaderText: {
    color: '#00ffff',
    fontSize: isMobile ? 10 : 12,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 5, 5, 0.9)',
    padding: isMobile ? 10 : 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  tableCell: {
    color: '#ffffff',
    fontSize: isMobile ? 10 : 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Tasks Container
  tasksContainer: {
    paddingHorizontal: isMobile ? 20 : 30,
    paddingBottom: 40,
  },
  tasksTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 16 : 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  taskCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? 15 : 20,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskText: {
    marginLeft: isMobile ? 12 : 15,
    flex: 1,
  },
  taskTitle: {
    color: '#ffffff',
    fontSize: isMobile ? 14 : 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  taskReward: {
    color: '#ff0080',
    fontSize: isMobile ? 12 : 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
