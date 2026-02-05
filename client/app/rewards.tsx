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
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { tonService } from '@/services/tonService-updated';
import { RewardService, Task, UserPoints } from '@/services/rewardService';
import { apiService } from '@/services/api';
import Header from '@/components/Header';
import TaskCard from '@/components/TaskCard';


export default function RewardsScreen() {
  const rewardService = new RewardService();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [pointsAnimation] = useState(new Animated.Value(1));
  const [tasks, setTasks] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const address = tonService.getWalletAddress();
      if (!address) {
        Alert.alert(
          'Wallet Required',
          'Please connect your wallet to view rewards',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
            { text: 'Connect Wallet', onPress: () => router.push('/') }
          ]
        );
        setLoading(false);
        return;
      }
      setWalletAddress(address);
      console.log('Rewards Page - Wallet Address:', address);
      await loadRewardsData();
    } catch (error) {
      console.error('Error checking wallet:', error);
      Alert.alert('Error', 'Failed to check wallet connection');
      setLoading(false);
    }
  };

  const loadRewardsData = async () => {
    try {
      const address = tonService.getWalletAddress();
      if (!address) {
        Alert.alert('Error', 'Please connect your wallet first');
        setLoading(false);
        return;
      }

      setWalletAddress(address);

      // Load user points
      const userPointsResponse = await rewardService.getUserPoints(address);
      setUserPoints(userPointsResponse);
      setTotalPoints(userPointsResponse.points);

      // Fetch tasks
      await fetchTasks();

      // Load rewards history for backward compatibility
      const rewardsResponse = await rewardService.getRewards(address);
      if (rewardsResponse.success) {
        setRewards(rewardsResponse.rewards);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      setError(null);

      console.log("Fetching tasks from API...");
      const data = await apiService.getTasks();

      console.log("Tasks API raw:", data);

      const rawTasks =
        Array.isArray(data) ? data :
        data?.tasks ? data.tasks :
        data?.data ? data.data :
        data?.result ? data.result :
        [];

      const normalizedTasks = rawTasks.map((task: any, index: number) => ({
        ...task,
        id: task._id || task.id || task.taskId || `task-${index}`
      }));

      setTasks([...normalizedTasks]);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
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

  const handleClaimReward = async (taskId: string) => {
    setClaiming(taskId);
    try {
      const response = await rewardService.claimReward(walletAddress, taskId);
      if (response.success) {
        animatePoints();
        const pointsAdded = response.pointsAdded || 0;
        setTotalPoints(prev => prev + pointsAdded);
        setUserPoints(prev => prev ? { ...prev, points: prev.points + pointsAdded, completedTasks: [...prev.completedTasks, taskId] } : null);
        Alert.alert('Success', response.message || 'Reward claimed successfully!');
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

  const handleShare = async () => {
    const message = `🎉 Earn crypto rewards on Thruster! Shop with TON and get points for NFTs, exclusive drops, and more. Join now: https://t.me/thruster_bot`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Thruster Rewards',
            text: message,
            url: 'https://t.me/thruster_bot',
          });
        } else {
          await navigator.clipboard.writeText(message);
          Alert.alert('Copied!', 'Share link copied to clipboard');
        }
      } else {
        await Share.share({
          message,
          url: 'https://t.me/thruster_bot',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatWalletAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
    <ThemedView style={styles.container}>
      <Header backgroundColor="#000000" showCartIcon={false} />

      <View style={styles.walletSection}>
        <ThemedText style={styles.walletLabel}>Wallet:</ThemedText>
        <ThemedText style={styles.walletAddress}>
          {formatWalletAddress(walletAddress)}
        </ThemedText>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.subtitle}>
          Earn points by shopping and completing social tasks
        </ThemedText>

        {/* Points Display */}
        <View style={styles.pointsContainer}>
          <Animated.View style={[styles.pointsCard, { transform: [{ scale: pointsAnimation }] }]}>
            <ThemedText style={styles.pointsLabel}>Total Points</ThemedText>
            <ThemedText style={styles.pointsValue}>{totalPoints}</ThemedText>
          </Animated.View>
        </View>

        {/* Tasks Container */}
        <View style={styles.tasksContainer}>
          <ThemedText style={styles.tasksTitle}>Complete Tasks to Earn Points</ThemedText>
          {tasksLoading && <ThemedText style={styles.loadingText}>Loading tasks...</ThemedText>}
          {!tasksLoading && error && <ThemedText style={styles.errorText}>Error: {error}</ThemedText>}
          {!tasksLoading && tasks.length === 0 && !error && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy" size={60} color="#666666" />
              <ThemedText style={styles.emptyText}>No tasks available</ThemedText>
            </View>
          )}
          {tasks.length > 0 &&
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isCompleted={userPoints?.completedTasks.includes(task.id) || false}
                isClaiming={claiming === task.id}
                onClaim={handleClaimReward}
                onShare={task.id === 'share_app' ? handleShare : undefined}
              />
            ))}
        </View>

        {/* Rewards History */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Rewards History</ThemedText>
          {rewards.length > 0 ? (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <ThemedText style={styles.tableHeaderText}>Date</ThemedText>
                <ThemedText style={styles.tableHeaderText}>Activity</ThemedText>
                <ThemedText style={styles.tableHeaderText}>Platform</ThemedText>
                <ThemedText style={styles.tableHeaderText}>Points</ThemedText>
                <ThemedText style={styles.tableHeaderText}>Status</ThemedText>
              </View>
              {rewards.map((reward) => (
                <View key={reward._id} style={styles.tableRow}>
                  <ThemedText style={styles.tableCell}>{formatDate(reward.timestamp)}</ThemedText>
                  <ThemedText style={styles.tableCell}>{reward.actionType}</ThemedText>
                  <ThemedText style={styles.tableCell}>{reward.platform}</ThemedText>
                  <ThemedText style={styles.tableCell}>+{reward.points}</ThemedText>
                  <View style={styles.statusContainer}>
                    {reward.status === 'COMPLETED' ? (
                      <Ionicons name="checkmark-circle" size={16} color="#00ff00" />
                    ) : (
                      <ThemedText style={styles.pendingText}>Pending</ThemedText>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy" size={60} color="#666666" />
              <ThemedText style={styles.emptyText}>No rewards yet. Start earning points!</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
    paddingHorizontal: isMobile ? 20 : 30,
    marginTop: 20,
  },
  pointsContainer: {
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: 15,
    padding: isMobile ? 20 : 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ffff',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  pointsLabel: {
    color: '#00ffff',
    fontSize: isMobile ? 16 : 18,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pointsValue: {
    color: '#ffffff',
    fontSize: isMobile ? 48 : 64,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  section: {
    paddingHorizontal: isMobile ? 20 : 30,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ff0080',
    fontSize: isMobile ? 18 : 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  tableContainer: {
    backgroundColor: 'rgba(5, 5, 5, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: isMobile ? 8 : 10,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: isMobile ? 10 : 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
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
    flex: 1,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingText: {
    color: '#ffaa00',
    fontSize: isMobile ? 10 : 12,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
  errorText: {
    color: '#ff0000',
    fontSize: isMobile ? 14 : 16,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
});
