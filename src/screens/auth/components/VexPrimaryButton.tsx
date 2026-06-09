import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { etherealButton } from '@/theme/tokens/ethereal-sky';
import { buttonTap } from '../../../utils/haptics';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { useButtonPressHandlers } from './VexPrimaryButton.hooks';

type VexActivationButtonProps = {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  onPress: () => void;
};

export function VexActivationButton({
  label,
  loadingLabel,
  isLoading,
  onPress,
}: VexActivationButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const { handlePressIn, handlePressOut } = useButtonPressHandlers(true);

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        accessibilityHint="Authenticates and opens your VEX workspace"
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading, disabled: isLoading }}
        disabled={isLoading}
        onPress={() => {
          buttonTap();
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          getMinTouchTargetStyle(),
          {
            borderRadius: 28,
            overflow: 'hidden',
            opacity: isLoading ? 0.82 : pressed ? 0.94 : 1,
          },
        ]}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: etherealButton.googleFill,
            borderColor: etherealButton.googleBorder,
            borderWidth: 1,
            justifyContent: 'center',
            minHeight: 56,
            minWidth: 296,
            paddingHorizontal: theme.spacing[6],
            shadowColor: etherealButton.buttonShadow,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.42,
            shadowRadius: 24,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              backgroundColor: etherealButton.appleBorder,
              borderRadius: 1,
              height: 1,
              left: 52,
              position: 'absolute',
              right: 52,
              top: 1,
            }}
          />
          <Text
            color={etherealButton.googleText}
            fontSize={16}
            fontWeight="700"
            letterSpacing={0.2}
            textAlign="center"
          >
            {isLoading ? loadingLabel : `${label}  \u2192`}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
