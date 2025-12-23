/**
 * TON Service for THRUSTER Payment Integration
 * Production-ready TON blockchain payment handling
 */

import axios from 'axios';

export interface TonContractConfig {
  address: string;
  network: 'testnet' | 'mainnet';
  endpoint: string;
}

export interface OrderData {
  productDetails: string;
  productImage: string;
  orderId?: number;
}

export interface PaymentStatus {
  orderId: number;
  isPaid: boolean;
  transactionHash?: string;
}

export interface PaymentPayload {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
}

export class TonService {
  private config: TonContractConfig;
  private tonConnectUI: any;
  private apiBaseUrl: string;

  constructor(config: TonContractConfig) {
    this.config = config;
    this.apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://thruster-api.netlify.app';
    this.tonConnectUI = null;
  }

  /**
   * Update service configuration
   */
  updateConfig(config: TonContractConfig): void {
    this.config = config;
  }

  /**
   * Set TON Connect UI instance
   */
  setTonConnectUI(tonConnectUI: any): void {
    this.tonConnectUI = tonConnectUI;
  }

  /**
   * Initialize wallet connection
   */
  async initializeWalletConnection(): Promise<{success: boolean, walletAddress?: string, error?: string}> {
    try {
      if (!this.tonConnectUI) {
        throw new Error('TON Connect UI not initialized');
      }

      // Check if already connected
      if (this.isWalletConnected()) {
        const walletAddress = this.getWalletAddress();
        return {
          success: true,
          walletAddress: walletAddress || undefined
        };
      }

      // Wallet is not connected, but initialization is considered successful
      // Connection will happen when user interacts with connect button
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error initializing wallet connection:', error);
      return {
        success: false,
        error: error.message || 'Wallet initialization failed'
      };
    }
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return this.tonConnectUI?.connected || false;
  }

  /**
   * Get connected wallet address
   */
  getWalletAddress(): string | null {
    return this.tonConnectUI?.wallet?.account?.address || null;
  }

  /**
   * Create TON payment payload via backend API
   */
  async createPaymentPayload(orderId: string, amount: number, userWallet: string): Promise<PaymentPayload> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/api/payment/ton/create`, {
        orderId,
        amount,
        userWallet
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment payload');
      }

      return response.data.transaction;
    } catch (error: any) {
      console.error('Error creating payment payload:', error);
      throw new Error(error.response?.data?.message || error.message || 'Payment payload creation failed');
    }
  }

  /**
   * Send TON payment transaction
   */
  async sendPayment(orderId: string, amount: number): Promise<{success: boolean, transactionHash?: string, error?: string}> {
    try {
      if (!this.tonConnectUI) {
        throw new Error('TON Connect UI not initialized');
      }

      if (!this.isWalletConnected()) {
        throw new Error('Wallet not connected');
      }

      const userWallet = this.getWalletAddress();
      if (!userWallet) {
        throw new Error('Unable to get wallet address');
      }

      console.log('Creating TON payment payload for order:', orderId);

      // Get payment payload from backend
      const transaction = await this.createPaymentPayload(orderId, amount, userWallet);

      console.log('Sending TON transaction:', transaction);

      // Send transaction via TON Connect
      const result = await this.tonConnectUI.sendTransaction(transaction);

      console.log('TON payment sent successfully:', result);

      return {
        success: true,
        transactionHash: result.boc
      };
    } catch (error: any) {
      console.error('TON payment error:', error);
      return {
        success: false,
        error: error.message || 'Payment failed'
      };
    }
  }

  /**
   * Verify TON payment via backend API
   */
  async verifyPayment(txHash: string, orderId: string, expectedAmount: number): Promise<{success: boolean, message?: string}> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/api/payment/ton/verify`, {
        txHash,
        orderId,
        expectedAmount
      });

      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Payment verification failed'
      };
    }
  }

  /**
   * Check payment status for an order
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/payment/ton/status/${orderId}`);

      return {
        orderId: parseInt(orderId),
        isPaid: response.data.paymentStatus === 'PAID',
        transactionHash: response.data.txHash
      };
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      return {
        orderId: parseInt(orderId),
        isPaid: false
      };
    }
  }

  /**
   * Get contract balance (for admin purposes)
   */
  async getContractBalance(): Promise<string> {
    try {
      // This would typically be an admin-only endpoint
      const response = await axios.get(`${this.apiBaseUrl}/api/admin/contract-balance`);
      return response.data.balance || '0';
    } catch (error) {
      console.error('Error getting contract balance:', error);
      return '0';
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    try {
      if (this.tonConnectUI) {
        await this.tonConnectUI.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  /**
   * Validate TON address format
   */
  isValidAddress(address: string): boolean {
    try {
      // Basic TON address validation (should start with 'UQ' or 'EQ' for user addresses)
      return /^U[QC][A-Za-z0-9_-]{46}$/.test(address) || /^E[QC][A-Za-z0-9_-]{46}$/.test(address);
    } catch {
      return false;
    }
  }

  /**
   * Format TON amount for display
   */
  formatAmount(amount: number): string {
    return amount.toFixed(2) + ' TON';
  }

  /**
   * Convert TON to nanotons
   */
  toNano(amount: number): string {
    return (amount * 1000000000).toString();
  }

  /**
   * Convert nanotons to TON
   */
  fromNano(amount: string): string {
    return (parseInt(amount) / 1000000000).toFixed(2);
  }
}

// Default configuration for mainnet (production)
export const defaultTonConfig: TonContractConfig = {
  address: process.env.EXPO_PUBLIC_TON_CONTRACT_ADDRESS || 'EQC8rUZqR_pWV1BylWUlPNBzyiTYVoBEmQkMIQDZXICfnuRr', // Replace with actual deployed contract
  network: 'mainnet',
  endpoint: 'https://toncenter.com/api/v2'
};

// Create default TON service instance
export const tonService = new TonService(defaultTonConfig);
