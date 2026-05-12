/**
 * useSessionTimer Hook
 *
 * Timer display helper for active study sessions.
 */

import { useEffect, useState } from 'react';
import { useStudySession } from './useStudySession';

export function useSessionTimer() {
  const { currentSession, isActive, isPaused } = useStudySession();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const elapsedTime = currentSession?.elapsedTime ?? 0;
  const expectedDuration = currentSession?.config?.duration ?? 0;
  const timeRemaining = Math.max(0, expectedDuration - elapsedTime);

  return {
    currentTime,
    elapsedTime,
    timeRemaining,
    formattedTime: formatSeconds(elapsedTime),
    formattedRemaining: formatSeconds(timeRemaining),
  };
}

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
