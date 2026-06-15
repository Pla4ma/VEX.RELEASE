import React from 'react';
import { View, ActivityIndicator, type ViewStyle } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import {
  type AsyncStatus,
  STATUS_CONFIG,
  getStatusColor,
} from './StatusFeedback.types';

export const InlineStatus: React.FC<{
  status: AsyncStatus;
  message?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}> = ({ status, message, size = 'sm', style }) => {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const color = getStatusColor(status, theme);

  if (status === 'idle') {
    return null;
  }

  const sizeStyles = size === 'sm' ? { fontSize: 12 } : { fontSize: 14 };

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[1] },
        style,
      ]}
    >
      {status === 'loading' || status === 'retrying' ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={[{ color, fontWeight: '700' }, sizeStyles]}>
          {config.icon}
        </Text>
      )}
      {message && (
        <Text
          variant={size === 'sm' ? 'caption' : 'bodySmall'}
          color={
            status === 'error'
              ? theme.colors.error.DEFAULT
              : theme.colors.text.secondary
          }
        >
          {message}
        </Text>
      )}
    </View>
  );
};
