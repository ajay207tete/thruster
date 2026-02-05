import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTonConnectUI } from '@tonconnect/ui-react';
import axios from 'axios';
import { tonService } from '@/services/tonService-updated';

export default function TonConnectButtonComponent() {
  const [tonConnectUI] = useTonConnectUI();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Set the TonConnect UI instance in the service
    tonService.setTonConnectUI(tonConnectUI);

    const handleConnectionChange = async (wallet: any) => {
      if (wallet) {
        const address = wallet.account.address;
        setWalletAddress(address);

        try {
          // Store wallet address in MongoDB when connected
          const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
          if (!apiUrl) {
            console.error('EXPO_PUBLIC_API_BASE_URL not set, skipping wallet registration');
            return;
          }
          const response = await axios.post(`${apiUrl}/api/users`, {
            walletAddress: address
          });

          if (response.data.success) {
            console.log('✅ Wallet connected and stored in MongoDB:', address);
            console.log('User data:', response.data.user);
          } else {
            console.error('❌ Failed to store wallet address:', response.data.message);
          }
        } catch (error) {
          console.error('❌ Error storing wallet address in MongoDB:', error);
          // Don't show error to user, just log it - wallet connection still works
        }
      } else {
        setWalletAddress(null);
        setShowDropdown(false);
      }
    };

    // Listen for wallet connection changes
    tonConnectUI.onStatusChange(handleConnectionChange);

    return () => {
      // Cleanup not needed as onStatusChange doesn't have an off method
    };
  }, [tonConnectUI]);

  const handleConnectPress = async () => {
    try {
      // Check if wallet is already connected
      if (tonConnectUI.wallet && tonConnectUI.wallet.account) {
        console.log('Wallet already connected');
        return;
      }



      await tonConnectUI.openModal();
    } catch (error) {
      console.error('Error opening wallet modal:', error);
      // Don't throw - just log the error to prevent app crashes
    }
  };

  const handleWalletPress = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    setShowDropdown(false);
  };

  const dropdownOptions = [
    { label: 'Disconnect Wallet', action: handleDisconnect, icon: 'log-out-outline' }
  ];

  if (!walletAddress) {
    return (
      <TouchableOpacity style={styles.button} onPress={handleConnectPress}>
        <Text style={styles.buttonText}>Connect Wallet</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleWalletPress}>
        <Text style={styles.buttonText}>
          {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
        </Text>
        <Ionicons
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={16}
          color="#00ffff"
          style={styles.icon}
        />
      </TouchableOpacity>

      {showDropdown && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showDropdown}
          onRequestClose={() => setShowDropdown(false)}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdown}>
              <FlatList
                data={dropdownOptions}
                keyExtractor={(item) => item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={item.action}
                  >
                    <Ionicons name={item.icon as any} size={20} color="#00ffff" />
                    <Text style={styles.dropdownText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    backgroundColor: '#00ffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  icon: {
    marginLeft: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ffff',
    minWidth: 200,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dropdownText: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginLeft: 12,
  },
});
