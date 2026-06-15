import React, { useEffect, useState } from 'react';

import { markColdStart } from '../../../app/cold-start-performance';
import { captureException } from '../../../config/sentry';
import { startDeferredFeatureHealth } from '../../../features/liveops-config/deferred-feature-health';
import { useHomeViewModel } from '../hooks/useHomeViewModel';
import { ActivatingStage } from './ActivatingStage';
import { EngagedStage } from './EngagedStage';
import { HomeColdStartFallback } from './HomeColdStartFallback';
import { NewUserStage } from './NewUserStage';
import { PowerUserStage } from './PowerUserStage';

function useHydrationGate(): boolean {
  const [canHydrate, setCanHydrate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanHydrate(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return canHydrate;
}

function useDeferredFeatureHealth(
  enabled: boolean,
  totalCompletedSessions: number,
): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    try {
      cleanup = startDeferredFeatureHealth(totalCompletedSessions);
    } catch (error: unknown) {
      const captured =
        error instanceof Error
          ? error
          : new Error('Deferred feature health failed to start');
      captureException(captured, { area: 'HomeStageResolver.featureHealth' });
    }

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled, totalCompletedSessions]);
}

function HydratedHomeStageResolver(): React.ReactNode {
  const vm = useHomeViewModel();
  const { sharedInput, stage, isLoading } = vm;

  useEffect(() => {
    if (!isLoading) {
      markColdStart('lane_hydrated', {
        totalCompletedSessions:
          sharedInput.disclosure.inputs.totalCompletedSessions,
      });
    }
  }, [isLoading, sharedInput.disclosure.inputs.totalCompletedSessions]);

  useDeferredFeatureHealth(
    !isLoading,
    sharedInput.disclosure.inputs.totalCompletedSessions,
  );

  if (isLoading) {
    return <HomeColdStartFallback />;
  }

  return (
    <>
      {stage === 'NEW_USER' ? (
        <NewUserStage sharedInput={sharedInput} />
      ) : stage === 'ACTIVATING' ? (
        <ActivatingStage sharedInput={sharedInput} />
      ) : stage === 'ENGAGED' ? (
        <EngagedStage sharedInput={sharedInput} />
      ) : (
        <PowerUserStage sharedInput={sharedInput} />
      )}
    </>
  );
}

export function HomeStageResolver(): React.ReactNode {
  const canHydrate = useHydrationGate();

  if (!canHydrate) {
    return <HomeColdStartFallback />;
  }

  return <HydratedHomeStageResolver />;
}
