import React from 'react';
import { View, type ViewStyle } from 'react-native';

type BackgroundIntensity = 'auth' | 'form' | 'question' | 'confirm' | 'login' | 'register';

const INTENSITY_MAP: Record<BackgroundIntensity, number> = {
  auth: 0.35,
  form: 0.55,
  question: 0.48,
  confirm: 0.42,
  login: 0.38,
  register: 0.52,
};

type BackgroundScrimProps = {
  intensity: BackgroundIntensity;
  style?: ViewStyle;
};

export function BackgroundScrim({ intensity, style }: BackgroundScrimProps): React.JSX.Element {
  const opacity = INTENSITY_MAP[intensity] ?? 0.4;
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(247, 255, 252, ${opacity})`,
        },
        style,
      ]}
    />
  );
}
