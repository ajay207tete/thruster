import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RewardsScreen from '../app/rewards';
import NFTPage from '../app/nft';

// Mock the required modules
jest.mock('@/services/tonService-updated', () => ({
  tonService: {
    getWalletAddress: jest.fn(),
  },
}));

jest.mock('@/services/rewardService', () => ({
  rewardService: {
    getRewards: jest.fn(),
    claimReward: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock Alert
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('Wallet Authentication Tests', () => {
  const mockTonService = require('@/services/tonService-updated').tonService;
  const mockRewardService = require('@/services/rewardService').rewardService;
  const mockRouter = require('expo-router').router;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rewards Page Wallet Authentication', () => {
    test('shows wallet required alert when no wallet connected', async () => {
      mockTonService.getWalletAddress.mockReturnValue(null);

      render(<RewardsScreen />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Wallet Required',
          'Please connect your wallet to view rewards',
          expect.any(Array)
        );
      });

      // Check that alert options include navigation
      const alertCall = mockAlert.mock.calls[0];
      const alertOptions = alertCall[2];

      expect(alertOptions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Connect Wallet' })
        ])
      );
    });

    test('loads rewards data when wallet is connected', async () => {
      const mockWalletAddress = 'UQAbcdef1234567890abcdef1234567890abcdef';
      const mockRewardsResponse = {
        success: true,
        totalPoints: 150,
        rewards: [
          {
            _id: '1',
            actionType: 'FOLLOW_X',
            platform: 'X',
            points: 100,
            status: 'COMPLETED',
            timestamp: '2024-01-01T00:00:00.000Z'
          }
        ]
      };

      mockTonService.getWalletAddress.mockReturnValue(mockWalletAddress);
      mockRewardService.getRewards.mockResolvedValue(mockRewardsResponse);

      render(<RewardsScreen />);

      await waitFor(() => {
        expect(mockRewardService.getRewards).toHaveBeenCalledWith(mockWalletAddress);
      });

      // Check that wallet address is displayed (formatted)
      await waitFor(() => {
        expect(screen.getByText('UQABCD...CDEF')).toBeTruthy();
      });

      // Check that points are displayed
      expect(screen.getByText('150')).toBeTruthy();
    });

    test('logs wallet address to console', async () => {
      const mockWalletAddress = 'UQTestWalletAddress12345678901234567890';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mockTonService.getWalletAddress.mockReturnValue(mockWalletAddress);
      mockRewardService.getRewards.mockResolvedValue({
        success: true,
        totalPoints: 0,
        rewards: []
      });

      render(<RewardsScreen />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Rewards Page - Wallet Address:', mockWalletAddress);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('NFT Page Wallet Authentication', () => {
    test('shows wallet required alert when no wallet connected', async () => {
      mockTonService.getWalletAddress.mockReturnValue(null);

      render(<NFTPage />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Wallet Required',
          'Please connect your wallet to view NFTs',
          expect.any(Array)
        );
      });
    });

    test('displays wallet address when connected', async () => {
      const mockWalletAddress = 'EQTestNFTWalletAddress12345678901234567890';

      mockTonService.getWalletAddress.mockReturnValue(mockWalletAddress);

      render(<NFTPage />);

      await waitFor(() => {
        expect(screen.getByText('EQTEST...7890')).toBeTruthy();
      });

      // Check that NFT content is displayed
      expect(screen.getByText('NFT Collection')).toBeTruthy();
      expect(screen.getByText('Connected Wallet: EQTEST...7890')).toBeTruthy();
    });

    test('logs wallet address to console', async () => {
      const mockWalletAddress = 'EQNFTPageTestAddress12345678901234567890';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      mockTonService.getWalletAddress.mockReturnValue(mockWalletAddress);

      render(<NFTPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('NFT Page - Wallet Address:', mockWalletAddress);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Wallet Address Formatting', () => {
    test('formats long wallet addresses correctly', () => {
      const longAddress = 'UQVeryLongWalletAddressThatShouldBeTruncated1234567890';
      const expected = 'UQVERY...67890';

      mockTonService.getWalletAddress.mockReturnValue(longAddress);
      mockRewardService.getRewards.mockResolvedValue({
        success: true,
        totalPoints: 0,
        rewards: []
      });

      render(<RewardsScreen />);

      waitFor(() => {
        expect(screen.getByText(expected)).toBeTruthy();
      });
    });

    test('displays short wallet addresses as-is', () => {
      const shortAddress = 'UQShort';

      mockTonService.getWalletAddress.mockReturnValue(shortAddress);
      mockRewardService.getRewards.mockResolvedValue({
        success: true,
        totalPoints: 0,
        rewards: []
      });

      render(<RewardsScreen />);

      waitFor(() => {
        expect(screen.getByText(shortAddress)).toBeTruthy();
      });
    });
  });

  describe('Navigation on Wallet Required', () => {
    test('navigates back when cancel pressed on rewards page', async () => {
      mockTonService.getWalletAddress.mockReturnValue(null);

      render(<RewardsScreen />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

      // Simulate pressing cancel (first button in array)
      const alertCall = mockAlert.mock.calls[0];
      const cancelAction = alertCall[2]?.find((option: any) => option.text === 'Cancel');

      if (cancelAction?.onPress) {
        cancelAction.onPress();
        expect(mockRouter.back).toHaveBeenCalled();
      }
    });

    test('navigates to home when connect wallet pressed', async () => {
      mockTonService.getWalletAddress.mockReturnValue(null);

      render(<RewardsScreen />);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalled();
      });

      // Simulate pressing connect wallet
      const alertCall = mockAlert.mock.calls[0];
      const connectAction = alertCall[2]?.find((option: any) => option.text === 'Connect Wallet');

      if (connectAction?.onPress) {
        connectAction.onPress();
        expect(mockRouter.push).toHaveBeenCalledWith('/');
      }
    });
  });
});
