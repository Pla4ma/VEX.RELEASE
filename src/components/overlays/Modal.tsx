import React, { useCallback, type ReactNode } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';
import { rgbaColors } from '@/theme/tokens/rgba-colors';
import { iosShadows } from '@/theme/tokens/shadows';
import { Box } from '../primitives/Box'
import { Text } from '../primitives/Text';
import { IconButton } from '../../icons/components/IconButton';
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
  accessibilityLabel?: string;
}

const backdropOverlayStyle: ViewStyle = {
  backgroundColor: rgbaColors.rgb_0_0_0_0_5,
};

const contentOverlayStyle: ViewStyle = {
  backgroundColor: '',
  borderRadius: 0,
};

export const Modal: React.ComponentType<ModalProps> = ({
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
  accessibilityLabel,
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
<TouchableWithoutFeedback
onPress={handleBackdropPress}
accessibilityLabel="Close modal backdrop"
accessibilityRole="button"
accessibilityHint="Closes the modal when backdrop closing is enabled"
>
        <Animated.View
          style={[
            styles.backdrop,
            backdropOverlayStyle,
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
        accessibilityLabel={accessibilityLabel ?? title ?? "Modal dialog"}
        accessibilityRole="alert"
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
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 },
  content: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    boxShadow: iosShadows.sm,
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
    borderTopColor: rgbaColors.rgb_0_0_0_0_1,
  },
});
