/**
 * HomeStatusBanners Component
 *
 * Renders status banners for offline mode, sync states, and errors.
 */

import React from 'react';
import { StatusBanner } from '../../../shared/ui/components/StatusFeedback';
import type { CompletionSyncState } from '../../../store/session-state';

interface HomeStatusBannersProps {
  isOnline: boolean;
  completionSync: CompletionSyncState;
  loadError: Error | null;
  onRetry: () => void;
}

export function HomeStatusBanners({
  isOnline,
  completionSync,
  loadError,
  onRetry,
}: HomeStatusBannersProps): JSX.Element {
  return (
    <>
      {/* Offline banner */}
      {!isOnline ? (
        <StatusBanner
          status="offline"
          message="Offline mode is on"
          description="You can still start a session. VEX will sync your momentum when you reconnect."
        />
      ) : null}

      {/* Sync pending banner */}
      {completionSync.status === 'pending_sync' && completionSync.message ? (
        <StatusBanner
          status="offline"
          message="Session sync pending"
          description={completionSync.message}
        />
      ) : null}

      {/* Sync failed banner */}
      {completionSync.status === 'failed_sync' && completionSync.message ? (
        <StatusBanner
          status="error"
          message="Session rewards need repair"
          description={completionSync.message}
          onRetry={onRetry}
        />
      ) : null}

      {/* Load error banner */}
      {loadError ? (
        <StatusBanner
          status="error"
          message="Some sections are still syncing"
          description="Your progress is safe. Retrying will refresh the missing data."
          onRetry={onRetry}
        />
      ) : null}
    </>
  );
}
