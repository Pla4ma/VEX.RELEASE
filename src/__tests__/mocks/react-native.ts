const createHostComponent = (name: string) => name;

export const View = createHostComponent("View");
export const Text = createHostComponent("Text");
export const Pressable = createHostComponent("Pressable");
export const ScrollView = createHostComponent("ScrollView");
export const TouchableOpacity = createHostComponent("TouchableOpacity");
export const ActivityIndicator = createHostComponent("ActivityIndicator");
export const RefreshControl = createHostComponent("RefreshControl");
export const TextInput = createHostComponent("TextInput");
export const Image = createHostComponent("Image");
export const Switch = createHostComponent("Switch");
export const Modal = createHostComponent("Modal");

export const Alert = {
  alert: jest.fn(),
};

export const Share = {
  share: jest.fn(() => Promise.resolve({ action: "sharedAction" })),
};

export const StyleSheet = {
  create: <T>(styles: T) => styles,
  flatten: <T>(styles: T) => styles,
  hairlineWidth: 1,
  absoluteFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

export const Platform = {
  OS: "ios",
  Version: "test",
  select: (value: Record<string, unknown>) => value.ios ?? value.default,
};

export const Dimensions = {
  get: jest.fn(() => ({
    width: 390,
    height: 844,
    scale: 3,
    fontScale: 1,
  })),
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
};

export const PixelRatio = {
  get: jest.fn(() => 3),
  roundToNearestPixel: jest.fn((value: number) => value),
};

export const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  Value: class AnimatedValue {
    value: number;

    constructor(initial: number) {
      this.value = initial;
    }
  },
};

export const Easing = {
  linear: (value: number) => value,
};

export const NativeModules = {};
export const UIManager = {
  measure: jest.fn(),
  configureNextLayoutAnimation: jest.fn(),
};
export const LayoutAnimation = {
  configureNext: jest.fn(),
};
export const Keyboard = {
  dismiss: jest.fn(),
};
export const InteractionManager = {
  runAfterInteractions: jest.fn((callback?: () => void) => {
    callback?.();
    return { cancel: jest.fn() };
  }),
};
export const Linking = {
  openURL: jest.fn(),
};
export const AppState = {
  currentState: "active",
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
};

export const findNodeHandle = jest.fn();

const ReactNative = {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Switch,
  Modal,
  Alert,
  Share,
  StyleSheet,
  Platform,
  Dimensions,
  PixelRatio,
  Animated,
  Easing,
  NativeModules,
  UIManager,
  LayoutAnimation,
  Keyboard,
  InteractionManager,
  Linking,
  AppState,
  findNodeHandle,
};

export default ReactNative;
