import React from 'react';
import { SessionContractReminder } from './components/SessionContractReminder';
import { OfflineBanner } from './OfflineBanner';

import type { FocusContract } from '../../features/focus-contract/types';

interface SessionNoticesProps {
  isOffline: boolean;
  showContractReminder: boolean;
  contract: FocusContract | null;
  completionPercentage: number;
}

export function SessionNotices({
  isOffline,
  showContractReminder,
  contract,
  completionPercentage,
}: SessionNoticesProps): React.ReactNode {
  return (
    <>
      {isOffline ? <OfflineBanner /> : null}
      {showContractReminder ? (
        <SessionContractReminder
          contract={contract}
          progressPercentage={completionPercentage}
        />
      ) : null}
    </>
  );
}
