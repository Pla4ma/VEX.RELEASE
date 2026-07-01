import { View } from 'react-native';

type NativeComponent = React.ComponentType<Record<string, unknown>>;

let blurView: NativeComponent | null = null;
let glassView: NativeComponent | null = null;
let glassContainer: NativeComponent | null = null;
let linearGradient: NativeComponent | null = null;
let callstackGlassView: NativeComponent | null = null;

export function getBlurView(): NativeComponent {
  if (blurView) return blurView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    blurView = (require('expo-blur') as { BlurView: NativeComponent }).BlurView;
  } catch {
    blurView = View as NativeComponent;
  }
  return blurView;
}

export function getGlassView(): NativeComponent {
  if (glassView) return glassView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    glassView = (
      require('expo-glass-effect') as { GlassView: NativeComponent }
    ).GlassView;
  } catch {
    glassView = View as NativeComponent;
  }
  return glassView;
}

export function getCallstackGlassView(): NativeComponent {
  if (callstackGlassView) return callstackGlassView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    callstackGlassView = (
      require('@callstack/liquid-glass') as { LiquidGlassView: NativeComponent }
    ).LiquidGlassView;
  } catch {
    callstackGlassView = null;
  }
  return callstackGlassView ?? getGlassView();
}

export function getGlassContainer(): NativeComponent {
  if (glassContainer) return glassContainer;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    glassContainer = (
      require('expo-glass-effect') as { GlassContainer: NativeComponent }
    ).GlassContainer;
  } catch {
    glassContainer = View as NativeComponent;
  }
  return glassContainer;
}

export function getLinearGradient(): NativeComponent {
  if (linearGradient) return linearGradient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    linearGradient = (
      require('expo-linear-gradient') as { LinearGradient: NativeComponent }
    ).LinearGradient;
  } catch {
    linearGradient = View as NativeComponent;
  }
  return linearGradient;
}
