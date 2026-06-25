import React from 'react';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';

let _BlurView: React.ComponentType<Record<string, unknown>> | null = null;
function getBlurView(): React.ComponentType<Record<string, unknown>> {
  if (_BlurView) return _BlurView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _BlurView = (require('expo-blur') as { BlurView: React.ComponentType<Record<string, unknown>> }).BlurView;
  } catch {
    _BlurView = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _BlurView;
}

export function PrivacyBlurOverlay(): React.JSX.Element | null {
  const [isBackgrounded, setIsBackgrounded] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsBackgrounded(nextState !== 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isBackgrounded) {
    return null;
  }

  const BlurView = getBlurView();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BlurView
        intensity={100}
        style={StyleSheet.absoluteFill}
        tint="light"
      />
    </View>
  );
}
