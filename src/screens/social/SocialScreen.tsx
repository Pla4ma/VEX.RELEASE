/**
 * Social Screen (Disabled at Launch)
 *
 * Social features are disabled at launch. This screen renders a
 * simple "coming soon" placeholder so the route can compile if
 * it is referenced anywhere, but it is gated out of navigation.
 */

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
