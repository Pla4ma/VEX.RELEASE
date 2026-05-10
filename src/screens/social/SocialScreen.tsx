// DEPRECATED: Social features are disabled at launch
// This screen should not be accessible in navigation
// Re-enable only when social systems are fully implemented

import React from 'react';
import { LockedFeatureScreen } from '../../components/LockedFeatureScreen';

export const SocialScreen: React.FC = () => {
  return (
    <LockedFeatureScreen
      feature="social_tab"
      stage="ENGAGED"
      title="Social Features"
      description="Connect with friends and compete in focus challenges"
      whyItMatters="Social features will be available in a future update."
      unlockLabel="Coming soon"
      ctaLabel="Back to focus"
      icon="users"
      onPress={() => undefined}
    />
  );
};

export default SocialScreen;
