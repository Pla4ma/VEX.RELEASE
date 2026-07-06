import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box'
import { Text } from '../../../components/primitives/Text';
import type { CompanionPhase } from '../types';
import { lightColors } from '@/theme/tokens/colors';

import { PHASE_NAMES, PHASE_EMOJIS } from './companion-evolution-types';
import type { EvolutionPhase, ElementThemeColors } from './companion-evolution-types';

export const GlowLayer: React.ComponentType<{
  glowStyle: ReturnType<typeof useAnimatedStyle>;
  themeColors: ElementThemeColors;
  ceremonyPhase: EvolutionPhase;
}> = ({ glowStyle, themeColors, ceremonyPhase }) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  return (
  <>
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: `${themeColors.glow}30`,
        },
        glowStyle,
      ]}
      pointerEvents="none"
    />
    {(ceremonyPhase === 'energy-buildup' || ceremonyPhase === 'flash') && (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: themeColors.glow,
          },
          glowStyle,
        ]}
        pointerEvents="none"
      />
    )}
  </>
  );
};

export const FlashLayer: React.ComponentType<{ flashStyle: ReturnType<typeof useAnimatedStyle> }> = ({
  flashStyle,
}) => (
  <Animated.View
    style={[
      {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: lightColors.text.inverse,
        zIndex: 50,
      },
      flashStyle,
    ]}
    pointerEvents="none"
  />
);

export const OldFormLayer: React.ComponentType<{
  oldFormStyle: ReturnType<typeof useAnimatedStyle>;
  themeColors: ElementThemeColors;
  previousPhase: CompanionPhase;
}> = ({ oldFormStyle, themeColors, previousPhase }) => (
  <Animated.View
    style={[oldFormStyle, { position: 'absolute', zIndex: 10 }]}
  >
    <Box alignItems="center">
      <Box
        width={160}
        height={160}
        borderRadius={80}
        bg={`${themeColors.primary}40`}
        justifyContent="center"
        alignItems="center"
        style={{
          borderWidth: 4,
          borderColor: themeColors.primary,
          boxShadow: '0px 0px 20px themeColors.glow / 0.8',
        }}
      >
        <Text fontSize={72}>{PHASE_EMOJIS[previousPhase]}</Text>
      </Box>
      <Text variant="h3" color={themeColors.primary} mt={4}>
        {PHASE_NAMES[previousPhase]}
      </Text>
    </Box>
  </Animated.View>
);

export const NewFormLayer: React.ComponentType<{
  newFormStyle: ReturnType<typeof useAnimatedStyle>;
  themeColors: ElementThemeColors;
  newPhase: CompanionPhase;
}> = ({ newFormStyle, themeColors, newPhase }) => (
  <Animated.View
    style={[newFormStyle, { position: 'absolute', zIndex: 20 }]}
  >
    <Box alignItems="center">
      <Box
        width={180}
        height={180}
        borderRadius={90}
        bg={`${themeColors.primary}50`}
        justifyContent="center"
        alignItems="center"
        style={{
          borderWidth: 6,
          borderColor: themeColors.glow,
          boxShadow: '0px 0px 30px themeColors.glow / 1',
        }}
      >
        <Text fontSize={80}>{PHASE_EMOJIS[newPhase]}</Text>
      </Box>
    </Box>
  </Animated.View>
);
