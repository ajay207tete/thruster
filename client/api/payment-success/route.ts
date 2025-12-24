import { tonService } from '../../services/tonService-updated';
import { paymentService } from '../../services/paymentService';

export interface PaymentSuccessRequest {
  orderId: number;
  transactionHash?: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  payment?: {
    orderId: number;
    status: string;
    transactionHash?: string;
    verifiedAt: string;
  };
  error?: string;
}

/**
 * Payment success API handler
 * This is a client-side utility for handling payment success callbacks
 */
export class PaymentSuccessAPI {
  /**
   * Handle payment success notification
   */
  static async handlePaymentSuccess(request: PaymentSuccessRequest): Promise<PaymentSuccessResponse> {
    try {
      const { orderId, transactionHash } = request;

      // Validate order ID
      if (!orderId || orderId <= 0) {
        return {
          success: false,
          error: 'Invalid order ID'
        };
      }

      // Check payment status on TON blockchain
      const paymentStatus = await tonService.checkPaymentStatus(orderId.toString());

      if (!paymentStatus.isPaid) {
        return {
          success: false,
          error: 'Payment not confirmed on blockchain'
        };
      }

      // Update payment status (this would typically call a server endpoint)
      console.log('Payment confirmed for order:', orderId, {
        transactionHash: paymentStatus.transactionHash || transactionHash,
        verifiedAt: new Date().toISOString()
      });

      // Return success response
      return {
        success: true,
        payment: {
          orderId,
          status: 'paid',
          transactionHash: paymentStatus.transactionHash || transactionHash,
          verifiedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Payment success handling error:', error);
      return {
        success: false,
        error: 'Failed to process payment success'
      };
    }
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(orderId: number): Promise<{ isPaid: boolean; transactionHash?: string; error?: string }> {
    try {
      const paymentStatus = await tonService.checkPaymentStatus(orderId.toString());
      return {
        isPaid: paymentStatus.isPaid,
        transactionHash: paymentStatus.transactionHash
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        isPaid: false,
        error: 'Failed to verify payment'
      };
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(orderId: number): Promise<PaymentSuccessResponse> {
    try {
      const paymentStatus = await tonService.checkPaymentStatus(orderId.toString());

      return {
        success: true,
        payment: {
          orderId,
          status: paymentStatus.isPaid ? 'paid' : 'pending',
          transactionHash: paymentStatus.transactionHash,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get payment details error:', error);
      return {
        success: false,
        error: 'Failed to get payment details'
      };
    }
  }
}

// Export default instance
export const paymentSuccessAPI = new PaymentSuccessAPI();
