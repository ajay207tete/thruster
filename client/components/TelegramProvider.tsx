import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Telegram Web App interfaces
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
  themeParams: {
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
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
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
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (contact: TelegramUser) => void) => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
}

// Telegram Context
interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isInTelegram: boolean;
  expand: () => void;
  close: () => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }) => Promise<string>;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
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
  readTextFromClipboard: () => Promise<string>;
  requestWriteAccess: () => Promise<boolean>;
  requestContact: () => Promise<TelegramUser>;
  ready: () => void;
  onEvent: (eventType: string, eventHandler: Function) => void;
  offEvent: (eventType: string, eventHandler: Function) => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

// Telegram Provider Component
interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider: React.FC<TelegramProviderProps> = ({ children }) => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    // Check if running in Telegram Web App
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tgWebApp = (window as any).Telegram.WebApp as TelegramWebApp;
      setWebApp(tgWebApp);
      setUser(tgWebApp.initDataUnsafe?.user || null);
      setIsInTelegram(true);

      // Initialize the Web App
      tgWebApp.ready();

      // Set up event listeners
      const handleThemeChanged = () => {
        setWebApp({ ...tgWebApp });
      };

      const handleViewportChanged = () => {
        setWebApp({ ...tgWebApp });
      };

      tgWebApp.onEvent('themeChanged', handleThemeChanged);
      tgWebApp.onEvent('viewportChanged', handleViewportChanged);

      // Cleanup
      return () => {
        tgWebApp.offEvent('themeChanged', handleThemeChanged);
        tgWebApp.offEvent('viewportChanged', handleViewportChanged);
      };
    }
  }, []);

  const expand = () => {
    webApp?.expand();
  };

  const close = () => {
    webApp?.close();
  };

  const showPopup = async (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
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
  };

  const showAlert = async (message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp?.showAlert) {
        webApp.showAlert(message, () => resolve());
      } else {
        window.alert(message);
        resolve();
      }
    });
  };

  const showConfirm = async (message: string): Promise<boolean> => {
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
  };

  const setHeaderColor = (color: string) => {
    webApp?.setHeaderColor(color);
  };

  const setBackgroundColor = (color: string) => {
    webApp?.setBackgroundColor(color);
  };

  const setBottomBarColor = (color: string) => {
    webApp?.setBottomBarColor(color);
  };

  const enableClosingConfirmation = () => {
    webApp?.enableClosingConfirmation();
  };

  const disableClosingConfirmation = () => {
    webApp?.disableClosingConfirmation();
  };

  const enableVerticalSwipes = () => {
    webApp?.enableVerticalSwipes();
  };

  const disableVerticalSwipes = () => {
    webApp?.disableVerticalSwipes();
  };

  const sendData = (data: any) => {
    webApp?.sendData(JSON.stringify(data));
  };

  const switchInlineQuery = (query: string, choose_chat_types?: string[]) => {
    webApp?.switchInlineQuery(query, choose_chat_types);
  };

  const openLink = (url: string, options?: { try_instant_view?: boolean }) => {
    webApp?.openLink(url, options);
  };

  const openTelegramLink = (url: string) => {
    webApp?.openTelegramLink(url);
  };

  const openInvoice = (url: string, callback?: (status: string) => void) => {
    webApp?.openInvoice(url, callback);
  };

  const shareUrl = (url: string, text?: string) => {
    if (webApp?.shareUrl) {
      webApp.shareUrl(url, text);
    } else {
      // Fallback
      navigator.share?.({ url, text });
    }
  };

  const readTextFromClipboard = async (): Promise<string> => {
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
  };

  const requestWriteAccess = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp?.requestWriteAccess) {
        webApp.requestWriteAccess((granted: boolean) => {
          resolve(granted);
        });
      } else {
        resolve(false);
      }
    });
  };

  const requestContact = async (): Promise<TelegramUser> => {
    return new Promise((resolve, reject) => {
      if (webApp?.requestContact) {
        webApp.requestContact((contact: TelegramUser) => {
          resolve(contact);
        });
      } else {
        reject(new Error('Contact request not available'));
      }
    });
  };

  const ready = () => {
    webApp?.ready();
  };

  const onEvent = (eventType: string, eventHandler: Function) => {
    webApp?.onEvent(eventType, eventHandler);
  };

  const offEvent = (eventType: string, eventHandler: Function) => {
    webApp?.offEvent(eventType, eventHandler);
  };

  const contextValue: TelegramContextType = {
    webApp,
    user,
    isInTelegram,
    expand,
    close,
    showPopup,
    showAlert,
    showConfirm,
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
    readTextFromClipboard,
    requestWriteAccess,
    requestContact,
    ready,
    onEvent,
    offEvent,
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

// Hook to use Telegram context
export const useTelegram = (): TelegramContextType => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

// Hook to get Telegram user
export const useTelegramUser = (): TelegramUser | null => {
  const { user } = useTelegram();
  return user;
};

// Hook to check if in Telegram
export const useIsInTelegram = (): boolean => {
  const { isInTelegram } = useTelegram();
  return isInTelegram;
};
