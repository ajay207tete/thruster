import axios from 'axios';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'BWABH89-TE4M325-NRAFR67-TMSYJ5F';
const NOWPAYMENTS_BASE_URL = 'https://api.nowpayments.io/v1';

export interface PaymentData {
  price_amount: string;
  price_currency: string;
  pay_currency: string;
  ipn_callback_url?: string;
  order_id?: string;
  order_description?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface PaymentResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  pay_address: string;
  payin_extra_id: string;
  ipn_callback_url: string;
  created_at: string;
  updated_at: string;
  purchase_id: string;
  smart_contract: string;
  network: string;
  network_precision: number;
  time_limit: number;
  burning_percent: number;
  expiration_estimate_date: string;
  is_fixed_rate: boolean;
  is_fee_paid_by_user: boolean;
  valid_until: string;
  type: string;
  invoice_url?: string;
  hosted_checkout_url?: string;
}

export interface PaymentStatus {
  payment_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  pay_address: string;
  payin_extra_id: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  outcome_amount: number;
  outcome_currency: string;
}

class NowPaymentsService {
  private api = axios.create({
    baseURL: NOWPAYMENTS_BASE_URL,
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  /**
   * Create a new payment
   */
  async createPayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      const response = await this.api.post('/payment', data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await this.api.get(`/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Get list of available payment currencies
   */
  async getCurrencies(): Promise<string[]> {
    try {
      const response = await this.api.get('/currencies');
      return response.data.currencies;
    } catch (error) {
      console.error('Error getting currencies:', error);
      throw new Error('Failed to get currencies');
    }
  }

  /**
   * Get minimum payment amount for a currency
   */
  async getMinAmount(currency: string): Promise<{ currency: string; min_amount: number }> {
    try {
      const response = await this.api.get(`/min-amount?currency_from=${currency}`);
      return response.data;
    } catch (error) {
      console.error('Error getting min amount:', error);
      throw new Error('Failed to get minimum amount');
    }
  }

  /**
   * Get estimated price for payment
   */
  async getEstimatedPrice(
    amount: number,
    currencyFrom: string,
    currencyTo: string
  ): Promise<{ currency_from: string; currency_to: string; estimated_amount: number }> {
    try {
      const response = await this.api.get(
        `/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting estimated price:', error);
      throw new Error('Failed to get estimated price');
    }
  }
}

export const nowPaymentsService = new NowPaymentsService();
