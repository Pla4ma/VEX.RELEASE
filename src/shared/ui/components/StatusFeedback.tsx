import React from 'react';
import { InlineStatus } from './InlineStatus';
import { StatusBanner } from './StatusBanner';
import { CardStatusOverlay } from './CardStatusOverlay';
import type { StatusFeedbackProps } from './StatusFeedback.types';

export { InlineStatus }
export { StatusBanner }
export { CardStatusOverlay }
export type { AsyncStatus, StatusFeedbackProps } from './StatusFeedback.types';

export const StatusFeedback: React.ComponentType<StatusFeedbackProps> = (props) => {
  switch (props.variant) {
    case 'inline':
      return (
        <InlineStatus
          status={props.status}
          message={props.message}
          style={props.style}
        />
      );
    case 'banner':
      return <StatusBanner {...props} />;
    case 'card':
      return (
        <CardStatusOverlay
          status={props.status}
          message={props.message}
          onRetry={props.onRetry}
          style={props.style}
        />
      );
    default:
      return <StatusBanner {...props} />;
  }
};
