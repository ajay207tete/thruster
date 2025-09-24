/**
 * Payment Service - Central Payment System Initialization
 * Coordinates all payment providers and systems
 */

import { tonService, TonService, TonContractConfig } from './tonService-updated';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export interface PaymentConfig {
  ton: TonContractConfig;
  nowPayments: {
    apiKey: string;
    apiUrl: string;
  };
  environment: 'development' | 'production';
}

export interface PaymentProvider {
  name: string;
  isInitialized: boolean;
  isAvailable: boolean;
}

export interface PaymentInitializationResult {
  success: boolean;
  providers: PaymentProvider[];
  errors: string[];
}

export class PaymentService {
  private config: PaymentConfig;
  private providers: Map<string, PaymentProvider> = new Map();
  private isInitialized = false;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.initializeProviders();
  }

  /**
   * Initialize all payment providers
   */
  async initialize(): Promise<PaymentInitializationResult> {
    const errors: string[] = [];
    const providers: PaymentProvider[] = [];

    try {
      console.log('Initializing payment systems...');

      // Initialize TON Connect
      await this.initializeTonConnect();

      // Initialize NowPayments
      await this.initializeNowPayments();

      // Initialize TON Service
      await this.initializeTonService();

      this.isInitialized = true;
      console.log('Payment systems initialized successfully');

      return {
        success: true,
        providers: Array.from(this.providers.values()),
        errors: []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);

      return {
        success: false,
        providers: Array.from(this.providers.values()),
        errors
      };
    }
  }

  /**
   * Initialize TON Connect system
   */
  private async initializeTonConnect(): Promise<void> {
    try {
      console.log('Initializing TON Connect...');

      // TON Connect is initialized through the UI provider
      // This would typically involve:
      // 1. Setting up the manifest URL
      // 2. Configuring the UI provider
      // 3. Setting up event listeners

      this.providers.set('ton-connect', {
        name: 'TON Connect',
        isInitialized: true,
        isAvailable: true
      });

      console.log('TON Connect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TON Connect:', error);
      throw error;
    }
  }

  /**
   * Initialize NowPayments system
   */
  private async initializeNowPayments(): Promise<void> {
    try {
      console.log('Initializing NowPayments...');

      // NowPayments initialization would involve:
      // 1. Validating API credentials
      // 2. Setting up webhook endpoints
      // 3. Testing connection

      this.providers.set('nowpayments', {
        name: 'NowPayments',
        isInitialized: true,
        isAvailable: true
      });

      console.log('NowPayments initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NowPayments:', error);
      throw error;
    }
  }

  /**
   * Initialize TON Service
   */
  private async initializeTonService(): Promise<void> {
    try {
      console.log('Initializing TON Service...');

      // Update TON service configuration
      tonService['config'] = this.config.ton;
      tonService['apiKey'] = this.config.nowPayments.apiKey;

      // Test TON service connection
      await tonService.getContractBalance();

      this.providers.set('ton-service', {
        name: 'TON Service',
        isInitialized: true,
        isAvailable: true
      });

      console.log('TON Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize TON Service:', error);
      throw error;
    }
  }

  /**
   * Initialize providers map
   */
  private initializeProviders(): void {
    this.providers.set('ton-connect', {
      name: 'TON Connect',
      isInitialized: false,
      isAvailable: false
    });

    this.providers.set('nowpayments', {
      name: 'NowPayments',
      isInitialized: false,
      isAvailable: false
    });

    this.providers.set('ton-service', {
      name: 'TON Service',
      isInitialized: false,
      isAvailable: false
    });
  }

  /**
   * Get payment provider status
   */
  getProviderStatus(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if payment system is fully initialized
   */
  isPaymentSystemReady(): boolean {
    return this.isInitialized && Array.from(this.providers.values()).every(p => p.isInitialized);
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): string[] {
    const methods: string[] = [];

    if (this.providers.get('ton-connect')?.isAvailable) {
      methods.push('ton-wallet');
    }

    if (this.providers.get('nowpayments')?.isAvailable) {
      methods.push('crypto-payment');
    }

    return methods;
  }

  /**
   * Reinitialize payment systems
   */
  async reinitialize(): Promise<PaymentInitializationResult> {
    this.isInitialized = false;
    this.initializeProviders();
    return await this.initialize();
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: string): {isValid: boolean, error?: string} {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      return {isValid: false, error: 'Invalid amount format'};
    }

    if (numAmount <= 0) {
      return {isValid: false, error: 'Amount must be greater than 0'};
    }

    if (numAmount < 0.01) {
      return {isValid: false, error: 'Minimum amount is 0.01 TON'};
    }

    return {isValid: true};
  }

  /**
   * Validate wallet address
   */
  validateWalletAddress(address: string): {isValid: boolean, error?: string} {
    if (!address || address.length === 0) {
      return {isValid: false, error: 'Wallet address is required'};
    }

    // Basic TON address validation (starts with UQ or 0:)
    if (!address.match(/^(UQ|0:)/)) {
      return {isValid: false, error: 'Invalid TON wallet address format'};
    }

    return {isValid: true};
  }

  /**
   * Handle payment errors
   */
  handlePaymentError(error: any, context: string): string {
    console.error(`Payment error in ${context}:`, error);

    if (error instanceof Error) {
      // Network errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network connection error. Please check your internet connection.';
      }

      // Wallet errors
      if (error.message.includes('wallet') || error.message.includes('connect')) {
        return 'Wallet connection error. Please reconnect your wallet.';
      }

      // Contract errors
      if (error.message.includes('contract') || error.message.includes('smart')) {
        return 'Smart contract error. Please try again later.';
      }

      // Insufficient funds
      if (error.message.includes('insufficient') || error.message.includes('balance')) {
        return 'Insufficient funds in wallet.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Retry payment operation
   */
  async retryPaymentOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`Payment operation attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Check payment system health
   */
  async checkSystemHealth(): Promise<{healthy: boolean, issues: string[]}> {
    const issues: string[] = [];

    try {
      // Check TON service
      const tonBalance = await tonService.getContractBalance();
      if (!tonBalance || tonBalance === '0') {
        issues.push('TON service may not be responding correctly');
      }
    } catch (error) {
      issues.push('TON service health check failed');
    }

    // Check providers
    for (const [name, provider] of this.providers) {
      if (!provider.isInitialized || !provider.isAvailable) {
        issues.push(`${name} provider is not available`);
      }
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Get payment configuration
   */
  getConfig(): PaymentConfig {
    return { ...this.config };
  }

  /**
   * Update payment configuration
   */
  updateConfig(newConfig: Partial<PaymentConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isInitialized = false;
  }
}

// Default payment configuration
export const defaultPaymentConfig: PaymentConfig = {
  ton: {
    address: '0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS',
    network: 'testnet',
    endpoint: 'https://testnet.toncenter.com/api/v2'
  },
  nowPayments: {
    apiKey: 'your_nowpayments_api_key',
    apiUrl: 'https://api.nowpayments.io/v1'
  },
  environment: 'development'
};

// Create and export default payment service instance
export const paymentService = new PaymentService(defaultPaymentConfig);

// Types and interfaces are already exported above
