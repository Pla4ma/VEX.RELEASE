import React from 'react';

import { VexBackdrop } from '../../../shared/ui/vex/VexBackdrop';
import { vexFire } from '../../../theme/tokens/vex-fire';

// SAFETY: static generated art is bundled by Metro at build time.
const HOME_BACKGROUND = require('../../../../assets/vex/home-background.png');

export function HomeAtmosphere(): React.ReactNode {
  return <VexBackdrop overlayColor={vexFire.background} source={HOME_BACKGROUND} />;
}
