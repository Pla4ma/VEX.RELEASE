// DEPRECATED: Rivals features are disabled at launch
// This screen should not be accessible in navigation
// Re-enable only when rivals systems are fully implemented

import React from 'react';
import { Box, Text } from '../../components/primitives';
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';

export const RivalsScreen: React.FC = () => {
  return (
    <LockedFeatureScreen
      title="Rivals"
      description="Challenge opponents and climb the rankings"
      comingSoonText="Rivals features will be available in a future update"
      featureIcon="swords"
    />
  );
};

export default RivalsScreen;