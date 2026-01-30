import { TonConnectUI } from '@tonconnect/ui-react';

export interface OrderData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

class TonService {
  private tonConnectUI: any = null;

  constructor() {
    // TonConnectUI will be set via setTonConnectUI from the component
  }

  // Set the TonConnect UI instance
  setTonConnectUI(tonConnectUI: any) {
    this.tonConnectUI = tonConnectUI;
  }

  // Initialize wallet connection
  async initializeWalletConnection() {
    try {
      if (!this.tonConnectUI) {
        return { success: false, error: 'TonConnect not initialized' };
      }

      // Check if already connected
      const walletAddress = this.getWalletAddress();
      if (walletAddress) {
        return { success: true, walletAddress };
      }

      // If not connected, return success but no wallet (user needs to connect manually)
      return { success: true, walletAddress: null };
    } catch (error) {
      console.error('Error initializing wallet connection:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get the connected wallet address
  getWalletAddress(): string | null {
    try {
      if (!this.tonConnectUI) {
        return null;
      }

      const wallet = this.tonConnectUI.wallet;
      if (wallet && wallet.account) {
        return wallet.account.address;
      }

      return null;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return this.getWalletAddress() !== null;
  }

  // Get wallet info
  getWalletInfo() {
    try {
      if (!this.tonConnectUI) {
        return null;
      }

      const wallet = this.tonConnectUI.wallet;
      return wallet || null;
    } catch (error) {
      console.error('Error getting wallet info:', error);
      return null;
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    try {
      if (this.tonConnectUI) {
        await this.tonConnectUI.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  // Send transaction (placeholder for future implementation)
  async sendTransaction(transaction: any) {
    try {
      if (!this.tonConnectUI) {
        throw new Error('TonConnect not initialized');
      }

      // This would be implemented with actual TON transaction logic
      console.log('Sending transaction:', transaction);
      return { success: true, txHash: 'mock_tx_hash' };
    } catch (error) {
      console.error('Error sending transaction:', error);
      return { success: false, error: error.message };
    }
  }

  // Get balance (placeholder for future implementation)
  async getBalance() {
    try {
      // This would be implemented with actual TON balance checking
      return { balance: '0', currency: 'TON' };
    } catch (error) {
      console.error('Error getting balance:', error);
      return { balance: '0', currency: 'TON', error: error.message };
    }
  }
}

// Export singleton instance
export const tonService = new TonService();

// Export types
export { TonService };
