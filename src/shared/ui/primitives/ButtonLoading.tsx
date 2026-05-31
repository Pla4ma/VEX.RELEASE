import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme';
import { overlayStyles as styles } from './loadingOverlay.styles';

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}

export function ButtonLoading({ loading, children }: ButtonLoadingProps) {
  const { theme } = useTheme();
  if (!loading) {
    return <>{children}</>;
  }
  return (
    <View style={styles.buttonLoading}>
      <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      <Text
        style={[
          styles.buttonLoadingText,
          { color: theme.colors.text.tertiary },
        ]}
      >
        Processing...
      </Text>
    </View>
  );
}
