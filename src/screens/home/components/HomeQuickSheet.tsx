import React, { type ReactNode } from 'react';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Modal } from '../../../components/overlays/Modal';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import type { HomeSheet } from './HomeActionDock';

interface HomeQuickSheetProps {
  children: ReactNode;
  sheet: HomeSheet | null;
  onClose: () => void;
}

const titles: Record<HomeSheet, string> = {
  coach: 'AI Coach',
  progress: 'Progress',
  unlocks: 'Unlocks',
};

export function HomeQuickSheet({
  children,
  sheet,
  onClose,
}: HomeQuickSheetProps): React.ReactNode {
  return (
    <Modal
      accessibilityLabel={sheet ? `${titles[sheet]} sheet` : 'Home sheet'}
      animation="slide"
      contentStyle={{
        backgroundColor: 'transparent',
        padding: 0,
      }}
      onClose={onClose}
      showCloseButton
      title={sheet ? titles[sheet] : undefined}
      visible={sheet !== null}
    >
      <GlassCard
        glowMint
        padding={spacing[4]}
        radius={32}
        style={{ backgroundColor: vexLightGlass.glass.fillHero }}
        variant="premium"
      >
        {children}
      </GlassCard>
    </Modal>
  );
}
