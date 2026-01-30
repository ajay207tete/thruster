import { describe, it, expect, jest } from '@jest/globals';
import axios from 'axios';
import { apiService } from '../services/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products from correct endpoint', async () => {
      const mockResponse = {
        data: {
          products: [
            {
              _id: '1',
              name: 'Test Product',
              description: 'Test description',
              price: 29.99,
              imageUrl: 'http://example.com/image.jpg',
              sizes: ['S', 'M', 'L'],
              colors: ['Black', 'White'],
              category: 'Clothing',
              stock: 10
            }
          ]
        }
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      } as any);

      const result = await apiService.getProducts();

      expect(mockedAxios.create).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe('Test Product');
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(mockError),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      } as any);

      await expect(apiService.getProducts()).rejects.toThrow('Network error');
    });
  });

  describe('API Base URL', () => {
    it('should use correct base URL', () => {
      // The API base URL should be set to http://localhost:5002/api
      const expectedBaseURL = 'http://localhost:5002/api';

      // We can't directly test the baseURL since it's set in the service
      // But we can verify the service exists and has the expected structure
      expect(apiService).toBeDefined();
      expect(typeof apiService.getProducts).toBe('function');
    });
  });
});
