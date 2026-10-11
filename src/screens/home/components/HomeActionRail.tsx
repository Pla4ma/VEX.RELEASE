import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';

const COACH_ARTIFACT = require('../../../../assets/vex/coach/coach-artifact.png');
const STUDY_RELIC = require('../../../../assets/vex/home/study-relic.png');
const PROGRESS_INSTRUMENT = require('../../../../assets/vex/home/progress-instrument.png');
const REFLECTION_RELIC = require('../../../../assets/vex/home/reflection-relic.png');

interface HomeActionRailProps {
  onCoach: () => void;
  onStudy: () => void;
  onProgress: () => void;
  onHistory: () => void;
}

const actions = [
  { id: 'coach', label: 'Coach', asset: COACH_ARTIFACT },
  { id: 'study', label: 'Study', asset: STUDY_RELIC },
  { id: 'progress', label: 'Signal', asset: PROGRESS_INSTRUMENT },
  { id: 'history', label: 'Record', asset: REFLECTION_RELIC },
] as const;

export function HomeActionRail({ onCoach, onStudy, onProgress, onHistory }: HomeActionRailProps): React.JSX.Element {
  const { theme } = useTheme();
  const handlers = { coach: onCoach, study: onStudy, progress: onProgress, history: onHistory };
  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
      {actions.map((action) => (
        <Pressable
          accessibilityHint={`Opens ${action.label.toLowerCase()}`}
          accessibilityLabel={action.label}
          accessibilityRole="button"
          key={action.id}
          onPress={handlers[action.id]}
          style={({ pressed }) => ({ alignItems: 'center', backgroundColor: pressed ? vexFire.backgroundSoft : vexFire.panelSoft, borderColor: vexFire.border, borderRadius: theme.borderRadius.xl, borderWidth: 1, flex: 1, minHeight: theme.spacing[20], opacity: pressed ? 0.78 : 1, paddingHorizontal: theme.spacing[1], paddingVertical: theme.spacing[3], ...getMinTouchTargetStyle() })}
        >
          <Image accessibilityIgnoresInvertColors source={action.asset} resizeMode="contain" style={{ height: theme.spacing[10], width: theme.spacing[10] }} />
          <Text color={vexFire.textSecondary} variant="label" style={{ letterSpacing: 1.2, marginTop: theme.spacing[2], textAlign: 'center' }}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
