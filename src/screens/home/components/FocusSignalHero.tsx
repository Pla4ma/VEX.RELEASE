import React from 'react';
import { Image, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import type { FocusScoreDashboardModel } from '../../../features/focus-identity/types';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

const FOCUS_BEACON = require('../../../../assets/vex/focus/focus-beacon.png');

interface FocusSignalHeroProps {
  model: FocusScoreDashboardModel;
}

export function FocusSignalHero({ model }: FocusSignalHeroProps): React.JSX.Element {
  const { theme } = useTheme();
  const score = model.current ? Math.round(model.current.currentScore / 10) : null;
  const delta = model.current
    ? Math.round((model.current.currentScore - model.current.previousScore) / 10)
    : 0;
  const status = model.isError ? 'SIGNAL PAUSED' : model.isPending ? 'CALIBRATING' : model.isOffline ? 'CACHED SIGNAL' : 'STABLE RHYTHM';

  return (
    <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius['2xl'], borderWidth: 1, minHeight: theme.spacing[24] + theme.spacing[16], overflow: 'hidden', padding: theme.spacing[5] }}>
      <View pointerEvents="none" style={{ backgroundColor: vexFire.ember, height: theme.spacing[1], left: theme.spacing[5], opacity: 0.88, position: 'absolute', right: theme.spacing[5], top: 0 }} />
      <Image accessibilityLabel="VEX focus beacon" accessibilityIgnoresInvertColors resizeMode="contain" source={FOCUS_BEACON} style={{ height: theme.spacing[24] + theme.spacing[16], opacity: 0.92, position: 'absolute', right: -theme.spacing[6], top: -theme.spacing[6], width: theme.spacing[24] + theme.spacing[20] }} />
      <View style={{ maxWidth: '62%', paddingTop: theme.spacing[3] }}>
        <Text color={vexFire.ember} variant="label" style={{ letterSpacing: 3 }}>FOCUS CONTROL</Text>
        <Text style={{ color: vexFire.cream, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.medium.fontSize, lineHeight: theme.typography.display.medium.lineHeight, marginTop: theme.spacing[3] }}>Set your intent.{`\n`}Protect your edge.</Text>
        <Text style={{ color: vexFire.textSecondary, fontSize: theme.typography.body.small.fontSize, lineHeight: theme.typography.body.small.lineHeight, marginTop: theme.spacing[4] }}>A clean block is waiting. Pick the pressure that fits the moment.</Text>
      </View>
      <View style={{ alignItems: 'flex-end', bottom: theme.spacing[5], position: 'absolute', right: theme.spacing[5] }}>
        <Text color={vexFire.amber} variant="label" style={{ letterSpacing: 2 }}>VEX CORE</Text>
        <Text style={{ color: vexFire.cream, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.large.fontSize, lineHeight: theme.typography.display.large.lineHeight }}>{score === null ? '—' : score}</Text>
        <Text color={model.isError ? vexFire.danger : vexFire.textSecondary} variant="caption" style={{ letterSpacing: 1.4 }}>{status}</Text>
        <Text color={delta >= 0 ? vexFire.amber : vexFire.danger} variant="caption" style={{ marginTop: theme.spacing[1] }}>{model.current ? `${delta >= 0 ? '+' : ''}${delta} today` : 'Build your first signal'}</Text>
      </View>
    </View>
  );
}
