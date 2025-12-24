/**
 * Telegram Web App SDK Initialization Utility
 * Handles safe loading and initialization of the official Telegram Web App SDK
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramThemeParams {
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  hint_color?: string;
  bg_color?: string;
  text_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    chat?: any;
    start_param?: string;
    can_send_after?: number;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  SettingsButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: {
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }[];
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: {
    text?: string;
  }, callback?: (text: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (contact: TelegramUser) => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  enableVerticalSwipes: () => void;
  disableVerticalSwipes: () => void;
  sendData: (data: any) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  shareUrl: (url: string, text?: string) => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
}

class TelegramSdkLoader {
  private static instance: TelegramSdkLoader;
  private sdkLoaded = false;
  private sdkLoading = false;
  private loadPromise: Promise<void> | null = null;

  static getInstance(): TelegramSdkLoader {
    if (!TelegramSdkLoader.instance) {
      TelegramSdkLoader.instance = new TelegramSdkLoader();
    }
    return TelegramSdkLoader.instance;
  }

  /**
   * Load the Telegram Web App SDK script
   */
  async loadSdk(): Promise<void> {
    if (this.sdkLoaded) {
      return;
    }

    if (this.sdkLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.sdkLoading = true;

    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        this.sdkLoaded = true;
        this.sdkLoading = false;
        resolve();
        return;
      }

      // Check if running in Telegram WebView
      if (typeof window !== 'undefined' && window.location.protocol === 'tg:') {
        // In Telegram WebView, SDK should be available
        if (window.Telegram?.WebApp) {
          this.sdkLoaded = true;
          this.sdkLoading = false;
          resolve();
          return;
        }
        // Wait a bit for SDK to initialize
        setTimeout(() => {
          if (window.Telegram?.WebApp) {
            this.sdkLoaded = true;
            this.sdkLoading = false;
            resolve();
          } else {
            reject(new Error('Telegram Web App SDK not available in WebView'));
          }
        }, 100);
        return;
      }

      // Load SDK script for web environment
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;

      script.onload = () => {
        this.sdkLoaded = true;
        this.sdkLoading = false;
        resolve();
      };

      script.onerror = () => {
        this.sdkLoading = false;
        reject(new Error('Failed to load Telegram Web App SDK'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Get the Telegram WebApp instance
   */
  getWebApp(): TelegramWebApp | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.Telegram?.WebApp || null;
  }

  /**
   * Check if running inside Telegram
   */
  isInTelegram(): boolean {
    const webApp = this.getWebApp();
    return !!(webApp && webApp.initData);
  }

  /**
   * Initialize the Web App
   */
  initialize(): TelegramWebApp | null {
    const webApp = this.getWebApp();
    if (webApp) {
      try {
        webApp.ready();
        webApp.expand();
      } catch (error) {
        console.warn('Failed to initialize Telegram Web App:', error);
      }
    }
    return webApp;
  }
}

export const telegramSdkLoader = TelegramSdkLoader.getInstance();

export default telegramSdkLoader;
