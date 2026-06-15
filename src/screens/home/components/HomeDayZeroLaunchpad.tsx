import React, { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { useToast } from '../../../shared/ui/components/ToastProvider';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { triggerHaptic } from '../../../utils/haptics';
import { ReferenceCard } from '../../reference-ui/ReferenceCard';
import { type } from '../../reference-ui/referenceTokens';
import type { Day0Mode } from '../services/day0-agent-schemas';
import { Day0ActionGrid } from './Day0ActionGrid';
import { Day0ActionSheet } from './Day0ActionSheet';
import { Day0Mascot } from './Day0Mascot';
import { Day0VexOsCard } from './Day0VexOsCard';

interface HomeDayZeroLaunchpadProps {
  onStartSession: () => void;
  onOpenCoach: () => void;
  userId: string;
}

export function HomeDayZeroLaunchpad({
  onStartSession,
  onOpenCoach,
  userId,
}: HomeDayZeroLaunchpadProps): React.ReactNode {
  const { show: showToast } = useToast();
  const [activeMode, setActiveMode] = useState<Day0Mode | null>(null);
  const [completedActions, setCompletedActions] = useState(0);

  const handleSelect = useCallback(
    (mode: Day0Mode): void => {
      triggerHaptic('impactLight');
      if (mode === 'focus') {
        onStartSession();
        return;
      }
      setActiveMode(mode);
    },
    [onStartSession],
  );

  const handleSaved = useCallback((): void => {
    setCompletedActions((current) => Math.min(4, current + 1));
  }, []);

  return (
    <>
      <Day0VexOsCard completedActions={completedActions} />
      <Day0ActionGrid onSelect={handleSelect} />

      <Pressable
        accessibilityHint="Opens the VEX coach to calibrate your first day"
        accessibilityLabel="Meet VEX Anchor"
        accessibilityRole="button"
        onPress={onOpenCoach}
        style={({ pressed }) => ({
          opacity: pressed ? 0.86 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        })}
      >
        <ReferenceCard showAsset={false}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: spacing[3] }}>
            <Day0Mascot size={72} />
            <View style={{ flex: 1 }}>
              <Text style={type.kicker}>VEX ANCHOR</Text>
              <Text style={[type.title, { marginTop: spacing[1] }]}>
                Meet the agent before you focus.
              </Text>
              <Text style={[type.body, { marginTop: spacing[1] }]}>
                Tell VEX how today feels. It can coach, plan, or just hold the thread.
              </Text>
            </View>
            <Icon
              color={vexLightGlass.semantic.fireDeep}
              name="arrowRight"
              size="sm"
            />
          </View>
        </ReferenceCard>
      </Pressable>

      <Day0ActionSheet
        mode={activeMode}
        onClose={(): void => setActiveMode(null)}
        onSaved={handleSaved}
        showToast={showToast}
        userId={userId}
      />
    </>
  );
}
