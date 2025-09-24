// Jest setup file for React Native testing with React 19 compatibility
// import 'react-native-gesture-handler/jestSetup';

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

// Mock react-native Alert - this is the key fix
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');

  // Mock Alert properly
  Object.defineProperty(ReactNative, 'Alert', {
    value: {
      alert: jest.fn(),
    },
    writable: true,
  });

  return ReactNative;
});

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

// Fix for React 19 and React Native Testing Library compatibility
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react');
  const ScrollView = require('react-native').ScrollView;
  return {
    ...ScrollView,
    render: () => React.createElement('ScrollView', null),
  };
});

// Mock FlatList to prevent renderer issues
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  return {
    FlatList: React.forwardRef((props, ref) =>
      React.createElement('View', { ...props, ref })
    ),
  };
});

// Mock Image to prevent renderer issues
jest.mock('react-native/Libraries/Image/Image', () => {
  const React = require('react');
  return {
    Image: React.forwardRef((props, ref) =>
      React.createElement('View', { ...props, ref })
    ),
  };
});

// Mock TouchableOpacity to prevent renderer issues
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const React = require('react');
  return {
    TouchableOpacity: React.forwardRef((props, ref) =>
      React.createElement('View', { ...props, ref })
    ),
  };
});

// Mock Text to prevent renderer issues
jest.mock('react-native/Libraries/Text/Text', () => {
  const React = require('react');
  return {
    Text: React.forwardRef((props, ref) =>
      React.createElement('Text', { ...props, ref })
    ),
  };
});

// Mock View to prevent renderer issues
jest.mock('react-native/Libraries/Components/View/View', () => {
  const React = require('react');
  return {
    View: React.forwardRef((props, ref) =>
      React.createElement('View', { ...props, ref })
    ),
  };
});

// Mock TextInput to prevent renderer issues
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
  const React = require('react');
  return {
    TextInput: React.forwardRef((props, ref) =>
      React.createElement('TextInput', { ...props, ref })
    ),
  };
});

// Mock Pressable to prevent renderer issues
jest.mock('react-native/Libraries/Components/Pressable/Pressable', () => {
  const React = require('react');
  return {
    Pressable: React.forwardRef((props, ref) =>
      React.createElement('Pressable', { ...props, ref })
    ),
  };
});

// Mock Modal to prevent renderer issues
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  return {
    Modal: React.forwardRef((props, ref) =>
      React.createElement('Modal', { ...props, ref })
    ),
  };
});

// Mock ActivityIndicator to prevent renderer issues
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => {
  const React = require('react');
  return {
    ActivityIndicator: React.forwardRef((props, ref) =>
      React.createElement('ActivityIndicator', { ...props, ref })
    ),
  };
});

// Mock Switch to prevent renderer issues
jest.mock('react-native/Libraries/Components/Switch/Switch', () => {
  const React = require('react');
  return {
    Switch: React.forwardRef((props, ref) =>
      React.createElement('Switch', { ...props, ref })
    ),
  };
});

// Mock RefreshControl to prevent renderer issues
jest.mock('react-native/Libraries/Components/RefreshControl/RefreshControl', () => {
  const React = require('react');
  return {
    RefreshControl: React.forwardRef((props, ref) =>
      React.createElement('RefreshControl', { ...props, ref })
    ),
  };
});

// Mock SectionList to prevent renderer issues
jest.mock('react-native/Libraries/Lists/SectionList', () => {
  const React = require('react');
  return {
    SectionList: React.forwardRef((props, ref) =>
      React.createElement('SectionList', { ...props, ref })
    ),
  };
});

// Mock VirtualizedList to prevent renderer issues
jest.mock('react-native/Libraries/Lists/VirtualizedList', () => {
  const React = require('react');
  return {
    VirtualizedList: React.forwardRef((props, ref) =>
      React.createElement('VirtualizedList', { ...props, ref })
    ),
  };
});

// Mock KeyboardAvoidingView to prevent renderer issues
jest.mock('react-native/Libraries/Components/Keyboard/KeyboardAvoidingView', () => {
  const React = require('react');
  return {
    KeyboardAvoidingView: React.forwardRef((props, ref) =>
      React.createElement('KeyboardAvoidingView', { ...props, ref })
    ),
  };
});

// Mock SafeAreaView to prevent renderer issues
jest.mock('react-native/Libraries/Components/SafeAreaView/SafeAreaView', () => {
  const React = require('react');
  return {
    SafeAreaView: React.forwardRef((props, ref) =>
      React.createElement('SafeAreaView', { ...props, ref })
    ),
  };
});

// Mock StatusBar to prevent renderer issues
jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => {
  const React = require('react');
  return {
    StatusBar: React.forwardRef((props, ref) =>
      React.createElement('StatusBar', { ...props, ref })
    ),
  };
});

// Mock DrawerLayoutAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/DrawerAndroid/DrawerLayoutAndroid', () => {
  const React = require('react');
  return {
    DrawerLayoutAndroid: React.forwardRef((props, ref) =>
      React.createElement('DrawerLayoutAndroid', { ...props, ref })
    ),
  };
});

// Mock TouchableHighlight to prevent renderer issues
jest.mock('react-native/Libraries/Components/Touchable/TouchableHighlight', () => {
  const React = require('react');
  return {
    TouchableHighlight: React.forwardRef((props, ref) =>
      React.createElement('TouchableHighlight', { ...props, ref })
    ),
  };
});

// Mock TouchableNativeFeedback to prevent renderer issues
jest.mock('react-native/Libraries/Components/Touchable/TouchableNativeFeedback', () => {
  const React = require('react');
  return {
    TouchableNativeFeedback: React.forwardRef((props, ref) =>
      React.createElement('TouchableNativeFeedback', { ...props, ref })
    ),
  };
});

// Mock TouchableWithoutFeedback to prevent renderer issues
jest.mock('react-native/Libraries/Components/Touchable/TouchableWithoutFeedback', () => {
  const React = require('react');
  return {
    TouchableWithoutFeedback: React.forwardRef((props, ref) =>
      React.createElement('TouchableWithoutFeedback', { ...props, ref })
    ),
  };
});

// Mock ViewPagerAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/ViewPager/ViewPagerAndroid', () => {
  const React = require('react');
  return {
    ViewPagerAndroid: React.forwardRef((props, ref) =>
      React.createElement('ViewPagerAndroid', { ...props, ref })
    ),
  };
});

// Mock WebView to prevent renderer issues
jest.mock('react-native/Libraries/Components/WebView/WebView', () => {
  const React = require('react');
  return {
    WebView: React.forwardRef((props, ref) =>
      React.createElement('WebView', { ...props, ref })
    ),
  };
});

// Mock ProgressBarAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/ProgressBarAndroid/ProgressBarAndroid', () => {
  const React = require('react');
  return {
    ProgressBarAndroid: React.forwardRef((props, ref) =>
      React.createElement('ProgressBarAndroid', { ...props, ref })
    ),
  };
});

// Mock ProgressViewIOS to prevent renderer issues
jest.mock('react-native/Libraries/Components/ProgressViewIOS/ProgressViewIOS', () => {
  const React = require('react');
  return {
    ProgressViewIOS: React.forwardRef((props, ref) =>
      React.createElement('ProgressViewIOS', { ...props, ref })
    ),
  };
});

// Mock SegmentedControlIOS to prevent renderer issues
jest.mock('react-native/Libraries/Components/SegmentedControlIOS/SegmentedControlIOS', () => {
  const React = require('react');
  return {
    SegmentedControlIOS: React.forwardRef((props, ref) =>
      React.createElement('SegmentedControlIOS', { ...props, ref })
    ),
  };
});

// Mock Picker to prevent renderer issues
jest.mock('react-native/Libraries/Components/Picker/Picker', () => {
  const React = require('react');
  return {
    Picker: React.forwardRef((props, ref) =>
      React.createElement('Picker', { ...props, ref })
    ),
  };
});

// Mock DatePickerIOS to prevent renderer issues
jest.mock('react-native/Libraries/Components/DatePickerIOS/DatePickerIOS', () => {
  const React = require('react');
  return {
    DatePickerIOS: React.forwardRef((props, ref) =>
      React.createElement('DatePickerIOS', { ...props, ref })
    ),
  };
});

// Mock ActionSheetIOS to prevent renderer issues
jest.mock('react-native/Libraries/ActionSheetIOS/ActionSheetIOS', () => {
  const React = require('react');
  return {
    ActionSheetIOS: {
      showActionSheetWithOptions: jest.fn(),
      showShareActionSheetWithOptions: jest.fn(),
    },
  };
});

// Mock Share to prevent renderer issues
jest.mock('react-native/Libraries/Share/Share', () => {
  const React = require('react');
  return {
    Share: {
      share: jest.fn(),
    },
  };
});

// Mock Linking to prevent renderer issues
jest.mock('react-native/Libraries/Linking/Linking', () => {
  const React = require('react');
  return {
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
    },
  };
});

// Mock Dimensions to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/Dimensions', () => {
  const React = require('react');
  return {
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock PixelRatio to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => {
  const React = require('react');
  return {
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => Math.round(size)),
    },
  };
});

// Mock Platform to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const React = require('react');
  return {
    Platform: {
      OS: 'ios',
      Version: '13.0',
      isTV: false,
      isTesting: true,
      select: jest.fn((objs) => objs.ios || objs.default),
    },
  };
});

// Mock UIManager to prevent renderer issues
jest.mock('react-native/Libraries/ReactNative/UIManager', () => {
  const React = require('react');
  return {
    UIManager: {
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
      measureLayoutRelativeToParent: jest.fn(),
      getMoveToKeyboardBehavior: jest.fn(() => null),
    },
  };
});

// Mock Vibration to prevent renderer issues
jest.mock('react-native/Libraries/Vibration/Vibration', () => {
  const React = require('react');
  return {
    Vibration: {
      vibrate: jest.fn(),
      cancel: jest.fn(),
    },
  };
});

// Mock BackHandler to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/BackHandler', () => {
  const React = require('react');
  return {
    BackHandler: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      exitApp: jest.fn(),
    },
  };
});

// Mock Keyboard to prevent renderer issues
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => {
  const React = require('react');
  return {
    Keyboard: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      dismiss: jest.fn(),
      scheduleLayoutAnimation: jest.fn(),
    },
  };
});

// Mock PanResponder to prevent renderer issues
jest.mock('react-native/Libraries/Interaction/PanResponder', () => {
  const React = require('react');
  return {
    PanResponder: {
      create: jest.fn(() => ({
        panHandlers: {},
      })),
    },
  };
});

// Mock Animated to prevent renderer issues
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const React = require('react');
  const Animated = require('react-native').Animated;
  return {
    ...Animated,
    createAnimatedComponent: jest.fn((Component) => Component),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
    })),
    ValueXY: jest.fn(() => ({
      setValue: jest.fn(),
      setOffset: jest.fn(),
      flattenOffset: jest.fn(),
    })),
    spring: jest.fn(),
    timing: jest.fn(),
    decay: jest.fn(),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    event: jest.fn(),
    forkEvent: jest.fn(),
    unfold: jest.fn(),
    combine: jest.fn(),
    add: jest.fn(),
    subtract: jest.fn(),
    divide: jest.fn(),
    multiply: jest.fn(),
    modulo: jest.fn(),
    sqrt: jest.fn(),
    log: jest.fn(),
    sin: jest.fn(),
    cos: jest.fn(),
    tan: jest.fn(),
    pow: jest.fn(),
    exp: jest.fn(),
    round: jest.fn(),
    floor: jest.fn(),
    ceil: jest.fn(),
    diffClamp: jest.fn(),
    concat: jest.fn(),
    min: jest.fn(),
    max: jest.fn(),
    clamp: jest.fn(),
    interpolate: jest.fn(),
  };
});

// Mock Easing to prevent renderer issues
jest.mock('react-native/Libraries/Animated/Easing', () => {
  const React = require('react');
  return {
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
      poly: jest.fn(),
      sin: jest.fn(),
      circle: jest.fn(),
      exp: jest.fn(),
      elastic: jest.fn(),
      back: jest.fn(),
      bounce: jest.fn(),
      bezier: jest.fn(),
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
  };
});

// Mock LayoutAnimation to prevent renderer issues
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => {
  const React = require('react');
  return {
    LayoutAnimation: {
      configureNext: jest.fn(),
      create: jest.fn(),
      Types: {
        spring: 'spring',
        linear: 'linear',
        easeInEaseOut: 'easeInEaseOut',
        easeIn: 'easeIn',
        easeOut: 'easeOut',
        keyboard: 'keyboard',
      },
      Properties: {
        opacity: 'opacity',
        scaleX: 'scaleX',
        scaleY: 'scaleY',
        scaleXY: 'scaleXY',
        translateX: 'translateX',
        translateY: 'translateY',
        translateXY: 'translateXY',
      },
      Presets: {
        easeInEaseOut: {},
        linear: {},
        spring: {},
      },
    },
  };
});

// Mock InteractionManager to prevent renderer issues
jest.mock('react-native/Libraries/Interaction/InteractionManager', () => {
  const React = require('react');
  return {
    InteractionManager: {
      runAfterInteractions: jest.fn((callback) => callback()),
      createInteractionHandle: jest.fn(),
      clearInteractionHandle: jest.fn(),
      setDeadline: jest.fn(),
    },
  };
});

// Mock DeviceEventEmitter to prevent renderer issues
jest.mock('react-native/Libraries/EventEmitter/DeviceEventEmitter', () => {
  const React = require('react');
  return {
    DeviceEventEmitter: {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      emit: jest.fn(),
      removeSubscription: jest.fn(),
    },
  };
});

// Mock NativeEventEmitter to prevent renderer issues
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const React = require('react');
  return {
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      emit: jest.fn(),
      removeSubscription: jest.fn(),
    })),
  };
});

// Mock NativeModules to prevent renderer issues
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => {
  const React = require('react');
  return {
    NativeModules: {
      AlertManager: {
        alertWithArgs: jest.fn(),
      },
      AsyncLocalStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
    },
  };
});

// Mock StyleSheet to prevent renderer issues
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => {
  const React = require('react');
  const StyleSheet = require('react-native').StyleSheet;
  return {
    ...StyleSheet,
    create: jest.fn((styles) => styles),
  };
});

// Mock I18nManager to prevent renderer issues
jest.mock('react-native/Libraries/I18n/I18nManager', () => {
  const React = require('react');
  return {
    I18nManager: {
      isRTL: false,
      allowRTL: jest.fn(),
      forceRTL: jest.fn(),
      swapLeftAndRightInRTL: jest.fn(),
    },
  };
});

// Mock AccessibilityInfo to prevent renderer issues
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => {
  const React = require('react');
  return {
    AccessibilityInfo: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      announceForAccessibility: jest.fn(),
      setAccessibilityFocus: jest.fn(),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    },
  };
});

// Mock AppState to prevent renderer issues
jest.mock('react-native/Libraries/AppState/AppState', () => {
  const React = require('react');
  return {
    AppState: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      currentState: 'active',
    },
  };
});

// Mock Clipboard to prevent renderer issues
jest.mock('react-native/Libraries/Components/Clipboard/Clipboard', () => {
  const React = require('react');
  return {
    Clipboard: {
      getString: jest.fn(() => Promise.resolve('')),
      setString: jest.fn(),
    },
  };
});

// Mock Geolocation to prevent renderer issues
jest.mock('react-native/Libraries/Geolocation/Geolocation', () => {
  const React = require('react');
  return {
    Geolocation: {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn(),
      clearWatch: jest.fn(),
      stopObserving: jest.fn(),
    },
  };
});

// Mock NetInfo to prevent renderer issues
jest.mock('react-native/Libraries/NetInfo/NetInfo', () => {
  const React = require('react');
  return {
    NetInfo: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getConnectionInfo: jest.fn(() => Promise.resolve({ type: 'wifi', effectiveType: '4g' })),
      isConnected: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        fetch: jest.fn(() => Promise.resolve(true)),
      },
    },
  };
});

// Mock PermissionsAndroid to prevent renderer issues
jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => {
  const React = require('react');
  return {
    PermissionsAndroid: {
      request: jest.fn(() => Promise.resolve('granted')),
      requestMultiple: jest.fn(() => Promise.resolve({})),
      RESULTS: {
        GRANTED: 'granted',
        DENIED: 'denied',
        NEVER_ASK_AGAIN: 'never_ask_again',
      },
      PERMISSIONS: {
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
        CAMERA: 'android.permission.CAMERA',
        READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
        WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
      },
    },
  };
});

// Mock ToastAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/ToastAndroid/ToastAndroid', () => {
  const React = require('react');
  return {
    ToastAndroid: {
      show: jest.fn(),
      showWithGravity: jest.fn(),
      showWithGravityAndOffset: jest.fn(),
      SHORT: 0,
      LONG: 1,
      TOP: 1,
      BOTTOM: 0,
      CENTER: 2,
    },
  };
});

// Mock TimePickerAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/TimePickerAndroid/TimePickerAndroid', () => {
  const React = require('react');
  return {
    TimePickerAndroid: {
      open: jest.fn(() => Promise.resolve({ action: 'timeSetAction', hour: 12, minute: 0 })),
    },
  };
});

// Mock DatePickerAndroid to prevent renderer issues
jest.mock('react-native/Libraries/Components/DatePickerAndroid/DatePickerAndroid', () => {
  const React = require('react');
  return {
    DatePickerAndroid: {
      open: jest.fn(() => Promise.resolve({ action: 'dateSetAction', year: 2023, month: 0, day: 1 })),
    },
  };
});

// Mock Settings to prevent renderer issues
jest.mock('react-native/Libraries/Settings/Settings', () => {
  const React = require('react');
  return {
    Settings: {
      get: jest.fn(),
      set: jest.fn(),
      watchKeys: jest.fn(),
      clearWatch: jest.fn(),
    },
  };
});

// Mock Systrace to prevent renderer issues
jest.mock('react-native/Libraries/Systrace/Systrace', () => {
  const React = require('react');
  return {
    Systrace: {
      beginEvent: jest.fn(),
      endEvent: jest.fn(),
      beginAsyncEvent: jest.fn(),
      endAsyncEvent: jest.fn(),
      counterEvent: jest.fn(),
      attachToRelayProfiler: jest.fn(),
      swizzleJSON: jest.fn(),
      measureMethods: jest.fn(),
      measure: jest.fn(),
    },
  };
});

// Mock YellowBox to prevent renderer issues
jest.mock('react-native/Libraries/YellowBox/YellowBox', () => {
  const React = require('react');
  return {
    YellowBox: {
      ignoreWarnings: jest.fn(),
    },
  };
});

// Mock LogBox to prevent renderer issues
jest.mock('react-native/Libraries/LogBox/LogBox', () => {
  const React = require('react');
  return {
    LogBox: {
      ignoreLogs: jest.fn(),
      ignoreAllLogs: jest.fn(),
      uninstall: jest.fn(),
      install: jest.fn(),
    },
  };
});

// Mock DevSettings to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/DevSettings', () => {
  const React = require('react');
  return {
    DevSettings: {
      addMenuItem: jest.fn(),
      reload: jest.fn(),
      setHotLoadingEnabled: jest.fn(),
    },
  };
});

// Mock HMRClient to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/HMRClient', () => {
  const React = require('react');
  return {
    HMRClient: {
      enable: jest.fn(),
      disable: jest.fn(),
      registerBundle: jest.fn(),
      disableBundle: jest.fn(),
    },
  };
});

// Mock RCTEventEmitter to prevent renderer issues
jest.mock('react-native/Libraries/EventEmitter/RCTEventEmitter', () => {
  const React = require('react');
  return {
    RCTEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeListeners: jest.fn(),
      emit: jest.fn(),
      removeSubscription: jest.fn(),
    })),
  };
});

// Mock NativeComponentRegistry to prevent renderer issues
jest.mock('react-native/Libraries/NativeComponentRegistry/NativeComponentRegistry', () => {
  const React = require('react');
  return {
    NativeComponentRegistry: {
      register: jest.fn(),
      get: jest.fn(),
    },
  };
});

// Mock ReactNativeVersion to prevent renderer issues
jest.mock('react-native/Libraries/Core/ReactNativeVersion', () => {
  const React = require('react');
  return {
    ReactNativeVersion: {
      version: {
        major: 0,
        minor: 79,
        patch: 6,
        prerelease: null,
      },
      major: 0,
      minor: 79,
      patch: 6,
    },
  };
});

// Mock ReactNativeVersionCheck to prevent renderer issues
jest.mock('react-native/Libraries/Core/ReactNativeVersionCheck', () => {
  const React = require('react');
  return {
    ReactNativeVersionCheck: {
      checkVersions: jest.fn(),
    },
  };
});

// Mock TurboModuleRegistry to prevent renderer issues
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const React = require('react');
  return {
    TurboModuleRegistry: {
      get: jest.fn(),
      getEnforcing: jest.fn(),
    },
  };
});

// Mock JSDevSupport to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/JSDevSupport', () => {
  const React = require('react');
  return {
    JSDevSupport: {
      getJSRuntime: jest.fn(),
    },
  };
});

// Mock SourceCode to prevent renderer issues
jest.mock('react-native/Libraries/Core/SourceCode', () => {
  const React = require('react');
  return {
    SourceCode: {
      scriptURL: 'https://localhost:8081/index.bundle?platform=ios&dev=true&minify=false',
    },
  };
});

// Mock InfoLog to prevent renderer issues
jest.mock('react-native/Libraries/Utilities/InfoLog', () => {
  const React = require('react');
  return {
    InfoLog: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
});

// Mock PolyfillFunctions to prevent renderer issues
jest.mock('react-native/Libraries/Core/PolyfillFunctions', () => {
  const React = require('react');
  return {
    PolyfillFunctions: {
      install: jest.fn(),
    },
  };
});

// Mock ErrorUtils to prevent renderer issues
jest.mock('react-native/Libraries/Core/ErrorUtils', () => {
  const React = require('react');
  return {
    ErrorUtils: {
      setGlobalHandler: jest.fn(),
      getGlobalHandler: jest.fn(),
      reportFatalError: jest.fn(),
      reportError: jest.fn(),
    },
  };
});

// Mock BugReporting to prevent renderer issues
jest.mock('react-native/Libraries/BugReporting/BugReporting', () => {
  const React = require('react');
  return {
    BugReporting: {
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
  };
});

// Mock RCTBridge to prevent renderer issues
jest.mock('react-native/Libraries/BatchedBridge/RCTBridge', () => {
  const React = require('react');
  return {
    RCTBridge: {
      registerCallableModule: jest.fn(),
    },
  };
});

// Mock MessageQueue to prevent renderer issues
jest.mock('react-native/Libraries/BatchedBridge/MessageQueue', () => {
  const React = require('react');
  return {
    MessageQueue: {
      spy: jest.fn(),
      registerCallableModule: jest.fn(),
      registerLazyCallableModule: jest.fn(),
      registerComponent: jest.fn(),
      callFunctionReturnFlushedQueue: jest.fn(() => []),
    },
  };
});

// Mock BatchedBridge to prevent renderer issues
jest.mock('react-native/Libraries/BatchedBridge/BatchedBridge', () => {
  const React = require('react');
  return {
    BatchedBridge: {
      registerCallableModule: jest.fn(),
      registerLazyCallableModule: jest.fn(),
      registerComponent: jest.fn(),
      callFunctionReturnFlushedQueue: jest.fn(() => []),
      flushedQueue: jest.fn(() => []),
    },
  };
});

// Mock ReactNativeApp to prevent renderer issues
jest.mock('react-native/Libraries/Core/ReactNativeApp', () => {
  const React = require('react');
  return {
    ReactNativeApp: {
      registerComponent: jest.fn(),
      registerRunnable: jest.fn(),
      registerSection: jest.fn(),
    },
  };
});

// Mock ReactNativeHost to prevent renderer issues
jest.mock('react-native/Libraries/Core/ReactNativeHost', () => {
  const React = require('react');
  return {
    ReactNativeHost: {
      create: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-dev', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-prod', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-profiling to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-profiling', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-profiling-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-profiling-dev', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-profiling-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-profiling-prod', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test-dev', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test-prod', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test-profiling to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test-profiling', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test-profiling-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test-profiling-dev', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeFiber-test-profiling-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeFiber-test-profiling-prod', () => {
  const React = require('react');
  return {
    ReactNativeFiber: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer-dev', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer-prod', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer-profiling to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer-profiling', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer-profiling-dev to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer-profiling-dev', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock ReactNativeRenderer-profiling-prod to prevent renderer issues
jest.mock('react-native/Libraries/Renderer/ReactNativeRenderer-profiling-prod', () => {
  const React = require('react');
  return {
    ReactNativeRenderer: {
      render: jest.fn(),
      unmountComponentAtNode: jest.fn(),
      createContainer: jest.fn(),
      updateContainer: jest.fn(),
    },
  };
});

// Mock
