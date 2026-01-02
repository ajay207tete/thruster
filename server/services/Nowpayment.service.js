import axios from 'axios';

class NowPaymentsService {
  constructor() {
    this.apiKey = process.env.NOWPAYMENTS_API_KEY;
    this.apiUrl = process.env.NOWPAYMENTS_API_URL || 'https://api.nowpayments.io/v1';
    this.ipnCallbackUrl = process.env.NOWPAYMENTS_IPN_URL || `${process.env.BASE_URL}/api/payment/callback`;
  }

  /**
   * Create payment invoice
   */
  async createInvoice(orderData) {
    try {
      const { amount, currency = 'USD', orderId, customerEmail } = orderData;

      const payload = {
        price_amount: amount,
        price_currency: currency,
        pay_currency: 'TON', // Default to TON
        order_id: orderId,
        order_description: `Order #${orderId}`,
        ipn_callback_url: this.ipnCallbackUrl,
        success_url: `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${orderId}`,
        customer_email: customerEmail
      };

      const response = await axios.post(`${this.apiUrl}/invoice`, payload, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        invoice: {
          id: response.data.id,
          invoiceUrl: response.data.invoice_url,
          payAddress: response.data.pay_address,
          payAmount: response.data.pay_amount,
          payCurrency: response.data.pay_currency,
          priceAmount: response.data.price_amount,
          priceCurrency: response.data.price_currency,
          orderId: response.data.order_id,
          status: response.data.invoice_status
        }
      };
    } catch (error) {
      console.error('NowPayments invoice creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(`${this.apiUrl}/payment/${paymentId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        payment: {
          id: response.data.id,
          status: response.data.payment_status,
          payAddress: response.data.pay_address,
          payAmount: response.data.pay_amount,
          payCurrency: response.data.pay_currency,
          priceAmount: response.data.price_amount,
          priceCurrency: response.data.price_currency,
          actuallyPaid: response.data.actually_paid,
          fee: response.data.fee,
          orderId: response.data.order_id,
          outcomeAmount: response.data.outcome_amount,
          outcomeCurrency: response.data.outcome_currency
        }
      };
    } catch (error) {
      console.error('NowPayments status check error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get invoice status
   */
  async getInvoiceStatus(invoiceId) {
    try {
      const response = await axios.get(`${this.apiUrl}/invoice/${invoiceId}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        invoice: {
          id: response.data.id,
          status: response.data.invoice_status,
          payAddress: response.data.pay_address,
          payAmount: response.data.pay_amount,
          payCurrency: response.data.pay_currency,
          priceAmount: response.data.price_amount,
          priceCurrency: response.data.price_currency,
          createdAt: response.data.created_at,
          updatedAt: response.data.updated_at,
          orderId: response.data.order_id
        }
      };
    } catch (error) {
      console.error('NowPayments invoice status error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get available payment currencies
   */
  async getCurrencies() {
    try {
      const response = await axios.get(`${this.apiUrl}/currencies`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        currencies: response.data.currencies
      };
    } catch (error) {
      console.error('NowPayments currencies error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get minimum payment amount
   */
  async getMinAmount(currencyFrom, currencyTo = 'usd') {
    try {
      const response = await axios.get(`${this.apiUrl}/min-amount`, {
        params: {
          currency_from: currencyFrom,
          currency_to: currencyTo
        },
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        minAmount: response.data.min_amount,
        currencyFrom: response.data.currency_from,
        currencyTo: response.data.currency_to
      };
    } catch (error) {
      console.error('NowPayments min amount error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get estimated price
   */
  async getEstimatedPrice(amount, currencyFrom, currencyTo) {
    try {
      const response = await axios.get(`${this.apiUrl}/estimate`, {
        params: {
          amount,
          currency_from: currencyFrom,
          currency_to: currencyTo
        },
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        estimatedAmount: response.data.estimated_amount,
        currencyFrom: response.data.currency_from,
        currencyTo: response.data.currency_to
      };
    } catch (error) {
      console.error('NowPayments estimate error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Process IPN callback
   */
  async processIPNCallback(ipnData) {
    try {
      // Verify IPN signature (in production, implement proper verification)
      const { payment_id, payment_status, pay_address, price_amount, pay_amount, order_id } = ipnData;

      // Update order status based on payment status
      const orderService = require('./order.service');

      let newStatus;
      switch (payment_status) {
        case 'finished':
        case 'confirmed':
          newStatus = 'PAID';
          break;
        case 'failed':
        case 'expired':
          newStatus = 'FAILED';
          break;
        case 'partially_paid':
          newStatus = 'PENDING'; // Wait for full payment
          break;
        default:
          newStatus = 'PENDING';
      }

      const updateResult = await orderService.updatePaymentStatus(order_id, newStatus, {
        paymentId: payment_id,
        txHash: pay_address // Using pay_address as tx reference
      });

      return {
        success: true,
        processed: true,
        orderUpdate: updateResult
      };
    } catch (error) {
      console.error('IPN processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, refundAmount = null) {
    try {
      const payload = {
        payment_id: paymentId
      };

      if (refundAmount) {
        payload.refund_amount = refundAmount;
      }

      const response = await axios.post(`${this.apiUrl}/refund`, payload, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        refund: {
          id: response.data.refund_id,
          status: response.data.refund_status,
          amount: response.data.refund_amount,
          currency: response.data.refund_currency
        }
      };
    } catch (error) {
      console.error('NowPayments refund error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(limit = 100, offset = 0) {
    try {
      const response = await axios.get(`${this.apiUrl}/payments`, {
        params: {
          limit,
          offset
        },
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        payments: response.data.data,
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      };
    } catch (error) {
      console.error('NowPayments history error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Validate webhook signature (for production)
   */
  validateWebhookSignature(payload, signature) {
    // In production, implement proper signature validation
    // This is a placeholder
    return true;
  }

  /**
   * Get merchant balance
   */
  async getMerchantBalance() {
    try {
      const response = await axios.get(`${this.apiUrl}/balance`, {
        headers: {
          'x-api-key': this.apiKey
        }
      });

      return {
        success: true,
        balance: response.data
      };
    } catch (error) {
      console.error('NowPayments balance error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new NowPaymentsService();
