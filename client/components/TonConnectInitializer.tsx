import { useEffect } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { tonService } from '@/services/tonService-updated';

interface TonConnectInitializerProps {
  children: React.ReactNode;
}

export function TonConnectInitializer({ children }: TonConnectInitializerProps) {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    if (tonConnectUI) {
      // Set the TON Connect UI instance in the service
      tonService.setTonConnectUI(tonConnectUI);

      // Optional: Initialize wallet connection
      tonService.initializeWalletConnection().then((result) => {
        if (result.success) {
          console.log('TON wallet initialized:', result.walletAddress);
        } else {
          console.log('TON wallet initialization failed:', result.error);
        }
      });
    }
  }, [tonConnectUI]);

  return <>{children}</>;
}
