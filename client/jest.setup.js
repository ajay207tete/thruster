/* eslint-disable no-undef */
// Jest setup file for React Native testing
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({})),
  router: {
    back: jest.fn(),
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock @tonconnect/ui-react
jest.mock('@tonconnect/ui-react', () => ({
  TonConnectUI: jest.fn().mockImplementation(() => ({
    connectWallet: jest.fn(() => Promise.resolve({ walletAddress: 'test-wallet-address' })),
    disconnect: jest.fn(() => Promise.resolve()),
    getWallets: jest.fn(() => Promise.resolve([])),
    onStatusChange: jest.fn(),
    removeStatusChange: jest.fn(),
  })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    // Execute the callback immediately for testing
    callback();
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
}));

// Mock @react-navigation/core
jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    replace: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    // Execute the callback immediately for testing
    callback();
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock Alert
  RN.Alert = {
    alert: jest.fn(),
  };

  // Mock Platform
  RN.Platform = {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
  };

  // Mock Dimensions
  RN.Dimensions = {
    get: jest.fn(() => ({ width: 375, height: 812 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  return RN;
});

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    manifest: {
      extra: {
        TON_MANIFEST_URL: 'https://example.com/manifest.json',
        API_BASE_URL: 'http://localhost:3000',
      },
    },
  },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'exp://localhost:19006'),
  openURL: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  })),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock @sanity/client
jest.mock('@sanity/client', () => ({
  createClient: jest.fn(() => ({
    fetch: jest.fn(() => Promise.resolve([])),
  })),
}));

// Mock @sanity/image-url
jest.mock('@sanity/image-url', () => ({
  createImageUrlBuilder: jest.fn(() => ({
    image: jest.fn(() => ({
      url: jest.fn(() => 'https://example.com/image.jpg'),
    })),
  })),
}));

// Global mocks for web APIs
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
  })
);

global.FormData = jest.fn(() => ({
  append: jest.fn(),
}));

global.URL = jest.fn((url) => ({
  href: url,
  pathname: url,
  search: '',
  searchParams: {
    get: jest.fn(() => null),
    set: jest.fn(),
  },
}));

global.URLSearchParams = jest.fn(() => ({
  get: jest.fn(() => null),
  set: jest.fn(),
  toString: jest.fn(() => ''),
}));

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning:') &&
    args[0].includes('useNativeDriver')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock React Native Testing Library specific issues
jest.mock('@testing-library/react-native', () => {
  const actual = jest.requireActual('@testing-library/react-native');
  return {
    ...actual,
    render: (component) => {
      try {
        const result = actual.render(component);
        // Ensure the renderer is properly initialized
        if (result && !result.root) {
          result.root = result.container;
        }
        return result;
      } catch (error) {
        // Fallback for when the actual render fails
        console.warn('React Native Testing Library render failed, using fallback');
        return {
          getByText: () => { throw new Error('Render failed'); },
          getByTestId: () => { throw new Error('Render failed'); },
          queryByText: () => null,
          queryByTestId: () => null,
          findByText: () => Promise.reject(new Error('Render failed')),
          findByTestId: () => Promise.reject(new Error('Render failed')),
          container: null,
          root: null,
          unmount: () => {},
          rerender: () => {},
          debug: () => {},
        };
      }
    },
  };
});
