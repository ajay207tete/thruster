import { tonService } from '../../services/tonService-updated';
import { paymentService } from '../../services/paymentService';

export interface CreateInvoiceRequest {
  productDetails: string;
  productImage: string;
  amount: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoice?: {
    orderId: number;
    productDetails: string;
    productImage: string;
    amount: string;
    createdAt: string;
  };
  error?: string;
}

/**
 * Create Invoice API handler
 * This is a client-side utility for creating invoices through TON blockchain
 */
export class CreateInvoiceAPI {
  /**
   * Create a new invoice
   */
  static async createInvoice(request: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
    try {
      const { productDetails, productImage, amount } = request;

      // Validate required fields
      if (!productDetails?.trim()) {
        return {
          success: false,
          error: 'Product details are required'
        };
      }

      if (!productImage?.trim()) {
        return {
          success: false,
          error: 'Product image is required'
        };
      }

      if (!amount?.trim()) {
        return {
          success: false,
          error: 'Amount is required'
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

      // Create order on blockchain
      const orderResult = await tonService.createOrder({
        productDetails,
        productImage
      });

      if (!orderResult.success) {
        return {
          success: false,
          error: orderResult.error || 'Failed to create order'
        };
      }

      // Return invoice details
      return {
        success: true,
        invoice: {
          orderId: orderResult.orderId!,
          productDetails,
          productImage,
          amount,
          createdAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Create invoice error:', error);
      return {
        success: false,
        error: 'Failed to create invoice'
      };
    }
  }

  /**
   * Validate create invoice request
   */
  static validateRequest(request: CreateInvoiceRequest): { isValid: boolean; error?: string } {
    if (!request.productDetails?.trim()) {
      return { isValid: false, error: 'Product details are required' };
    }

    if (!request.productImage?.trim()) {
      return { isValid: false, error: 'Product image is required' };
    }

    if (!request.amount?.trim()) {
      return { isValid: false, error: 'Amount is required' };
    }

    const amountValidation = paymentService.validatePaymentAmount(request.amount);
    if (!amountValidation.isValid) {
      return { isValid: false, error: amountValidation.error };
    }

    return { isValid: true };
  }

  /**
   * Get invoice details
   */
  static async getInvoice(orderId: number): Promise<CreateInvoiceResponse> {
    try {
      // In a real implementation, this would fetch invoice details from database
      // For now, we'll simulate based on order ID

      const paymentStatus = await tonService.checkPaymentStatus(orderId);

      return {
        success: true,
        invoice: {
          orderId,
          productDetails: 'Sample Product', // Would fetch from order data
          productImage: 'sample-image.jpg', // Would fetch from order data
          amount: '1.0', // Would fetch from order data
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Get invoice error:', error);
      return {
        success: false,
        error: 'Failed to get invoice details'
      };
    }
  }
}

// Export default instance
export const createInvoiceAPI = new CreateInvoiceAPI();
