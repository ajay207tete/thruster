import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5002/api'; // Server API base URL

// Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string | null; // Direct image URL
  sizes: string[];
  colors: string[];
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  shippingDetails: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  bookings: Booking[];
  orders: Order[];
}

export interface Booking {
  _id: string;
  productId: string;
  quantity: number;
  bookingDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: string;
}

export interface Order {
  _id: string;
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentId: string;
  paymentStatus: string;
  paymentCurrency: string;
  shippingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  orderDate: string;
  status: string;
}

interface OrderData {
  userId: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentId: string;
  paymentCurrency: string;
  shippingDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
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

  async createProduct(productData: { name: string; description: string; price: number; imageUrl: string; sizes?: string[]; colors?: string[]; category?: string; stock?: number }) {
    const response = await this.api.post('/products', {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      imageUrl: productData.imageUrl,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      category: productData.category || 'clothing',
      stock: productData.stock || 0,
    });
    return response.data;
  }

  async updateProduct(id: string, productData: { name?: string; description?: string; price?: number; imageUrl?: string; sizes?: string[]; colors?: string[]; category?: string; stock?: number }) {
    const response = await this.api.put(`/products/${id}`, {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      imageUrl: productData.imageUrl,
      sizes: productData.sizes,
      colors: productData.colors,
      category: productData.category,
      stock: productData.stock,
    });
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

  async createUser(userData: any) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: any) {
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
}

export const apiService = new ApiService();
