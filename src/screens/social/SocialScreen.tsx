// DEPRECATED: Social features are disabled at launch
// This screen should not be accessible in navigation
// Re-enable only when social systems are fully implemented

import React from 'react';
import { Box, Text } from '../../components/primitives';
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';

export const SocialScreen: React.FC = () => {
  return (
    <LockedFeatureScreen
      title="Social Features"
      description="Connect with friends and compete in focus challenges"
      comingSoonText="Social features will be available in a future update"
      featureIcon="users"
    />
  );
};

export default SocialScreen;