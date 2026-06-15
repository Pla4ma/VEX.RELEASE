import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export function CardHeader({
  children,
  action,
  style,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.ReactNode {
  return (
    <View
      style={[
        {
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>{children}</View>
      {action ? <View style={{ marginLeft: 8 }}>{action}</View> : null}
    </View>
  );
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}): React.ReactNode {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          borderTopColor: theme.colors.semantic.border,
          borderTopWidth: 1,
          paddingTop: 12,
          marginTop: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
