/**
 * Mobile Grid - Responsive grid for mobile layouts
 */
import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { getIsTablet } from './MobileOptimizedContainer.helpers';

interface MobileGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  columns = 2,
  gap = 12,
}) => {
  const { width } = useWindowDimensions();
  const isTablet = getIsTablet(width);
  // Adjust columns based on screen width
  const actualColumns = isTablet ? Math.min(columns + 1, 4) : columns;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        marginHorizontal: -gap / 2,
      }}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            width: `${100 / actualColumns}%`,
            paddingHorizontal: gap / 2,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};