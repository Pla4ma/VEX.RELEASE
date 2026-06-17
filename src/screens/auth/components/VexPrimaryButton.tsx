import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
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
            borderRadius: 32,
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
  minHeight: 62,
  minWidth: 296,
  paddingHorizontal: theme.spacing[6],
  boxShadow: '0px 12px 24px etherealButton.buttonShadow / 0.42',
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
