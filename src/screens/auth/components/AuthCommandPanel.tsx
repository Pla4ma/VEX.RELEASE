import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../../theme';
import { glassEdge } from '../../../theme/tokens/elevation';

interface AuthCommandPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AuthCommandPanel({ children, style }: AuthCommandPanelProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.semantic.surfaceGlass,
          borderRadius: theme.borderRadius['2xl'],
          padding: theme.spacing[5],
          gap: theme.spacing[4],
        },
        glassEdge,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default AuthCommandPanel;
