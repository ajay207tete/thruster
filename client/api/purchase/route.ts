import { tonService } from '../../services/tonService-updated';
import { paymentService } from '../../services/paymentService';

export interface PurchaseRequest {
  orderId: number;
  amount: string;
  paymentMethod: 'NOWPAYMENTS' | 'TON_NATIVE';
}

export interface PurchaseResponse {
  success: boolean;
  purchase?: {
    orderId: number;
    amount: string;
    paymentMethod: string;
    transactionHash?: string;
    status: string;
    processedAt: string;
  };
  error?: string;
}

/**
 * Purchase API handler
 * This is a client-side utility for processing purchases through TON blockchain
 */
export class PurchaseAPI {
  /**
   * Process a purchase
   */
  static async processPurchase(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const { orderId, amount, paymentMethod } = request;

      // Validate required fields
      if (!orderId || orderId <= 0) {
        return {
          success: false,
          error: 'Invalid order ID'
        };
      }

      if (!amount || !paymentMethod) {
        return {
          success: false,
          error: 'Missing required fields: amount, paymentMethod'
        };
      }

      // Validate amount
      const amountValidation = paymentService.validatePaymentAmount(amount);
      if (!amountValidation.isValid) {
        return {
          success: false,
          error: amountValidation.error
        };
      }

      // Validate payment method
      if (!['NOWPAYMENTS', 'TON_NATIVE'].includes(paymentMethod)) {
        return {
          success: false,
          error: 'Invalid payment method'
        };
      }

      let transactionHash: string | undefined;

      if (paymentMethod === 'TON_NATIVE') {
        // Process TON native payment
        const paymentResult = await tonService.sendPayment(amount, orderId);
        if (!paymentResult.success) {
          return {
            success: false,
            error: paymentResult.error || 'Payment failed'
          };
        }
        transactionHash = paymentResult.transactionHash;
      } else {
        // For NowPayments, this would typically redirect to their payment page
        // For now, we'll simulate the process
        console.log('Processing NowPayments purchase for order:', orderId);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Return purchase details
      return {
        success: true,
        purchase: {
          orderId,
          amount,
          paymentMethod,
          transactionHash,
          status: 'completed',
          processedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Purchase processing error:', error);
      return {
        success: false,
        error: 'Failed to process purchase'
      };
    }
  }

  /**
   * Validate purchase request
   */
  static validateRequest(request: PurchaseRequest): { isValid: boolean; error?: string } {
    if (!request.orderId || request.orderId <= 0) {
      return { isValid: false, error: 'Invalid order ID' };
    }

    if (!request.amount?.trim()) {
      return { isValid: false, error: 'Amount is required' };
    }

    if (!request.paymentMethod) {
      return { isValid: false, error: 'Payment method is required' };
    }

    if (!['NOWPAYMENTS', 'TON_NATIVE'].includes(request.paymentMethod)) {
      return { isValid: false, error: 'Invalid payment method' };
    }

    const amountValidation = paymentService.validatePaymentAmount(request.amount);
    if (!amountValidation.isValid) {
      return { isValid: false, error: amountValidation.error };
    }

    return { isValid: true };
  }

  /**
   * Get purchase status
   */
  static async getPurchaseStatus(orderId: number): Promise<PurchaseResponse> {
    try {
      const paymentStatus = await tonService.checkPaymentStatus(orderId);

      return {
        success: true,
        purchase: {
          orderId,
          amount: '0', // Would need to fetch from order data
          paymentMethod: 'TON_NATIVE',
          transactionHash: paymentStatus.transactionHash,
          status: paymentStatus.isPaid ? 'completed' : 'pending',
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get purchase status error:', error);
      return {
        success: false,
        error: 'Failed to get purchase status'
      };
    }
  }
}

// Export default instance
export const purchaseAPI = new PurchaseAPI();
