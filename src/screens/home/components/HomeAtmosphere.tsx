import React from 'react';

import { VexBackdrop } from '../../../shared/ui/vex/VexBackdrop';

// SAFETY: static generated art is bundled by Metro at build time.
const HOME_BACKGROUND = require('../../../../assets/vex/home-background.png');

export function HomeAtmosphere(): React.ReactNode {
  return <VexBackdrop source={HOME_BACKGROUND} />;
}
