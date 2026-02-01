import { apiService } from './api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userWallet: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'NOWPAYMENTS' | 'TON_NATIVE';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentId?: string;
  invoiceUrl?: string;
  txHash?: string;
  createdAt: string;
  paidAt?: string;
}

export interface ShippingDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderRequest {
  userWallet: string;
  items: OrderItem[];
  paymentMethod: 'NOWPAYMENTS' | 'TON_NATIVE';
  shippingDetails: ShippingDetails;
}

export class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const response = await apiService.createOrderForOrderService(orderData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      return response.data.order;
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  async getOrderHistory(walletAddress: string): Promise<Order[]> {
    try {
      const response = await apiService.getOrderHistoryForOrderService(walletAddress);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch order history');
      }

      return response.data.orders;
    } catch (error) {
      console.error('Order history error:', error);
      throw error;
    }
  }
}
