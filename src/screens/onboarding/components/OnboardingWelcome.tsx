import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { etherealButton, etherealText } from '../../../theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { EtherealSkyBackground } from '../../auth/components/ethereal/EtherealSkyBackground';
import { LockGlyph, PrivacyShieldGlyph } from '../../auth/components/ethereal/AuthGlyphs';
import { LoginHero } from '../../auth/components/ethereal/LoginHero';
import { MascotGuide } from './ethereal/MascotGuide';

interface OnboardingWelcomeProps {
  onContinue: () => void;
}

function StartButton({ onContinue }: OnboardingWelcomeProps): React.ReactNode {
  return (
    <Pressable
      accessibilityHint="Starts the onboarding flow"
      accessibilityLabel="Start VEX onboarding"
      accessibilityRole="button"
      onPress={onContinue}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        {
          alignItems: 'center',
          backgroundColor: etherealButton.googleFill,
          borderColor: etherealButton.googleBorder,
          borderRadius: 28,
          borderWidth: 1,
          flexDirection: 'row',
          height: 56,
          justifyContent: 'center',
          opacity: pressed ? 0.94 : 1,
          paddingHorizontal: 28,
          shadowColor: etherealButton.buttonShadow,
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.5,
          shadowRadius: 28,
          width: '100%',
        },
      ]}
    >
      <Text fontSize={17} fontWeight="700" style={{ color: etherealButton.googleText }}>
        Begin your focus system
      </Text>
      <Text
        fontSize={28}
        fontWeight="400"
        style={{ color: etherealButton.googleText, position: 'absolute', right: 30 }}
      >
        {'\u2192'}
      </Text>
    </Pressable>
  );
}

export function OnboardingWelcome({
  onContinue,
}: OnboardingWelcomeProps): React.ReactNode {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <EtherealSkyBackground />
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'flex-end',
          paddingBottom: insets.bottom + 22,
          paddingHorizontal: theme.spacing[5],
          paddingTop: insets.top + 8,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 12 }}>
          <LoginHero startDelayMs={0} />
        </View>
        <View style={{ alignItems: 'center', gap: 18, width: '100%', maxWidth: 296 }}>
          <MascotGuide
            body="I will guide the first setup, keep it short, and stay out of your way once focus starts."
            compact
            title="Meet your VEX guide."
          />
          <Text
            fontSize={17}
            fontWeight="600"
            style={{ color: etherealText.subtitle, lineHeight: 24 }}
            textAlign="center"
          >
            VEX adapts the first focused block to your rhythm, pressure, and momentum.
          </Text>
          <StartButton onContinue={onContinue} />
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 18 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <PrivacyShieldGlyph color={etherealText.body} />
              <Text fontSize={13} fontWeight="600" style={{ color: etherealText.body }}>
                Your focus. Your data.
              </Text>
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <LockGlyph color={etherealText.body} />
              <Text fontSize={13} fontWeight="600" style={{ color: etherealText.body }}>
                Private by design.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
