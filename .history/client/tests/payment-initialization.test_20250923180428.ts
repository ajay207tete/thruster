/**
 * Payment Initialization Tests
 * Tests the PaymentService.initialize() method and related functionality
 */

import { PaymentService, PaymentConfig, defaultPaymentConfig } from '../services/paymentService';
import { tonService } from '../services/tonService-updated';

// Mock the tonService to avoid real network calls
jest.mock('../services/tonService-updated', () => ({
  tonService: {
    config: {
      address: '0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS',
      network: 'testnet',
      endpoint: 'https://testnet.toncenter.com/api/v2'
    },
    apiKey: 'test_api_key',
    getContractBalance: jest.fn(),
    createOrder: jest.fn(),
    checkPaymentStatus: jest.fn(),
    withdrawFunds: jest.fn(),
    getAllOrders: jest.fn()
  }
}));

describe('PaymentService - Initialization Tests', () => {
  let paymentService: PaymentService;
  const mockConfig: PaymentConfig = {
    ...defaultPaymentConfig,
    nowPayments: {
      apiKey: 'test_nowpayments_key',
      apiUrl: 'https://api.nowpayments.io/v1'
    }
  };

  beforeEach(() => {
    paymentService = new PaymentService(mockConfig);
    jest.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should create PaymentService instance with config', () => {
      expect(paymentService).toBeDefined();
      expect(paymentService.getConfig()).toEqual(mockConfig);
    });

    it('should initialize providers map', () => {
      const providers = paymentService.getProviderStatus();
      expect(providers).toHaveLength(3);
      expect(providers.map(p => p.name)).toEqual(['TON Connect', 'NowPayments', 'TON Service']);
    });
  });

  describe('Payment Initialization', () => {
    it('should initialize all providers successfully', async () => {
      // Mock successful initialization
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00');

      const result = await paymentService.initialize();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.providers).toHaveLength(3);
      expect(result.providers.every(p => p.isInitialized)).toBe(true);
      expect(paymentService.isPaymentSystemReady()).toBe(true);
    });

    it('should handle TON service initialization failure', async () => {
      // Mock TON service failure
      (tonService.getContractBalance as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await paymentService.initialize();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Network error');
      expect(paymentService.isPaymentSystemReady()).toBe(false);
    });

    it('should handle NowPayments initialization failure', async () => {
      // Mock NowPayments failure by overriding the method
      const originalInitializeNowPayments = paymentService['initializeNowPayments'];
      paymentService['initializeNowPayments'] = jest.fn().mockRejectedValue(new Error('API key invalid'));

      const result = await paymentService.initialize();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('API key invalid');

      // Restore original method
      paymentService['initializeNowPayments'] = originalInitializeNowPayments;
    });

    it('should handle TON Connect initialization failure', async () => {
      // Mock TON Connect failure by overriding the method
      const originalInitializeTonConnect = paymentService['initializeTonConnect'];
      paymentService['initializeTonConnect'] = jest.fn().mockRejectedValue(new Error('Manifest not found'));

      const result = await paymentService.initialize();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Manifest not found');

      // Restore original method
      paymentService['initializeTonConnect'] = originalInitializeTonConnect;
    });
  });

  describe('Provider Status', () => {
    it('should return correct provider status after initialization', async () => {
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00');

      await paymentService.initialize();

      const providers = paymentService.getProviderStatus();
      expect(providers.every(p => p.isInitialized)).toBe(true);
      expect(providers.every(p => p.isAvailable)).toBe(true);
    });

    it('should return correct provider status before initialization', () => {
      const providers = paymentService.getProviderStatus();
      expect(providers.every(p => !p.isInitialized)).toBe(true);
      expect(providers.every(p => !p.isAvailable)).toBe(true);
    });
  });

  describe('Payment Methods', () => {
    it('should return available payment methods after successful initialization', async () => {
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00');

      await paymentService.initialize();

      const methods = paymentService.getAvailablePaymentMethods();
      expect(methods).toContain('ton-wallet');
      expect(methods).toContain('crypto-payment');
    });

    it('should return empty payment methods when not initialized', () => {
      const methods = paymentService.getAvailablePaymentMethods();
      expect(methods).toHaveLength(0);
    });
  });

  describe('Reinitialization', () => {
    it('should reinitialize successfully', async () => {
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00');

      await paymentService.initialize();
      expect(paymentService.isPaymentSystemReady()).toBe(true);

      // Simulate a failure and reinitialize
      (tonService.getContractBalance as jest.Mock).mockRejectedValueOnce(new Error('Temporary error'));
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00'); // Mock success for reinitialization
      await paymentService.reinitialize();

      expect(paymentService.isPaymentSystemReady()).toBe(true);
    });
  });

  describe('Validation Methods', () => {
    it('should validate payment amount correctly', () => {
      expect(paymentService.validatePaymentAmount('10.50').isValid).toBe(true);
      expect(paymentService.validatePaymentAmount('0.01').isValid).toBe(true);
      expect(paymentService.validatePaymentAmount('0.00').isValid).toBe(false);
      expect(paymentService.validatePaymentAmount('-5').isValid).toBe(false);
      expect(paymentService.validatePaymentAmount('invalid').isValid).toBe(false);
    });

    it('should validate wallet address correctly', () => {
      expect(paymentService.validateWalletAddress('UQ1234567890abcdef').isValid).toBe(true);
      expect(paymentService.validateWalletAddress('0:1234567890abcdef').isValid).toBe(true);
      expect(paymentService.validateWalletAddress('invalid-address').isValid).toBe(false);
      expect(paymentService.validateWalletAddress('').isValid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle payment errors correctly', () => {
      const networkError = new Error('Network timeout');
      const walletError = new Error('Wallet not connected');
      const contractError = new Error('Smart contract failed');
      const balanceError = new Error('Insufficient balance');

      expect(paymentService.handlePaymentError(networkError, 'test')).toContain('Network timeout');
      expect(paymentService.handlePaymentError(walletError, 'test')).toContain('Wallet connection error');
      expect(paymentService.handlePaymentError(contractError, 'test')).toContain('Smart contract error');
      expect(paymentService.handlePaymentError(balanceError, 'test')).toContain('Insufficient funds in wallet');
    });

    it('should handle unknown errors gracefully', () => {
      const unknownError = 'Some unknown error';
      const result = paymentService.handlePaymentError(unknownError, 'test');
      expect(result).toContain('unexpected error');
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry operations successfully', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success');

      const result = await paymentService.retryPaymentOperation(mockOperation, 2, 100);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValue(new Error('Persistent error'));

      await expect(paymentService.retryPaymentOperation(mockOperation, 2, 100))
        .rejects.toThrow('Persistent error');

      expect(mockOperation).toHaveBeenCalledTimes(2); // maxRetries attempts
    });
  });

  describe('System Health Check', () => {
    it('should pass health check when all systems are working', async () => {
      (tonService.getContractBalance as jest.Mock).mockResolvedValue('100.00');

      await paymentService.initialize();

      const health = await paymentService.checkSystemHealth();
      expect(health.healthy).toBe(true);
      expect(health.issues).toHaveLength(0);
    });

    it('should detect issues in health check', async () => {
      (tonService.getContractBalance as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const health = await paymentService.checkSystemHealth();
      expect(health.healthy).toBe(false);
      expect(health.issues).toHaveLength(4); // TON service + 3 providers
      expect(health.issues[0]).toContain('TON service health check failed');
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        environment: 'production' as const,
        ton: {
          ...mockConfig.ton,
          network: 'mainnet' as const
        }
      };

      paymentService.updateConfig(newConfig);
      expect(paymentService.getConfig().environment).toBe('production');
      expect(paymentService.getConfig().ton.network).toBe('mainnet');
      expect(paymentService.isPaymentSystemReady()).toBe(false); // Should require reinitialization
    });
  });
});
