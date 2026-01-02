import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://thruster-api.netlify.app';

export interface Reward {
  _id: string;
  actionType: string;
  platform: string;
  points: number;
  status: string;
  timestamp: string;
}

export interface RewardsResponse {
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

class RewardService {
  /**
   * Get rewards history for a wallet
   */
  async getRewards(walletAddress: string): Promise<RewardsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/.netlify/functions/rewards/${walletAddress}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching rewards:', error);
      return {
        success: false,
        totalPoints: 0,
        rewards: [],
        error: error.response?.data?.error || 'Failed to fetch rewards'
      };
    }
  }

  /**
   * Claim a social reward
   */
  async claimReward(walletAddress: string, actionType: string, platform: string): Promise<ClaimRewardResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/.netlify/functions/rewards`, {
        walletAddress,
        actionType,
        platform
      });
      return response.data;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to claim reward'
      };
    }
  }
}

export const rewardService = new RewardService();
