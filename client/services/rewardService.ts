import { apiService } from './api';

export interface Task {
  taskId: string;
  title: string;
  points: number;
  link: string;
  isActive: boolean;
}

export interface UserPoints {
  points: number;
  completedTasks: string[];
}

export interface Reward {
  _id: string;
  actionType: string;
  platform: string;
  points: number;
  status: string;
  timestamp: string;
}

export interface RewardResponse {
  success: boolean;
  totalPoints: number;
  rewards: Reward[];
  error?: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  message?: string;
  pointsAdded?: number;
  totalPoints?: number;
  error?: string;
}

export class RewardService {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await apiService.get('/rewards/tasks');
      return response.data;
    } catch (error) {
      console.error('Get tasks error:', error);
      throw error;
    }
  }

  async getUserPoints(walletAddress: string): Promise<UserPoints> {
    try {
      const response = await apiService.get(`/rewards/users/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Get user points error:', error);
      throw error;
    }
  }

  async claimReward(walletAddress: string, taskId: string): Promise<ClaimRewardResponse> {
    try {
      const response = await apiService.post('/rewards/claim', {
        walletAddress,
        taskId
      });
      return response.data;
    } catch (error) {
      console.error('Claim reward error:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async getRewards(walletAddress: string): Promise<RewardResponse> {
    try {
      const response = await apiService.get(`/rewards/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Get rewards error:', error);
      throw error;
    }
  }
}
