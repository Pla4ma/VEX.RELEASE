import React from 'react';
import { Box } from '@/components/primitives';
import type { Achievement } from '../types';
import { AchievementUnlockToast } from './AchievementUnlockToast.main';

export function useAchievementUnlockToast(
  userId: string,
  _onAchievementPress: (achievementId: string) => void,
): { currentToast: Achievement | null; dismissToast: () => void } {
  const [currentToast, setCurrentToast] = React.useState<Achievement | null>(
    null,
  );
  const toastQueue = React.useRef<Achievement[]>([]);
  const showNextToast = React.useCallback(() => {
    const nextAchievement = toastQueue.current.shift();
    if (nextAchievement) {
      setCurrentToast(nextAchievement);
    }
  }, []);
  React.useEffect(() => {
    const handleUnlock = (event: {
      userId: string;
      achievementId: string;
      unlockedAt: number;
    }) => {
      if (event.userId !== userId) {return;}
      const { getAchievementById } = require('../definitions');
      const achievement = getAchievementById(event.achievementId);
      if (!achievement) {return;}
      toastQueue.current.push(achievement);
      if (!currentToast) {showNextToast();}
    };
    return () => {};
  }, [userId, currentToast, showNextToast]);
  const dismissToast = React.useCallback(() => {
    setCurrentToast(null);
    setTimeout(() => {
      showNextToast();
    }, 300);
  }, [showNextToast]);
  return { currentToast, dismissToast };
}

interface AchievementToastProviderProps {
  children: React.ReactNode;
  userId: string;
  onAchievementPress: (achievementId: string) => void;
}

export const AchievementToastProvider: React.FC<
  AchievementToastProviderProps
> = ({ children, userId, onAchievementPress }) => {
  const { currentToast, dismissToast } = useAchievementUnlockToast(
    userId,
    onAchievementPress,
  );
  return (
    <Box flex={1}>
      {children}
      {currentToast && (
        <AchievementUnlockToast
          achievement={currentToast}
          onPress={() => onAchievementPress(currentToast.id)}
          onDismiss={dismissToast}
          visible={!!currentToast}
        />
      )}
    </Box>
  );
};
