import React, { useState } from 'react';
import * as Sentry from '@sentry/react-native';
import type {
  StreakGamblePromptProps,
  GambleState,
  GambleOutcome,
} from './types';
import { GAMBLE_SUCCESS_GRADES, GAMBLE_BONUS_XP } from './types';
import { PromptView } from './PromptView';
import { GamblingView, WonView, LostView } from './OutcomeViews';

const StreakGamblePrompt: React.FC<StreakGamblePromptProps> = ({
  streakDays,
  hoursRemaining,
  shieldsAvailable,
  userLevel,
  onUseShield,
  onGamble,
  onDismiss,
  onSessionComplete,
}) => {
  const [gambleState, setGambleState] = useState<GambleState>('prompt');
  const [outcome, setOutcome] = useState<GambleOutcome | null>(null);

  const handleGamble = () => {
    setGambleState('gambling');
    onGamble();
  };

  const _handleSessionComplete = (grade: 'S' | 'A' | 'B' | 'C' | 'D') => {
    const success = GAMBLE_SUCCESS_GRADES.includes(grade);
    const newOutcome: GambleOutcome = {
      success,
      grade,
      xpEarned: success ? GAMBLE_BONUS_XP + userLevel * 2 : 0,
      shieldPreserved: success,
    };
    setOutcome(newOutcome);
    setGambleState(success ? 'won' : 'lost');
    Sentry.addBreadcrumb({
      category: 'streaks',
      message: `Streak gamble ${success ? 'WON' : 'LOST'}`,
      level: success ? 'info' : 'warning',
      data: { grade, streakDays, xpEarned: newOutcome.xpEarned },
    });
    onSessionComplete?.(grade);
  };

  if (gambleState === 'prompt') {
    return (
      <PromptView
        streakDays={streakDays}
        hoursRemaining={hoursRemaining}
        shieldsAvailable={shieldsAvailable}
        onUseShield={onUseShield}
        onGamble={handleGamble}
        onDismiss={onDismiss}
      />
    );
  }

  if (gambleState === 'gambling') {
    return <GamblingView streakDays={streakDays} />;
  }

  if (gambleState === 'won' && outcome) {
    return <WonView outcome={outcome} onDismiss={onDismiss} />;
  }

  if (gambleState === 'lost' && outcome) {
    return (
      <LostView
        outcome={outcome}
        streakDays={streakDays}
        onDismiss={onDismiss}
      />
    );
  }

  return null;
};

export default StreakGamblePrompt;
