import { useEffect, useMemo, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TonConnectUIProvider, useTonConnectUI } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';
import { tonService } from '@/services/tonService-updated';
import { TonConnectInitializer } from '@/components/TonConnectInitializer';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Memoize the manifest URL to prevent unnecessary re-renders
  const manifestUrl = useMemo(() => {
    return process.env.EXPO_PUBLIC_TON_MANIFEST_URL || "/tonconnect-manifest.json";
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
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </CartProvider>
      </TonConnectInitializer>
      <Analytics />
      <SpeedInsights />
    </TonConnectUIProvider>
  );
}
