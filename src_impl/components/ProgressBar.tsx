/**
 * ProgressBar Component
 *
 * Simple linear progress indicator.
 */

import React from 'react';
import { View } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

export interface ProgressBarProps {
  /** Progress value between 0 and 1 */
  progress: number;
  /** Track background color */
  backgroundColor?: string;
  /** Fill color */
  fillColor?: string;
  /** Height of the progress bar */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Custom container style */
  style?: object;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  backgroundColor = '#E0E0E0',
  fillColor = '#007AFF',
  height = 8,
  borderRadius = 4,
  style,
}) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor,
          borderRadius,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: fillColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = createSheet({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
