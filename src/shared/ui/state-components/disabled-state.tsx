import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../theme';
import { styles } from './styles';
import type { DisabledStateProps } from './types';

export function DisabledState({
  reason,
  overlay = true,
  children,
  style,
  testID,
}: DisabledStateProps): JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={[styles.disabledContainer, style]} testID={testID}>
      {children}
      {overlay ? (
        <View
          style={[
            styles.disabledOverlay,
            { backgroundColor: theme.colors.background.overlay },
          ]}
        >
          {reason ? (
            <View
              style={[
                styles.disabledReasonContainer,
                { backgroundColor: theme.colors.background.tertiary },
              ]}
            >
              <Text
                style={[
                  styles.disabledReasonIcon,
                  { color: theme.colors.text.disabled },
                ]}
              >
                X
              </Text>
              <Text
                style={[
                  styles.disabledReasonText,
                  { color: theme.colors.text.disabled },
                ]}
              >
                {reason}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
