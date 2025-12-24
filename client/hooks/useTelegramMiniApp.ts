import { useEffect, useState } from 'react';

// Telegram Web App SDK types (simplified for compatibility)
interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    enable: () => void;
    disable: () => void;
  };
  themeParams?: TelegramThemeParams;
  initData: string;
  initDataUnsafe: {
    user?: any;
    start_param?: string;
  };
  platform: string;
  version: string;
}

// Global Telegram WebApp instance
declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp | undefined;
    } | undefined;
  }
}

export function useTelegramMiniApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [themeParams, setThemeParams] = useState<TelegramThemeParams | undefined>();
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    // Check if running in Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tgWebApp = window.Telegram.WebApp;
      setWebApp(tgWebApp);
      setThemeParams(tgWebApp.themeParams);
      setIsInTelegram(true);

      // Initialize the Web App
      tgWebApp.ready();
      tgWebApp.expand();
    }
  }, []);

  // Back button functions
  const showBackButton = () => {
    webApp?.BackButton.show();
  };

  const hideBackButton = () => {
    webApp?.BackButton.hide();
  };

  const onBackButtonClick = (callback: () => void) => {
    webApp?.BackButton.onClick(callback);
  };

  const offBackButtonClick = (callback: () => void) => {
    webApp?.BackButton.offClick(callback);
  };

  // Main button functions
  const showMainButton = (text?: string) => {
    if (text) {
      webApp?.MainButton.setText(text);
    }
    webApp?.MainButton.show();
  };

  const hideMainButton = () => {
    webApp?.MainButton.hide();
  };

  const setMainButtonText = (text: string) => {
    webApp?.MainButton.setText(text);
  };

  const onMainButtonClick = (callback: () => void) => {
    webApp?.MainButton.onClick(callback);
  };

  const offMainButtonClick = (callback: () => void) => {
    webApp?.MainButton.offClick(callback);
  };

  const enableMainButton = () => {
    webApp?.MainButton.enable();
  };

  const disableMainButton = () => {
    webApp?.MainButton.disable();
  };

  // Utility functions
  const setHeaderColor = (color: string) => {
    webApp?.setHeaderColor(color);
  };

  const setBackgroundColor = (color: string) => {
    webApp?.setBackgroundColor(color);
  };

  const setBottomBarColor = (color: string) => {
    webApp?.setBottomBarColor(color);
  };

  const close = () => {
    webApp?.close();
  };

  return {
    webApp,
    themeParams,
    isInTelegram,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    offBackButtonClick,
    showMainButton,
    hideMainButton,
    setMainButtonText,
    onMainButtonClick,
    offMainButtonClick,
    enableMainButton,
    disableMainButton,
    setHeaderColor,
    setBackgroundColor,
    setBottomBarColor,
    close,
  };
}
