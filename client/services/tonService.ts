/**
 * TON Service for ShoppingContract Integration
 * Handles all TON blockchain interactions for the shopping application
 */

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

export class TonService {
  private config: TonContractConfig;
  private apiKey: string;

  constructor(config: TonContractConfig, apiKey?: string) {
    this.config = config;
    this.apiKey = apiKey || 'your_api_key_here';
  }

  /**
   * Create a new order on the blockchain
   */
  async createOrder(orderData: OrderData): Promise<{success: boolean, orderId?: number, error?: string}> {
    try {
      const response = await fetch(`${this.config.endpoint}/jsonRPC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'runGetMethod',
          params: {
            address: this.config.address,
            method: 'createOrder',
            stack: [
              {
                type: 'cell',
                value: this.encodeProductDetails(orderData.productDetails)
              },
              {
                type: 'cell',
                value: this.encodeProductImage(orderData.productImage)
              }
            ]
          }
        })
      });

      const result = await response.json();

      if (result.ok) {
        return {
          success: true,
          orderId: result.result.stack[0].value
        };
      } else {
        return {
          success: false,
          error: result.error.message
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check payment status for an order
   */
  async checkPaymentStatus(orderId: number): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.config.endpoint}/jsonRPC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'runGetMethod',
          params: {
            address: this.config.address,
            method: 'getPaymentStatus',
            stack: [
              {
                type: 'num',
                value: orderId.toString()
              }
            ]
          }
        })
      });

      const result = await response.json();

      return {
        orderId,
        isPaid: result.result.stack[0].value === '1',
        transactionHash: result.result.stack[1]?.value
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        orderId,
        isPaid: false
      };
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance(): Promise<string> {
    try {
      const response = await fetch(`${this.config.endpoint}/getAddressBalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          address: this.config.address
        })
      });

      const result = await response.json();
      return result.result.balance;
    } catch (error) {
      console.error('Error getting contract balance:', error);
      return '0';
    }
  }

  /**
   * Withdraw funds (owner only)
   */
  async withdrawFunds(): Promise<{success: boolean, transactionHash?: string, error?: string}> {
    try {
      const response = await fetch(`${this.config.endpoint}/jsonRPC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendBoc',
          params: {
            boc: this.createWithdrawalMessage()
          }
        })
      });

      const result = await response.json();

      if (result.ok) {
        return {
          success: true,
          transactionHash: result.result.hash
        };
      } else {
        return {
          success: false,
          error: result.error.message
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<OrderData[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/jsonRPC`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'runGetMethod',
          params: {
            address: this.config.address,
            method: 'getAllOrders',
            stack: []
          }
        })
      });

      const result = await response.json();
      return result.result.stack.map((order: any) => ({
        orderId: order.orderId,
        productDetails: this.decodeProductDetails(order.productDetails),
        productImage: this.decodeProductImage(order.productImage)
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Helper methods for encoding/decoding data
  private encodeProductDetails(details: string): string {
    // Encode product details to cell format
    return Buffer.from(details).toString('base64');
  }

  private encodeProductImage(imageUrl: string): string {
    // Encode image URL to cell format
    return Buffer.from(imageUrl).toString('base64');
  }

  private decodeProductDetails(encoded: string): string {
    // Decode product details from cell format
    return Buffer.from(encoded, 'base64').toString();
  }

  private decodeProductImage(encoded: string): string {
    // Decode image URL from cell format
    return Buffer.from(encoded, 'base64').toString();
  }

  private createWithdrawalMessage(): string {
    // Create withdrawal message BOC
    // This would need proper TON message encoding
    return 'mock_withdrawal_boc';
  }
}

// Default configuration for testnet
export const defaultTonConfig: TonContractConfig = {
  address: '0:0QBjg8HT7GdRlO-4-7nC9ucEZ2XrcZS9xZ34TMU2DfodirJS',
  network: 'testnet',
  endpoint: 'https://testnet.toncenter.com/api/v2'
};

// Create default TON service instance
export const tonService = new TonService(defaultTonConfig);
