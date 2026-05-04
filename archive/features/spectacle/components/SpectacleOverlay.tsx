/**
 * Spectacle Overlay
 *
 * Root component that renders active spectacle ceremonies.
 * Subscribes to spectacleService and displays the appropriate
 * ceremony component based on the current event type.
 *
 * @phase D - Polish Integration
 */

import React from 'react';
import { View, Modal } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';

import { useSpectacle } from '../hooks';
import { SpectacleType, type BossDefeatedPayload, type StreakMilestonePayload, type LevelUpPayload, type LootDropPayload, type PerfectSessionPayload, type SquadWarVictoryPayload, type MonthlyReportPayload, type WagerWonPayload } from '../types';
import { BossDefeatedCeremony } from './BossDefeatedCeremony';
import { StreakMilestoneCeremony } from './StreakMilestoneCeremony';
import { LevelUpOverlay } from './LevelUpOverlay';
import { RareLootDropCeremony } from './RareLootDropCeremony';
import { PerfectSessionBadge } from './PerfectSessionBadge';
import { SquadWarVictoryCeremony } from './SquadWarVictoryCeremony';
import { MonthlyReportCeremony } from './MonthlyReportCeremony';
import { WagerWonCeremony } from '../../economy/components/WagerWonCeremony';

interface SpectacleOverlayProps {
  /** Children to render behind the overlay */
  children: React.ReactNode;
}

/**
 * SpectacleOverlay - Root ceremony orchestrator
 *
 * Place this at the root of your app (inside NavigationContainer)
 * to enable spectacle ceremonies across all screens.
 */
export function SpectacleOverlay({ children }: SpectacleOverlayProps): JSX.Element {
  const { currentEvent, isPlaying, complete } = useSpectacle();

  // Render nothing if no spectacle is playing
  if (!isPlaying || !currentEvent) {
    return <>{children}</>;
  }

  // Render the appropriate ceremony based on event type
  const renderCeremony = () => {
    const { type, payload } = currentEvent;

    switch (type) {
      case SpectacleType.BOSS_DEFEATED:
        return (
          <BossDefeatedCeremony
            payload={payload as BossDefeatedPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.STREAK_MILESTONE:
        return (
          <StreakMilestoneCeremony
            payload={payload as StreakMilestonePayload}
            onComplete={complete}
          />
        );

      case SpectacleType.LEVEL_UP:
        return (
          <LevelUpOverlay
            payload={payload as LevelUpPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.RARE_LOOT_DROP:
      case SpectacleType.LEGENDARY_LOOT_DROP:
        return (
          <RareLootDropCeremony
            payload={payload as LootDropPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.PERFECT_SESSION:
        return (
          <PerfectSessionBadge
            payload={payload as PerfectSessionPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.SQUAD_WAR_WON:
        return (
          <SquadWarVictoryCeremony
            payload={payload as SquadWarVictoryPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.MONTHLY_REPORT:
        return (
          <MonthlyReportCeremony
            payload={payload as MonthlyReportPayload}
            onComplete={complete}
          />
        );

      case SpectacleType.WAGER_WON:
        return (
          <WagerWonCeremony
            amount={(payload as WagerWonPayload).amount}
            onComplete={complete}
            autoDismiss={true}
            dismissDelay={4000}
          />
        );

      default:
        // Unknown spectacle type - auto-complete
        complete();
        return null;
    }
  };

  return (
    <>
      {children}
      <Modal
        visible={isPlaying}
        transparent
        animationType="none"
        statusBarTranslucent
        presentationStyle="overFullScreen"
      >
        <View style={styles.overlay}>
          {renderCeremony()}
        </View>
      </Modal>
    </>
  );
}

const styles = createSheet({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});

export default SpectacleOverlay;
