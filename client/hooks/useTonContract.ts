/**
 * React Hook for TON Contract Integration
 * Provides easy-to-use hooks for interacting with the ShoppingContract
 */

import { useState, useCallback, useEffect } from 'react';
import { tonService, TonService, TonContractConfig, OrderData, PaymentStatus } from '../services/tonService';

interface UseTonContractReturn {
  // Contract state
  contractAddress: string;
  contractBalance: string;
  isLoading: boolean;

  // Order management
  createOrder: (orderData: OrderData) => Promise<{success: boolean, orderId?: number, error?: string}>;
  checkPaymentStatus: (orderId: number) => Promise<PaymentStatus>;
  getAllOrders: () => Promise<OrderData[]>;

  // Owner functions
  withdrawFunds: () => Promise<{success: boolean, transactionHash?: string, error?: string}>;

  // Utility functions
  refreshBalance: () => Promise<void>;
  setApiKey: (apiKey: string) => void;
  updateConfig: (config: Partial<TonContractConfig>) => void;
}

export const useTonContract = (customConfig?: Partial<TonContractConfig>): UseTonContractReturn => {
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Merge custom config with default
  const config: TonContractConfig = {
    address: customConfig?.address || tonService['config'].address,
    network: customConfig?.network || tonService['config'].network,
    endpoint: customConfig?.endpoint || tonService['config'].endpoint,
  };

  // Create order function
  const createOrder = useCallback(async (orderData: OrderData) => {
    setIsLoading(true);
    try {
      const result = await tonService.createOrder(orderData);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check payment status function
  const checkPaymentStatus = useCallback(async (orderId: number): Promise<PaymentStatus> => {
    setIsLoading(true);
    try {
      const result = await tonService.checkPaymentStatus(orderId);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get all orders function
  const getAllOrders = useCallback(async (): Promise<OrderData[]> => {
    setIsLoading(true);
    try {
      const orders = await tonService.getAllOrders();
      return orders;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Withdraw funds function
  const withdrawFunds = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await tonService.withdrawFunds();
      if (result.success) {
        // Refresh balance after successful withdrawal
        await refreshBalance();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh contract balance
  const refreshBalance = useCallback(async () => {
    setIsLoading(true);
    try {
      const balance = await tonService.getContractBalance();
      setContractBalance(balance);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set API key
  const setApiKey = useCallback((apiKey: string) => {
    tonService['apiKey'] = apiKey;
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<TonContractConfig>) => {
    Object.assign(tonService['config'], newConfig);
  }, []);

  // Load initial balance on mount
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return {
    contractAddress: config.address,
    contractBalance,
    isLoading,
    createOrder,
    checkPaymentStatus,
    getAllOrders,
    withdrawFunds,
    refreshBalance,
    setApiKey,
    updateConfig,
  };
};

// Additional utility hooks for specific use cases

export const useTonOrder = (orderId: number | null) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!orderId) return;

    setIsChecking(true);
    try {
      const status = await tonService.checkPaymentStatus(orderId);
      setPaymentStatus(status);
    } finally {
      setIsChecking(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      checkStatus();
      // Poll for status updates every 10 seconds
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId, checkStatus]);

  return {
    paymentStatus,
    isChecking,
    checkStatus,
  };
};

export const useTonBalance = () => {
  const [balance, setBalance] = useState<string>('0');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshBalance = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newBalance = await tonService.getContractBalance();
      setBalance(newBalance);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    isRefreshing,
    refreshBalance,
  };
};
