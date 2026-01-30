import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8888/.netlify/functions'; // Server API base URL

// Types
export interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category?: string;
  stock?: number;
}

export interface User {
  walletAddress: string;
  totalPoints: number;
  isActive: boolean;
}

export interface Order {
  _id: string;
  userWalletAddress: string;
  products: Array<{
    productId: string;
    title: string;
    price: number;
    qty: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalAmount: number;
  paymentMethod: 'TON' | 'INR';
  paymentStatus: 'pending' | 'paid' | 'failed';
  txHash?: string;
  rewardPointsEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  userWalletAddress: string;
  actionType: 'follow_x' | 'follow_instagram' | 'join_telegram' | 'share_app' | 'purchase';
  points: number;
  referenceId?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderData {
  userWalletAddress: string;
  products: Array<{
    productId: string;
    title: string;
    price: number;
    qty: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  totalAmount: number;
  paymentMethod: 'TON' | 'INR';
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Products
  async getProducts() {
    const response = await this.api.get('/products');
    return response.data;
  }

  async getProductById(id: string) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getCart(walletAddress: string) {
    const response = await this.api.get(`/cart/${walletAddress}`);
    return response.data;
  }

  async createProduct(productData: { name: string; description: string; price: number; imageUrl: string; sizes?: string[]; colors?: string[]; category?: string; stock?: number }) {
    const response = await this.api.post('/products', {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      imageUrl: productData.imageUrl,
      sizes: productData.sizes,
      colors: productData.colors,
      category: productData.category,
      stock: productData.stock
    });
    return response.data;
  }

  async updateProduct(id: string, productData: { name?: string; description?: string; price?: number; imageUrl?: string; sizes?: string[]; colors?: string[]; category?: string; stock?: number }) {
    const response = await this.api.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.api.delete(`/products/${id}`);
    return response.data;
  }

  // Users
  async getUsers() {
    const response = await this.api.get('/users');
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: { walletAddress: string; totalPoints?: number; isActive?: boolean }) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: { walletAddress?: string; totalPoints?: number; isActive?: boolean }) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  // Bookings
  async getUserBookings(userId: string) {
    const response = await this.api.get(`/users/${userId}/bookings`);
    return response.data;
  }

  async createBooking(userId: string, bookingData: any) {
    const response = await this.api.post(`/users/${userId}/bookings`, bookingData);
    return response.data;
  }

  // Orders
  async createOrder(orderData: OrderData) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async getUserOrders(userId: string) {
    const response = await this.api.get(`/orders/user/${userId}`);
    return response.data;
  }

  async getOrderById(orderId: string) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, statusData: { status?: string; paymentStatus?: string }) {
    const response = await this.api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  }

  async cancelOrder(orderId: string) {
    const response = await this.api.put(`/orders/${orderId}/cancel`);
    return response.data;
  }

  // Hotels
  async searchHotels(cityCode: string, checkInDate: string, checkOutDate: string, adults?: number) {
    const response = await this.api.get('/hotels/search', {
      params: { cityCode, checkInDate, checkOutDate, adults }
    });
    return response.data;
  }

  async getHotelDetails(hotelId: string, checkInDate: string, checkOutDate: string, adults?: number) {
    const response = await this.api.get(`/hotels/${hotelId}`, {
      params: { checkInDate, checkOutDate, adults }
    });
    return response.data;
  }

  async bookHotel(offerId: string, guests: any[]) {
    const response = await this.api.post('/hotels/book', { offerId, guests });
    return response.data;
  }

  // Orders for OrderService
  async createOrderForOrderService(orderData: any) {
    const response = await this.api.post('/order/create', orderData);
    return response.data;
  }

  async getOrderHistoryForOrderService(walletAddress: string) {
    const response = await this.api.get(`/order/history/${walletAddress}`);
    return response.data;
  }

  // Generic methods for custom endpoints
  async get(endpoint: string) {
    const response = await this.api.get(endpoint);
    return response;
  }

  async post(endpoint: string, data?: any) {
    const response = await this.api.post(endpoint, data);
    return response;
  }
}

export const apiService = new ApiService();
