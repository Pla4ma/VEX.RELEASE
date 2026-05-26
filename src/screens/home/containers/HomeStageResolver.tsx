import React, { useEffect, useState } from 'react';

import { markColdStart } from '../../../app/cold-start-performance';
import { captureException } from '../../../config/sentry';
import { useHomeViewModel } from '../hooks/useHomeViewModel';
import { HomeColdStartFallback } from './HomeColdStartFallback';

const NewUserStage = React.lazy(() => import('./NewUserStage'));
const ActivatingStage = React.lazy(() => import('./ActivatingStage'));
const EngagedStage = React.lazy(() => import('./EngagedStage'));
const PowerUserStage = React.lazy(() => import('./PowerUserStage'));

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

    void import('../../../features/liveops-config/deferred-feature-health')
      .then(({ startDeferredFeatureHealth }) => {
        if (cancelled) {
          return;
        }
        cleanup = startDeferredFeatureHealth(totalCompletedSessions);
      })
      .catch((error: unknown) => {
        const captured =
          error instanceof Error
            ? error
            : new Error('Deferred feature health failed to load');
        captureException(captured, { area: 'HomeStageResolver.featureHealth' });
      });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled, totalCompletedSessions]);
}

function HydratedHomeStageResolver(): JSX.Element {
  const vm = useHomeViewModel();
  const { sharedInput, stage, isLoading } = vm;

  useEffect(() => {
    if (!isLoading) {
      markColdStart('lane_hydrated', {
        totalCompletedSessions: sharedInput.disclosure.inputs.totalCompletedSessions,
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

  const fallback = <HomeColdStartFallback />;

  return (
    <React.Suspense fallback={fallback}>
      {stage === 'NEW_USER' ? (
        <NewUserStage sharedInput={sharedInput} />
      ) : stage === 'ACTIVATING' ? (
        <ActivatingStage sharedInput={sharedInput} />
      ) : stage === 'ENGAGED' ? (
        <EngagedStage sharedInput={sharedInput} />
      ) : (
        <PowerUserStage sharedInput={sharedInput} />
      )}
    </React.Suspense>
  );
}

export function HomeStageResolver(): JSX.Element {
  const canHydrate = useHydrationGate();

  if (!canHydrate) {
    return <HomeColdStartFallback />;
  }

  return <HydratedHomeStageResolver />;
}
