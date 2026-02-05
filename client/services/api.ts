import axios from 'axios';
import { API_BASE } from '../config/api';
const API_BASE_URL=API_BASE;
if(!API_BASE_URL){
  console.error('EXPO_PUBLIC_API_BASE_URL environment variable is not set');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const getProducts = async (page: number = 1, limit: number = 10) => {
  const response = await api.get(`/products?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Orders API
export const createOrder = async (orderData: any) => {
  const response = await api.post('/order', orderData);
  return response.data;
};

export const getOrderHistory = async (walletAddress: string) => {
  const response = await api.get(`/order/history/${walletAddress}`);
  return response.data;
};

export const getOrderById = async (id: string) => {
  const response = await api.get(`/order/${id}`);
  return response.data;
};

// Cart API
export const getCart = async (userId: string) => {
  const response = await api.get(`/cart/${userId}`);
  return response.data;
};

export const addToCart = async (userId: string, item: any) => {
  const response = await api.post(`/cart/${userId}`, item);
  return response.data;
};

export const updateCartItem = async (userId: string, itemId: string, item: any) => {
  const response = await api.put(`/cart/${userId}/${itemId}`, item);
  return response.data;
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const response = await api.delete(`/cart/${userId}/${itemId}`);
  return response.data;
};

// Payment API
export const createPayment = async (paymentData: any) => {
  const response = await api.post('/payment', paymentData);
  return response.data;
};

export const getPaymentStatus = async (paymentId: string) => {
  const response = await api.get(`/payment/${paymentId}`);
  return response.data;
};

// Rewards API
export const getRewards = async (userId: string) => {
  const response = await api.get(`/rewards/${userId}`);
  return response.data;
};

export const claimReward = async (userId: string, rewardId: string) => {
  const response = await api.post(`/rewards/${userId}/claim/${rewardId}`);
  return response.data;
};

// User API
export const getUser = async (userId: string) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, userData: any) => {
  const response = await api.put(`/user/${userId}`, userData);
  return response.data;
};

// Auth API
export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// NFT API
export const getNFTs = async (userId: string) => {
  const response = await api.get(`/nft/${userId}`);
  return response.data;
};

export const mintNFT = async (nftData: any) => {
  const response = await api.post('/nft/mint', nftData);
  return response.data;
};

// TON API
export const getTonManifest = async () => {
  const response = await api.get('/tonconnect-manifest');
  return response.data;
};

// Legacy methods for backward compatibility
export const apiService = {
  getProducts,
  getTasks: async () => {
    const response = await api.get('/rewards/tasks');
    return response.data;
  },
  createOrderForOrderService: createOrder,
  getOrderHistoryForOrderService: getOrderHistory,
};
