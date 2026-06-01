import { useEffect, useRef } from 'react';

import { useToast } from '../../shared/ui/components/Toast';
import { triggerHaptic } from '../../utils/haptics';
import { trackMidSessionEvent } from './analytics';
import { evaluateMidSessionEvent } from './service';
import type { EvaluateMidSessionEventInput } from './schemas';

type UseMidSessionEventsInput = Omit<
  EvaluateMidSessionEventInput,
  'lastEventKey'
> & {
  enabled: boolean;
  sessionId: string;
};

export function useMidSessionEvents(input: UseMidSessionEventsInput): void {
  const { show } = useToast();
  const lastEventKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!input.enabled) {
      return;
    }

    const event = evaluateMidSessionEvent({
      bossHealthPercent: input.bossHealthPercent,
      bossTaunts: input.bossTaunts,
      elapsedSeconds: input.elapsedSeconds,
      isPaused: input.isPaused,
      lastEventKey: lastEventKeyRef.current,
      purityScore: input.purityScore,
      sessionDurationSeconds: input.sessionDurationSeconds,
    });

    if (!event) {
      return;
    }

    lastEventKeyRef.current = event.key;
    show({
      id: `${input.sessionId}:${event.key}`,
      type: event.toastType,
      title: event.title,
      message: event.message,
      duration: 4500,
      position: 'top',
      priority: event.toastType === 'warning' ? 'high' : 'normal',
    });
    trackMidSessionEvent(event);
    triggerHaptic(event.haptic);
  }, [
    input.bossHealthPercent,
    input.bossTaunts,
    input.elapsedSeconds,
    input.enabled,
    input.isPaused,
    input.purityScore,
    input.sessionDurationSeconds,
    input.sessionId,
    show,
  ]);
}
