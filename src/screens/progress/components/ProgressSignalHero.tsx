import React from 'react';
import { Image, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import type { FocusScoreDashboardModel } from '../../../features/focus-identity/types';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

const SIGNAL_COMPASS = require('../../../../assets/vex/progress/signal-compass.png');

interface ProgressSignalHeroProps {
  model: FocusScoreDashboardModel;
  completedSessions: number;
}

export function ProgressSignalHero({ model, completedSessions }: ProgressSignalHeroProps): React.JSX.Element {
  const { theme } = useTheme();
  const score = model.current ? Math.round(model.current.currentScore / 10) : null;
  const delta = model.current ? Math.round((model.current.currentScore - model.current.previousScore) / 10) : 0;
  return (
    <View style={{ backgroundColor: vexFire.panel, borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius['2xl'], borderWidth: 1, minHeight: theme.spacing[24] + theme.spacing[16] + theme.spacing[8] + theme.spacing[12], overflow: 'hidden', padding: theme.spacing[5] }}>
      <Image accessibilityLabel="VEX signal compass" accessibilityIgnoresInvertColors resizeMode="contain" source={SIGNAL_COMPASS} style={{ height: theme.spacing[24] + theme.spacing[12], opacity: 0.86, position: 'absolute', right: -theme.spacing[4], top: -theme.spacing[4], width: theme.spacing[24] + theme.spacing[12] }} />
      <Text color={vexFire.ember} variant="label" style={{ letterSpacing: 3 }}>LIVE RECORD</Text>
      <Text style={{ color: vexFire.cream, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.heading.h3.fontSize, lineHeight: theme.typography.heading.h3.lineHeight, marginTop: theme.spacing[3], maxWidth: '50%' }}>Your attention{`\n`}leaves a trace.</Text>
      <View style={{ bottom: theme.spacing[5], left: theme.spacing[5], position: 'absolute' }}>
        <Text color={vexFire.textMuted} variant="caption" style={{ letterSpacing: 1.7 }}>FOCUS SCORE</Text>
        <Text style={{ color: vexFire.cream, fontFamily: theme.fonts.display ?? theme.fonts.primary, fontSize: theme.typography.display.large.fontSize, lineHeight: theme.typography.display.large.lineHeight }}>{score === null ? '—' : score}</Text>
        <Text color={delta >= 0 ? vexFire.amber : vexFire.danger} variant="caption">{model.isPending ? 'Calibrating signal' : `${delta >= 0 ? '+' : ''}${delta} from yesterday`}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', bottom: theme.spacing[5], position: 'absolute', right: theme.spacing[5] }}>
        <Text color={vexFire.amber} variant="label">{completedSessions}</Text>
        <Text color={vexFire.textSecondary} variant="caption">sessions logged</Text>
        <View style={{ backgroundColor: vexFire.line, height: 1, marginVertical: theme.spacing[2], width: theme.spacing[16] }} />
        <Text color={model.isOffline ? vexFire.amber : vexFire.textSecondary} variant="caption">{model.isOffline ? 'Cached record' : 'Syncing cleanly'}</Text>
      </View>
    </View>
  );
}
