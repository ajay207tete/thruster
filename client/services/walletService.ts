import { TonConnectUI } from '@tonconnect/ui-react';
import { api } from './api';

export interface WalletUser {
  walletAddress: string;
  createdAt: string;
  lastLogin: string;
}

export class WalletService {
  private tonConnectUI: TonConnectUI;

  constructor(tonConnectUI: TonConnectUI) {
    this.tonConnectUI = tonConnectUI;
  }

  async connectWallet(): Promise<WalletUser> {
    try {
      // Check if wallet is already connected
      if (this.tonConnectUI.connected && this.tonConnectUI.wallet) {
        const walletAddress = this.tonConnectUI.wallet.account.address;

        // Send to backend (wallet already connected, just authenticate)
        const response = await api.post('/auth/wallet-connect', {
          walletAddress
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to authenticate wallet');
        }

        return response.data.user;
      }

      // Connect wallet
      await this.tonConnectUI.connectWallet();

      // Get wallet address
      const wallet = this.tonConnectUI.wallet;
      if (!wallet) {
        throw new Error('Failed to connect wallet');
      }

      const walletAddress = wallet.account.address;

      // Send to backend
      const response = await api.post('/auth/wallet-connect', {
        walletAddress
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to connect wallet');
      }

      return response.data.user;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await this.tonConnectUI.disconnect();
    } catch (error) {
      console.error('Wallet disconnect error:', error);
      throw error;
    }
  }

  getConnectedWallet(): string | null {
    const wallet = this.tonConnectUI.wallet;
    return wallet ? wallet.account.address : null;
  }

  isWalletConnected(): boolean {
    return this.tonConnectUI.connected;
  }
}
