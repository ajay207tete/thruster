import { useEffect, useMemo, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TonConnectUIProvider, useTonConnectUI } from '@tonconnect/ui-react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { CartProvider } from '@/contexts/CartContext';
import { tonService } from '@/services/tonService-updated';
import { TonConnectInitializer } from '@/components/TonConnectInitializer';
import { TelegramProvider } from '@/components/TelegramProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== 'undefined' && (window as any).Telegram && (window as any).Telegram.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');

      // Set viewport meta tag for Telegram Mini App
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }

      // Disable scroll bounce on iOS
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
    }
  }, []);

  // Memoize the manifest URL to prevent unnecessary re-renders
  const manifestUrl = useMemo(() => {
    return process.env.EXPO_PUBLIC_TON_MANIFEST_URL || "/tonconnect-manifest.json";
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <TelegramProvider>
      <TonConnectUIProvider manifestUrl={manifestUrl} key="ton-connect-provider">
        <TonConnectInitializer>
          <CartProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                <Stack.Screen name="my-order" options={{ headerShown: false }} />
                <Stack.Screen name="my-booking" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="rewards" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </CartProvider>
        </TonConnectInitializer>
      </TonConnectUIProvider>
    </TelegramProvider>
  );
}
