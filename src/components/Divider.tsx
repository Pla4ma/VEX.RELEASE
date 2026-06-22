/**
 * Divider Component
 *
 * Horizontal or vertical divider for separating content.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import { lightColors } from '@/theme/tokens/colors';


export interface DividerProps {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Thickness of the divider */
  thickness?: number;
  /** Color of the divider */
  color?: string;
  /** Custom styles */
  style?: ViewStyle;
  /** Spacing before and after divider */
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = lightColors.surface.pressed,
  style,
  spacing = 16,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const dividerStyle = [
    styles.divider,
    isHorizontal
      ? { height: thickness, backgroundColor: color, marginVertical: spacing }
      : { width: thickness, backgroundColor: color, marginHorizontal: spacing },
    style,
  ];

  return <View style={dividerStyle} />;
};

const styles = createSheet({
  divider: {
    alignSelf: 'stretch',
  },
});

export { Divider }