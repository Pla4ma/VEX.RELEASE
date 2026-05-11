/**
 * Rivals Screen (Disabled at Launch)
 *
 * Rivals features are disabled at launch. This screen renders a
 * simple "coming soon" placeholder so the route can compile if
 * it is referenced anywhere, but it is gated out of navigation.
 */

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
