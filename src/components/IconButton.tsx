/**
 * IconButton Component
 *
 * Button with icon-only display for compact actions.
 */

import React from 'react';
import { Pressable, type ViewStyle, type PressableProps } from 'react-native';
import { Text } from './primitives/Text';
import { createSheet } from '@/shared/ui/create-sheet';
import { buttonTap } from '../utils/haptics';
import { lightColors } from '@/theme/tokens/colors';


export interface IconButtonProps extends PressableProps {
  /** Icon to display (emoji or text character) */
  icon: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'default' | 'primary' | 'ghost';
  /** Custom styles */
  style?: ViewStyle;
}

const SIZE_MAP = {
  sm: 32,
  md: 40,
  lg: 48,
};

const ICON_SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const IconButton: React.ComponentType<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  style,
  ...props
}) => {
  const buttonSize = SIZE_MAP[size];
  const iconSize = ICON_SIZE_MAP[size];

  const buttonStyle = [
    styles.button,
    { width: buttonSize, height: buttonSize },
    variant === 'primary' && styles.primary,
    variant === 'ghost' && styles.ghost,
    style,
  ];

  return (
    <Pressable
      style={({ pressed }) => [...buttonStyle, pressed && { opacity: 0.7 }]}
      onPress={(e) => { buttonTap(); props.onPress?.(e); }}
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? icon}
      accessibilityRole="button"
      accessibilityHint={props.accessibilityHint ?? `Activates ${icon} action`}
    >
      <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
    </Pressable>
  );
};

const styles = createSheet({
  button: {
    borderRadius: 8,
    backgroundColor: lightColors.surface.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: lightColors.semantic.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  icon: {
    textAlign: 'center',
  },
});
