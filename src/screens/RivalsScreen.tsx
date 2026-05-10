// DEPRECATED: Rivals features are disabled at launch
// This screen should not be accessible in navigation
// Re-enable only when rivals systems are fully implemented

import React from 'react';
import { LockedFeatureScreen } from '../components/LockedFeatureScreen';

export const RivalsScreen: React.FC = () => {
  return (
    <LockedFeatureScreen
      feature="rivals"
      stage="ENGAGED"
      title="Rivals"
      description="Challenge opponents and climb the rankings"
      whyItMatters="Rivals features will be available in a future update."
      unlockLabel="Coming soon"
      ctaLabel="Back to focus"
      icon="swords"
      onPress={() => undefined}
    />
  );
};

export default RivalsScreen;
