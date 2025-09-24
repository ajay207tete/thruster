import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BackButtonProps {
  onPress?: () => void;
  style?: any;
  size?: number;
  color?: string;
}

export default function BackButton({
  onPress,
  style,
  size = 24,
  color = '#00ff00'
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Use router.back() for native navigation
      // For web, use browser back or router.back() as fallback
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          router.back();
        }
      } else {
        router.back();
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.backButton, style]}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
});
