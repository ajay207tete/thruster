import { apiService } from './api';

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
  async getRewards(walletAddress: string): Promise<RewardResponse> {
    try {
      const response = await apiService.get(`/rewards/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Get rewards error:', error);
      throw error;
    }
  }

  async claimReward(walletAddress: string, actionType: string, platform: string): Promise<ClaimRewardResponse> {
    try {
      const response = await apiService.post('/rewards', {
        walletAddress,
        actionType,
        platform
      });
      return response.data;
    } catch (error) {
      console.error('Claim reward error:', error);
      throw error;
    }
  }
}
