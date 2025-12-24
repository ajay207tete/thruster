import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useTelegram } from './useTelegram';

export interface TelegramTheme {
  // Background colors
  bg_color: string;
  secondary_bg_color: string;
  section_bg_color: string;

  // Text colors
  text_color: string;
  hint_color: string;
  subtitle_text_color: string;
  section_header_text_color: string;

  // Accent colors
  link_color: string;
  accent_text_color: string;
  destructive_text_color: string;

  // Button colors
  button_color: string;
  button_text_color: string;

  // Header colors
  header_bg_color: string;
}

export interface ThemeColors {
  // Background
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textHint: string;
  textAccent: string;
  textDestructive: string;

  // Interactive
  primary: string;
  link: string;
  button: string;
  buttonText: string;

  // Special
  header: string;
  border: string;
}

const DEFAULT_LIGHT_THEME: ThemeColors = {
  background: '#ffffff',
  surface: '#f8f9fa',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#6c757d',
  textHint: '#adb5bd',
  textAccent: '#007bff',
  textDestructive: '#dc3545',
  primary: '#007bff',
  link: '#007bff',
  button: '#007bff',
  buttonText: '#ffffff',
  header: '#ffffff',
  border: '#dee2e6',
};

const DEFAULT_DARK_THEME: ThemeColors = {
  background: '#000000',
  surface: '#1a1a1a',
  card: '#2a2a2a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  textHint: '#888888',
  textAccent: '#4dabf7',
  textDestructive: '#ff6b6b',
  primary: '#4dabf7',
  link: '#4dabf7',
  button: '#4dabf7',
  buttonText: '#ffffff',
  header: '#1a1a1a',
  border: '#404040',
};

export function useTelegramTheme(): {
  theme: ThemeColors;
  isTelegramTheme: boolean;
  colorScheme: 'light' | 'dark';
  telegramThemeParams: any;
} {
  const { themeParams, colorScheme: telegramColorScheme, isInTelegram } = useTelegram();
  const systemColorScheme = useColorScheme();

  // Determine which color scheme to use
  const effectiveColorScheme = useMemo(() => {
    if (isInTelegram && telegramColorScheme) {
      return telegramColorScheme;
    }
    return systemColorScheme || 'light';
  }, [isInTelegram, telegramColorScheme, systemColorScheme]);

  // Build theme from Telegram theme params or use defaults
  const theme = useMemo((): ThemeColors => {
    if (!isInTelegram || !themeParams) {
      return effectiveColorScheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
    }

    // Map Telegram theme params to our theme structure
    const telegramTheme: ThemeColors = {
      background: themeParams.bg_color || DEFAULT_LIGHT_THEME.background,
      surface: themeParams.secondary_bg_color || themeParams.bg_color || DEFAULT_LIGHT_THEME.surface,
      card: themeParams.section_bg_color || themeParams.secondary_bg_color || themeParams.bg_color || DEFAULT_LIGHT_THEME.card,

      text: themeParams.text_color || DEFAULT_LIGHT_THEME.text,
      textSecondary: themeParams.subtitle_text_color || themeParams.hint_color || DEFAULT_LIGHT_THEME.textSecondary,
      textHint: themeParams.hint_color || DEFAULT_LIGHT_THEME.textHint,
      textAccent: themeParams.accent_text_color || themeParams.link_color || DEFAULT_LIGHT_THEME.textAccent,
      textDestructive: themeParams.destructive_text_color || DEFAULT_LIGHT_THEME.textDestructive,

      primary: themeParams.button_color || themeParams.link_color || DEFAULT_LIGHT_THEME.primary,
      link: themeParams.link_color || DEFAULT_LIGHT_THEME.link,
      button: themeParams.button_color || DEFAULT_LIGHT_THEME.button,
      buttonText: themeParams.button_text_color || DEFAULT_LIGHT_THEME.buttonText,

      header: themeParams.header_bg_color || themeParams.bg_color || DEFAULT_LIGHT_THEME.header,
      border: DEFAULT_LIGHT_THEME.border, // Telegram doesn't provide border color
    };

    return telegramTheme;
  }, [isInTelegram, themeParams, effectiveColorScheme]);

  // Apply theme to document root for CSS custom properties
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Set CSS custom properties
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(`--telegram-${key}`, value);
      });

      // Set color scheme
      root.style.setProperty('--telegram-color-scheme', effectiveColorScheme);
    }
  }, [theme, effectiveColorScheme]);

  return {
    theme,
    isTelegramTheme: isInTelegram && !!themeParams,
    colorScheme: effectiveColorScheme,
    telegramThemeParams: themeParams,
  };
}

export default useTelegramTheme;
