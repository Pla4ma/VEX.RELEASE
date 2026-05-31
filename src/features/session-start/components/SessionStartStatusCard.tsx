import React from 'react';

import { Banner } from '../../../components/Banner';
import { Box } from '../../../components/primitives/Box';

type SessionStartStatusCardProps = {
  offlineMessage: string | null;
  routeWarningMessage: string | null;
  startErrorMessage: string | null;
  onDismissStartError: () => void;
};

export function SessionStartStatusCard({
  offlineMessage,
  routeWarningMessage,
  startErrorMessage,
  onDismissStartError,
}: SessionStartStatusCardProps): JSX.Element | null {
  if (!offlineMessage && !routeWarningMessage && !startErrorMessage) {
    return null;
  }

  return (
    <Box px="lg" mb="md" gap="sm">
      {offlineMessage ? (
        <Banner
          variant="warning"
          title="Offline mode"
          description={offlineMessage}
        />
      ) : null}

      {routeWarningMessage ? (
        <Banner
          variant="info"
          title="Fresh start applied"
          description={routeWarningMessage}
        />
      ) : null}

      {startErrorMessage ? (
        <Banner
          variant="error"
          title="Could not start session"
          description={startErrorMessage}
          secondaryActionText="Dismiss"
          onSecondaryAction={onDismissStartError}
        />
      ) : null}
    </Box>
  );
}

export default SessionStartStatusCard;
