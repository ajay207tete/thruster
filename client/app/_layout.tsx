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
import { MANIFEST_URL } from '@/config/api';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Memoize the manifest URL to prevent unnecessary re-renders
  const manifestUrl = useMemo(() => {
    return MANIFEST_URL;
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <CartProvider>
          <TonConnectInitializer>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
            <Analytics />
          </TonConnectInitializer>
        </CartProvider>
      </TonConnectUIProvider>
    </ThemeProvider>
  );
}
