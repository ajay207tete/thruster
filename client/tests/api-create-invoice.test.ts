/**
 * Create Invoice API Tests
 * Tests the CreateInvoiceAPI functionality
 */

import { CreateInvoiceAPI, CreateInvoiceRequest } from '../api/create-invoice/route';
import { tonService } from '../services/tonService-updated';
import { paymentService } from '../services/paymentService';

// Mock the services
jest.mock('../services/tonService-updated', () => ({
  tonService: {
    createOrder: jest.fn(),
    checkPaymentStatus: jest.fn(),
    getContractBalance: jest.fn()
  }
}));

jest.mock('../services/paymentService', () => ({
  paymentService: {
    validatePaymentAmount: jest.fn()
  }
}));

describe('CreateInvoiceAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    const validRequest: CreateInvoiceRequest = {
      productDetails: 'Test Product',
      productImage: 'https://example.com/image.jpg',
      amount: '10.50'
    };

    it('should create invoice successfully', async () => {
      // Mock successful validation and order creation
      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({ isValid: true });
      (tonService.createOrder as jest.Mock).mockResolvedValue({
        success: true,
        orderId: 12345
      });

      const result = await CreateInvoiceAPI.createInvoice(validRequest);

      expect(result.success).toBe(true);
      expect(result.invoice).toBeDefined();
      expect(result.invoice?.orderId).toBe(12345);
      expect(result.invoice?.productDetails).toBe(validRequest.productDetails);
      expect(result.invoice?.amount).toBe(validRequest.amount);
      expect(result.invoice?.status).toBe('pending');
      expect(result.invoice?.createdAt).toBeDefined();
      expect(tonService.createOrder).toHaveBeenCalledWith({
        productDetails: validRequest.productDetails,
        productImage: validRequest.productImage
      });
    });

    it('should fail when required fields are missing', async () => {
      const invalidRequests = [
        { productImage: 'image.jpg', amount: '10.50' }, // missing productDetails
        { productDetails: 'Product', amount: '10.50' }, // missing productImage
        { productDetails: 'Product', productImage: 'image.jpg' } // missing amount
      ];

      for (const request of invalidRequests) {
        const result = await CreateInvoiceAPI.createInvoice(request as CreateInvoiceRequest);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Missing required fields');
      }
    });

    it('should fail when amount validation fails', async () => {
      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Invalid amount format'
      });

      const result = await CreateInvoiceAPI.createInvoice(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid amount format');
      expect(tonService.createOrder).not.toHaveBeenCalled();
    });

    it('should fail when order creation fails', async () => {
      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({ isValid: true });
      (tonService.createOrder as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Blockchain error'
      });

      const result = await CreateInvoiceAPI.createInvoice(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Blockchain error');
    });

    it('should handle service errors gracefully', async () => {
      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({ isValid: true });
      (tonService.createOrder as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await CreateInvoiceAPI.createInvoice(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
    });
  });

  describe('validateRequest', () => {
    it('should validate valid request', () => {
      const validRequest: CreateInvoiceRequest = {
        productDetails: 'Test Product',
        productImage: 'https://example.com/image.jpg',
        amount: '10.50'
      };

      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({ isValid: true });

      const result = CreateInvoiceAPI.validateRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty product details', () => {
      const invalidRequest: CreateInvoiceRequest = {
        productDetails: '',
        productImage: 'image.jpg',
        amount: '10.50'
      };

      const result = CreateInvoiceAPI.validateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Product details are required');
    });

    it('should reject empty product image', () => {
      const invalidRequest: CreateInvoiceRequest = {
        productDetails: 'Product',
        productImage: '',
        amount: '10.50'
      };

      const result = CreateInvoiceAPI.validateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Product image is required');
    });

    it('should reject empty amount', () => {
      const invalidRequest: CreateInvoiceRequest = {
        productDetails: 'Product',
        productImage: 'image.jpg',
        amount: ''
      };

      const result = CreateInvoiceAPI.validateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Amount is required');
    });

    it('should reject invalid amount', () => {
      const invalidRequest: CreateInvoiceRequest = {
        productDetails: 'Product',
        productImage: 'image.jpg',
        amount: 'invalid'
      };

      (paymentService.validatePaymentAmount as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Invalid amount'
      });

      const result = CreateInvoiceAPI.validateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid amount');
    });
  });
});
