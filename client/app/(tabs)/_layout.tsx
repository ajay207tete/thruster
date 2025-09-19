import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="travel" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="travel-checkout" />
      <Stack.Screen name="travel-product-detail" />
    </Stack>
  );
}
