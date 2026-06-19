/**
 * Mobile Touch Target Wrapper
 * Ensures minimum 44x44 touch targets for accessibility
 */
import React from 'react';
import { View } from 'react-native';

interface TouchTargetProps {
  children: React.ReactNode;
  minSize?: number;
  onPress?: () => void;
}

export const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  minSize = 44,
  onPress: _onPress,
}) => {
  return (
    <View
      style={{
        minWidth: minSize,
        minHeight: minSize,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </View>
  );
};