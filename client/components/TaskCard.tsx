import React from 'react';
import {
  View,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { Task } from '@/services/rewardService';

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  isClaiming: boolean;
  onClaim: (taskId: string) => void;
  onShare?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompleted,
  isClaiming,
  onClaim,
  onShare,
}) => {
  const handleOpenLink = async () => {
    try {
      await Linking.openURL(task.link);
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'follow_x':
        return 'logo-twitter';
      case 'subscribe_youtube':
        return 'logo-youtube';
      case 'share_app':
        return 'share-social';
      case 'join_telegram':
        return 'paper-plane';
      case 'follow_instagram':
        return 'logo-instagram';
      default:
        return 'trophy';
    }
  };

  const getTaskColor = (taskId: string) => {
    switch (taskId) {
      case 'follow_x':
        return '#00ffff';
      case 'subscribe_youtube':
        return '#ff0000';
      case 'share_app':
        return '#ff0080';
      case 'join_telegram':
        return '#0088cc';
      case 'follow_instagram':
        return '#ff69b4';
      case 'follow_telegram':
        return '#0088cc';
      default:
        return '#00ff00';
    }
  };

  return (
    <View style={[styles.taskCard, isCompleted && styles.completedCard]}>
      <View style={styles.taskLeft}>
        <Ionicons
          name={getTaskIcon(task.taskId)}
          size={24}
          color={getTaskColor(task.taskId)}
        />
        <View style={styles.taskText}>
          <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
          <ThemedText style={styles.taskReward}>+{task.points} Points</ThemedText>
        </View>
      </View>
      <View style={styles.taskRight}>
        <TouchableOpacity
          style={[styles.openButton, { borderColor: getTaskColor(task.taskId) }]}
          onPress={task.taskId === 'share_app' && onShare ? onShare : handleOpenLink}
        >
          <ThemedText style={[styles.openButtonText, { color: getTaskColor(task.taskId) }]}>
            {task.taskId === 'share_app' ? 'Share' : 'Open Link'}
          </ThemedText>
        </TouchableOpacity>
        {isCompleted ? (
          <View style={styles.completedButton}>
            <Ionicons name="checkmark-circle" size={20} color="#00ff00" />
            <ThemedText style={styles.completedText}>Claimed</ThemedText>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.claimButton, isClaiming && styles.claimingButton]}
            onPress={() => onClaim(task.taskId)}
            disabled={isClaiming}
          >
            {isClaiming ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = {
  taskCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
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
  completedCard: {
    borderColor: '#00ff00',
    opacity: 0.8,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskText: {
    marginLeft: 15,
    flex: 1,
  },
  taskTitle: {
    color: '#ffffff',
    fontSize: 16,
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
    fontSize: 14,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: '#ff0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  openButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  claimButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimingButton: {
    opacity: 0.7,
  },
  claimButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00ff00',
  },
  completedText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginLeft: 5,
  },
};

export default TaskCard;
