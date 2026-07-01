import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { useToast } from '../../../shared/ui/components/ToastProvider';
import { spacing } from '../../../theme/tokens/spacing';
import { triggerHaptic } from '../../../utils/haptics';
import type { Day0Mode } from '../services/day0-agent-schemas';
import { Day0ActionGrid } from './Day0ActionGrid';
import { Day0ActionSheet } from './Day0ActionSheet';
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
      <Day0VexOsCard
        completedActions={completedActions}
        onStartSession={onStartSession}
      />
      <View style={{ marginBottom: spacing[4] }}>
        <Day0ActionGrid onOpenCoach={onOpenCoach} onSelect={handleSelect} />
      </View>
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
