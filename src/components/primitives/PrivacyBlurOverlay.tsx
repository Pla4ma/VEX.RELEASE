import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

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
