import axios from 'axios';

export interface TelegramAuthResponse {
  success: boolean;
  user?: {
    id: string;
    telegramId: number;
    telegramUsername?: string;
    telegramFirstName: string;
    telegramLastName?: string;
    telegramPhotoUrl?: string;
    isTelegramPremium: boolean;
    createdAt: string;
    lastLogin: string;
  };
  token?: string;
  error?: string;
}

class TelegramAuthService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to current origin
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  }

  /**
   * Authenticate user with Telegram initData
   */
  async authenticate(initData: string): Promise<TelegramAuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/telegram`, {
        initData
      });

      return response.data;
    } catch (error: any) {
      console.error('Telegram authentication error:', error);

      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.message || 'Authentication failed'
        };
      }

      return {
        success: false,
        error: 'Network error during authentication'
      };
    }
  }

  /**
   * Validate session token (if implementing token-based auth)
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/validate-token`, {
        token
      });

      return response.data.valid || false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Logout user (clear session)
   */
  async logout(token: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/logout`, {
        token
      });

      return response.data.success || false;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
}

export const telegramAuthService = new TelegramAuthService();
export default telegramAuthService;
