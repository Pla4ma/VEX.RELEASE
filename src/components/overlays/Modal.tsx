import React, { useCallback, type ReactNode } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme';
import { Box, Text } from '../primitives';
import { IconButton } from '../../icons';
import { createSheet } from '@/shared/ui/create-sheet';

import { useModalAnimation } from './useModalAnimation';

export interface ModalProps {
  visible: boolean;
  children: ReactNode;
  title?: string;
  onClose: () => void;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  children,
  title,
  onClose,
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  header,
  footer,
  animation = 'slide',
  style,
  contentStyle,
  testID,
}) => {
  const { theme } = useTheme();
  const { backdropStyle, contentAnimatedStyle } = useModalAnimation({
    visible,
    animation,
    onClose,
    closeOnBackButton,
  });

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdropPress) {
      onClose();
    }
  }, [closeOnBackdropPress, onClose]);

  const handleClosePress = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.backdrop,
            { backgroundColor: 'rgba(0,0,0,0.5)' },
            backdropStyle,
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background.primary,
            borderRadius: theme.borderRadius.lg,
          },
          contentAnimatedStyle,
          style,
          contentStyle,
        ]}
      >
        {(title || showCloseButton || header) && (
          <View style={styles.header}>
            {header || (
              <>
                <Box flex={1}>{title && <Text variant="h3">{title}</Text>}</Box>
                {showCloseButton && (
                  <IconButton
                    name="close"
                    size="md"
                    onPress={handleClosePress}
                    testID={`${testID}-close`}
                  />
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.body}>{children}</View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </Animated.View>
    </View>
  );
};

const styles = createSheet({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: { ...StyleSheet.absoluteFill },
  content: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.25)',
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  body: { padding: 16 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});

export default Modal;
