import React from 'react';
import { View, ViewStyle, useWindowDimensions } from 'react-native';
import { styles } from './Toast.styles';
import { ToastComponent } from './ToastComponent';
import type { ToastPosition, ToastItem, ToastContainerProps } from './Toast.types';

const POSITIONS: ToastPosition[] = ['top', 'bottom', 'center'];

function getPositionStyle(position: ToastPosition, height: number): ViewStyle {
  switch (position) {
    case 'top':
      return { top: 60 };
    case 'center':
      return { top: height / 2 - 50 };
    case 'bottom':
    default:
      return { bottom: 100 };
  }
}

function groupToastsByPosition(
  toasts: ToastItem[],
): Partial<Record<ToastPosition, ToastItem[]>> {
  const grouped: Partial<Record<ToastPosition, ToastItem[]>> = {};
  for (const toast of toasts) {
    const pos = toast.position || 'bottom';
    if (!grouped[pos]) {
      grouped[pos] = [];
    }
    grouped[pos].push(toast);
  }
  return grouped;
}

export const ToastContainer: React.ComponentType<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  const { height } = useWindowDimensions();
  const grouped = groupToastsByPosition(toasts);
  const activePositions = POSITIONS.filter((p) => grouped[p] && (grouped[p]?.length ?? 0) > 0);

  return (
    <>
      {activePositions.map(
        (position) => (
          <View
            key={position}
            style={[
              styles.container,
              getPositionStyle(position, height),
              {
                zIndex:
                  9999 + (position === 'center' ? 2 : position === 'top' ? 1 : 0),
              },
            ]}
            pointerEvents="box-none"
          >
            {(grouped[position] ?? []).map((toast, index) => (
              <ToastComponent
                key={toast.id}
                toast={toast}
                onDismiss={onDismiss}
                index={index}
              />
            ))}
          </View>
        ),
      )}
    </>
  );
};
