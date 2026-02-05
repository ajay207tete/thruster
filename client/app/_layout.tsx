import { useMemo } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { Analytics } from '@vercel/analytics/react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';
import { TonConnectInitializer } from '@/components/TonConnectInitializer';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Memoize the manifest URL to prevent unnecessary re-renders
  const manifestUrl = useMemo(() => {
    const url = process.env.EXPO_PUBLIC_TON_MANIFEST_URL;
    if (!url) {
      console.error('EXPO_PUBLIC_TON_MANIFEST_URL environment variable is not set');
    }
    return url;
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl} key="ton-connect-provider">
      <TonConnectInitializer>
        <CartProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="payment" />
              <Stack.Screen name="order-success" />
              <Stack.Screen name="rewards" />
              <Stack.Screen name="nft" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </CartProvider>
      </TonConnectInitializer>
      <Analytics />
    </TonConnectUIProvider>
  );
}
