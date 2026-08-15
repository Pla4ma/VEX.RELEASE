/**
 * FocusLoadingGuard — loading / unauthenticated screen for active session.
 */
import React from 'react';
import { View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassScreen } from '../../../components/glass/GlassScreen';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusLoadingGuardProps {
  isAuthenticated: boolean;
}

export function FocusLoadingGuard({
  isAuthenticated,
}: FocusLoadingGuardProps): React.JSX.Element {
  return (
    <GlassScreen showAura variant="focus">
      <View
        style={{
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: spacing[5],
        }}
      >
        <GlassCard
          glowMint
          padding={spacing[6]}
          radius={28}
          style={{ alignItems: 'center', width: '100%' }}
          variant="premium"
        >
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 18,
              fontWeight: '800',
              letterSpacing: -0.2,
            }}
          >
            {isAuthenticated ? 'Loading your session…' : 'Sign in to continue'}
          </Text>
          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 14,
              fontWeight: '500',
              lineHeight: 20,
              marginTop: spacing[2],
              textAlign: 'center',
            }}
          >
            VEX is shaping the room.
          </Text>
        </GlassCard>
      </View>
    </GlassScreen>
  );
}
