import { useState, useEffect, useCallback, useRef } from 'react';
import { telegramSdkLoader, TelegramWebApp, TelegramUser, TelegramThemeParams } from '../utils/telegramSdk';

export interface TelegramContext {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isInTelegram: boolean;
  isLoading: boolean;
  error: string | null;
  initData: string;
  themeParams: TelegramThemeParams;
  colorScheme: 'light' | 'dark';
  platform: string;
  version: string;
}

export interface TelegramActions {
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
  }) => Promise<string>;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  showScanQrPopup: (params: {
    text?: string;
  }) => Promise<string>;
  closeScanQrPopup: () => void;
  readTextFromClipboard: () => Promise<string>;
  requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<TelegramUser>;
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
  onEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
  offEvent: (eventType: string, eventHandler: (...args: any[]) => void) => void;
}

export interface MainButtonActions {
  setText: (text: string) => void;
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
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface BackButtonActions {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
}

export interface HapticFeedbackActions {
  impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export function useTelegram(): TelegramContext & TelegramActions & {
  MainButton: MainButtonActions;
  BackButton: BackButtonActions;
  HapticFeedback: HapticFeedbackActions;
} {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Initialize SDK
  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        await telegramSdkLoader.loadSdk();
        const tgWebApp = telegramSdkLoader.initialize();

        if (tgWebApp) {
          setWebApp(tgWebApp);

          // Set up event listeners for theme and viewport changes
          const handleThemeChanged = () => {
            setWebApp({ ...tgWebApp });
          };

          const handleViewportChanged = () => {
            setWebApp({ ...tgWebApp });
          };

          tgWebApp.onEvent('themeChanged', handleThemeChanged);
          tgWebApp.onEvent('viewportChanged', handleViewportChanged);

          // Cleanup function
          return () => {
            tgWebApp.offEvent('themeChanged', handleThemeChanged);
            tgWebApp.offEvent('viewportChanged', handleViewportChanged);
          };
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram SDK');
      } finally {
        setIsLoading(false);
      }
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeTelegram();
    }
  }, []);

  // Context values
  const user = webApp?.initDataUnsafe?.user || null;
  const isInTelegram = telegramSdkLoader.isInTelegram();
  const initData = webApp?.initData || '';
  const themeParams = webApp?.themeParams || {};
  const colorScheme = webApp?.colorScheme || 'light';
  const platform = webApp?.platform || '';
  const version = webApp?.version || '';

  // Action functions
  const ready = useCallback(() => {
    webApp?.ready();
  }, [webApp]);

  const expand = useCallback(() => {
    webApp?.expand();
  }, [webApp]);

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  const showPopup = useCallback(async (params: {
    title?: string;
    message: string;
    buttons?: {
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }[];
  }): Promise<string> => {
    return new Promise((resolve) => {
      if (webApp?.showPopup) {
        webApp.showPopup(params, (buttonId: string) => {
          resolve(buttonId);
        });
      } else {
        // Fallback for browsers
        const result = window.confirm(params.message);
        resolve(result ? 'ok' : 'cancel');
      }
    });
  }, [webApp]);

  const showAlert = useCallback(async (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp?.showAlert) {
        webApp.showAlert(message, () => resolve());
      } else {
        window.alert(message);
        resolve();
      }
    });
  }, [webApp]);

  const showConfirm = useCallback(async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp?.showConfirm) {
        webApp.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else {
        const result = window.confirm(message);
        resolve(result);
      }
    });
  }, [webApp]);

  const showScanQrPopup = useCallback(async (params: {
    text?: string;
  }): Promise<string> => {
    return new Promise((resolve) => {
      if (webApp?.showScanQrPopup) {
        webApp.showScanQrPopup(params, (text: string) => {
          resolve(text);
        });
      } else {
        throw new Error('QR scanning not available');
      }
    });
  }, [webApp]);

  const closeScanQrPopup = useCallback(() => {
    webApp?.closeScanQrPopup();
  }, [webApp]);

  const readTextFromClipboard = useCallback(async (): Promise<string> => {
    if (webApp?.readTextFromClipboard) {
      return new Promise((resolve, reject) => {
        webApp.readTextFromClipboard((text: string) => {
          resolve(text);
        });
      });
    } else {
      try {
        const text = await navigator.clipboard.readText();
        return text;
      } catch {
        throw new Error('Clipboard access not available');
      }
    }
  }, [webApp]);

  const requestWriteAccess = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp?.requestWriteAccess) {
        webApp.requestWriteAccess((granted: boolean) => {
          resolve(granted);
        });
      } else {
        resolve(false);
      }
    });
  }, [webApp]);

  const requestContact = useCallback(async (): Promise<TelegramUser> => {
    return new Promise((resolve, reject) => {
      if (webApp?.requestContact) {
        webApp.requestContact((contact: TelegramUser) => {
          resolve(contact);
        });
      } else {
        reject(new Error('Contact request not available'));
      }
    });
  }, [webApp]);

  const setHeaderColor = useCallback((color: string) => {
    webApp?.setHeaderColor(color);
  }, [webApp]);

  const setBackgroundColor = useCallback((color: string) => {
    webApp?.setBackgroundColor(color);
  }, [webApp]);

  const setBottomBarColor = useCallback((color: string) => {
    webApp?.setBottomBarColor(color);
  }, [webApp]);

  const enableClosingConfirmation = useCallback(() => {
    webApp?.enableClosingConfirmation();
  }, [webApp]);

  const disableClosingConfirmation = useCallback(() => {
    webApp?.disableClosingConfirmation();
  }, [webApp]);

  const enableVerticalSwipes = useCallback(() => {
    webApp?.enableVerticalSwipes();
  }, [webApp]);

  const disableVerticalSwipes = useCallback(() => {
    webApp?.disableVerticalSwipes();
  }, [webApp]);

  const sendData = useCallback((data: any) => {
    webApp?.sendData(JSON.stringify(data));
  }, [webApp]);

  const switchInlineQuery = useCallback((query: string, choose_chat_types?: string[]) => {
    webApp?.switchInlineQuery(query, choose_chat_types);
  }, [webApp]);

  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    webApp?.openLink(url, options);
  }, [webApp]);

  const openTelegramLink = useCallback((url: string) => {
    webApp?.openTelegramLink(url);
  }, [webApp]);

  const openInvoice = useCallback((url: string, callback?: (status: string) => void) => {
    webApp?.openInvoice(url, callback);
  }, [webApp]);

  const shareUrl = useCallback((url: string, text?: string) => {
    if (webApp?.shareUrl) {
      webApp.shareUrl(url, text);
    } else {
      navigator.share?.({ url, text });
    }
  }, [webApp]);

  const onEvent = useCallback((eventType: string, eventHandler: (...args: any[]) => void) => {
    webApp?.onEvent(eventType, eventHandler);
  }, [webApp]);

  const offEvent = useCallback((eventType: string, eventHandler: (...args: any[]) => void) => {
    webApp?.offEvent(eventType, eventHandler);
  }, [webApp]);

  // MainButton actions
  const MainButton: MainButtonActions = {
    setText: useCallback((text: string) => {
      webApp?.MainButton?.setText(text);
    }, [webApp]),
    show: useCallback(() => {
      webApp?.MainButton?.show();
    }, [webApp]),
    hide: useCallback(() => {
      webApp?.MainButton?.hide();
    }, [webApp]),
    enable: useCallback(() => {
      webApp?.MainButton?.enable();
    }, [webApp]),
    disable: useCallback(() => {
      webApp?.MainButton?.disable();
    }, [webApp]),
    showProgress: useCallback((leaveActive?: boolean) => {
      webApp?.MainButton?.showProgress(leaveActive);
    }, [webApp]),
    hideProgress: useCallback(() => {
      webApp?.MainButton?.hideProgress();
    }, [webApp]),
    setParams: useCallback((params) => {
      webApp?.MainButton?.setParams(params);
    }, [webApp]),
    onClick: useCallback((callback) => {
      webApp?.MainButton?.onClick(callback);
    }, [webApp]),
    offClick: useCallback((callback) => {
      webApp?.MainButton?.offClick(callback);
    }, [webApp]),
  };

  // BackButton actions
  const BackButton: BackButtonActions = {
    show: useCallback(() => {
      webApp?.BackButton?.show();
    }, [webApp]),
    hide: useCallback(() => {
      webApp?.BackButton?.hide();
    }, [webApp]),
    onClick: useCallback((callback) => {
      webApp?.BackButton?.onClick(callback);
    }, [webApp]),
    offClick: useCallback((callback) => {
      webApp?.BackButton?.offClick(callback);
    }, [webApp]),
  };

  // HapticFeedback actions
  const HapticFeedback: HapticFeedbackActions = {
    impactOccurred: useCallback((style) => {
      webApp?.HapticFeedback?.impactOccurred(style);
    }, [webApp]),
    notificationOccurred: useCallback((type) => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    }, [webApp]),
    selectionChanged: useCallback(() => {
      webApp?.HapticFeedback?.selectionChanged();
    }, [webApp]),
  };

  return {
    // Context
    webApp,
    user,
    isInTelegram,
    isLoading,
    error,
    initData,
    themeParams,
    colorScheme,
    platform,
    version,
    // Actions
    ready,
    expand,
    close,
    showPopup,
    showAlert,
    showConfirm,
    showScanQrPopup,
    closeScanQrPopup,
    readTextFromClipboard,
    requestWriteAccess,
    requestContact,
    setHeaderColor,
    setBackgroundColor,
    setBottomBarColor,
    enableClosingConfirmation,
    disableClosingConfirmation,
    enableVerticalSwipes,
    disableVerticalSwipes,
    sendData,
    switchInlineQuery,
    openLink,
    openTelegramLink,
    openInvoice,
    shareUrl,
    onEvent,
    offEvent,
    // Components
    MainButton,
    BackButton,
    HapticFeedback,
  };
}

export default useTelegram;
