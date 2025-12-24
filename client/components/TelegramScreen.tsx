import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { useTelegramMiniApp } from '@/hooks/useTelegramMiniApp';

const { width: screenWidth } = Dimensions.get('window');

export interface TelegramScreenProps {
  title?: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  showMainButton?: boolean;
  mainButtonText?: string;
  onMainButtonPress?: () => void;
  onBackPress?: () => void;
  style?: any;
}

export function TelegramScreen({
  title,
  children,
  showBackButton = false,
  showMainButton = false,
  mainButtonText = 'Continue',
  onMainButtonPress,
  onBackPress,
  style,
}: TelegramScreenProps) {
  const {
    themeParams,
    showBackButton: showTgBackButton,
    hideBackButton: hideTgBackButton,
    onBackButtonClick,
    offBackButtonClick,
    showMainButton: showTgMainButton,
    hideMainButton: hideTgMainButton,
    setMainButtonText,
    onMainButtonClick,
    offMainButtonClick,
    enableMainButton,
    disableMainButton,
  } = useTelegramMiniApp();

  // Handle back button
  useEffect(() => {
    if (showBackButton && onBackPress) {
      showTgBackButton();
      onBackButtonClick(onBackPress);
    } else {
      hideTgBackButton();
    }

    return () => {
      offBackButtonClick(onBackPress!);
    };
  }, [showBackButton, onBackPress, showTgBackButton, hideTgBackButton, onBackButtonClick, offBackButtonClick]);

  // Handle main button
  useEffect(() => {
    if (showMainButton && onMainButtonPress) {
      showTgMainButton(mainButtonText);
      setMainButtonText(mainButtonText);
      onMainButtonClick(onMainButtonPress);
      enableMainButton();
    } else {
      hideTgMainButton();
    }

    return () => {
      offMainButtonClick(onMainButtonPress!);
    };
  }, [
    showMainButton,
    mainButtonText,
    onMainButtonPress,
    showTgMainButton,
    hideTgMainButton,
    setMainButtonText,
    onMainButtonClick,
    offMainButtonClick,
    enableMainButton,
  ]);

  return (
    <View style={[styles.container, {
      backgroundColor: themeParams?.bg_color || '#ffffff',
      maxWidth: Math.min(screenWidth, 420),
    }, style]}>
      {title && (
        <View style={[styles.header, {
          backgroundColor: themeParams?.header_bg_color || themeParams?.bg_color || '#ffffff',
          borderBottomColor: themeParams?.secondary_bg_color || '#f0f0f0',
        }]}>
          <ThemedText style={[styles.headerTitle, {
            color: themeParams?.text_color || '#000000',
          }]}>
            {title}
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

// Header with back button component
export function TelegramHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
}: {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}) {
  const { themeParams } = useTelegramMiniApp();

  return (
    <View style={[styles.header, {
      backgroundColor: themeParams?.header_bg_color || themeParams?.bg_color || '#ffffff',
      borderBottomColor: themeParams?.secondary_bg_color || '#f0f0f0',
    }]}>
      {showBackButton && onBackPress && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={themeParams?.text_color || '#000000'}
          />
        </TouchableOpacity>
      )}

      <View style={styles.headerTitleContainer}>
        <ThemedText style={[styles.headerTitle, {
          color: themeParams?.text_color || '#000000',
        }]}>
          {title}
        </ThemedText>
      </View>

      {rightComponent && (
        <View style={styles.headerRight}>
          {rightComponent}
        </View>
      )}
    </View>
  );
}

// Button component following Telegram guidelines
export function TelegramButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}) {
  const { themeParams } = useTelegramMiniApp();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? themeParams?.secondary_bg_color || '#f0f0f0'
            : themeParams?.button_color || '#2481cc',
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <View style={styles.spinner} />
      ) : (
        <ThemedText style={[
          styles.buttonText,
          {
            color: disabled
              ? themeParams?.hint_color || '#999999'
              : themeParams?.button_text_color || '#ffffff',
          },
          textStyle,
        ]}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

// Card component
export function TelegramCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  const { themeParams } = useTelegramMiniApp();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: themeParams?.section_bg_color || themeParams?.bg_color || '#ffffff',
        borderColor: themeParams?.secondary_bg_color || '#f0f0f0',
      },
      style,
    ]}>
      {children}
    </View>
  );
}

// Text components with Telegram theme
export function TelegramText({
  children,
  style,
  type = 'default',
}: {
  children: React.ReactNode;
  style?: any;
  type?: 'default' | 'secondary' | 'hint' | 'accent' | 'destructive';
}) {
  const { themeParams } = useTelegramMiniApp();

  const getColor = () => {
    switch (type) {
      case 'secondary':
        return themeParams?.subtitle_text_color || '#999999';
      case 'hint':
        return themeParams?.hint_color || '#999999';
      case 'accent':
        return themeParams?.accent_text_color || themeParams?.link_color || '#2481cc';
      case 'destructive':
        return themeParams?.destructive_text_color || '#ff0000';
      default:
        return themeParams?.text_color || '#000000';
    }
  };

  return (
    <ThemedText style={[
      styles.text,
      { color: getColor() },
      type === 'accent' && styles.textAccent,
      type === 'destructive' && styles.textDestructive,
      style,
    ]}>
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Safe bottom spacing
  },
  button: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  textAccent: {
    fontWeight: '600',
  },
  textDestructive: {
    fontWeight: '600',
  },
});
