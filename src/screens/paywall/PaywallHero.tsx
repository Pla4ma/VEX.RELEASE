import React from 'react';
import { View } from 'react-native';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import type { Theme } from '../../theme';
import {
  VALUE_PROPOSITION,
  type PaywallFeatureHighlight,
} from './paywall-copy';
import { LANE_PREMIUM_HERO_COPY, type PremiumLane } from './lane-hero-copy';
import { PaywallFeatureList, FreeBoundaryCard } from './PaywallFeatureList';
import { paywallStyles as styles } from './paywall-styles';
import {
  CleanLaneHero,
  DefaultHero,
  ProjectLaneHero,
} from './PaywallHero.defaults';
import { FeatureHighlightHero } from './PaywallHero.featureHighlight';
import { RunLaneHero, StudyLaneHero } from './PaywallHero.lanes';

type PaywallHeroProps = {
  contextBody?: string;
  contextHeadline?: string;
  featureHighlight: PaywallFeatureHighlight | undefined;
  isPremium: boolean;
  lane?: string;
  showBoundary: boolean;
  theme: Theme;
  onClose: () => void;
};

function resolveLane(lane?: string): PremiumLane | null {
  if (!lane) {return null;}
  const lower = lane.toLowerCase();
  if (lower.includes('study') || lower.includes('student')) {return 'study';}
  if (lower.includes('game') || lower.includes('run')) {return 'run';}
  if (lower.includes('deep') || lower.includes('creative') || lower.includes('project')) {return 'project';}
  if (lower.includes('minimal') || lower.includes('clean') || lower.includes('normal')) {return 'clean';}
  return null;
}

export function PaywallHero({
  contextBody,
  contextHeadline,
  featureHighlight,
  isPremium,
  lane,
  showBoundary,
  theme,
  onClose,
}: PaywallHeroProps): React.ReactNode {
  const premiumLane = resolveLane(lane);
  const laneCopy = premiumLane ? LANE_PREMIUM_HERO_COPY[premiumLane] : null;

  const heroHeadline =
    contextHeadline ??
    laneCopy?.headline ??
    'VEX remembers more. Adapts deeper.';
  const heroBody =
    contextBody ??
    laneCopy?.body ??
    'Free sessions, basic progress, and Rescue stay free forever. Premium adds memory, weekly intelligence, and mode-matched depth.';

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: theme.colors.primary[500] }]}>
            VEX Premium
          </Text>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {isPremium ? 'Premium is active' : VALUE_PROPOSITION}
          </Text>
        </View>
        <Button
          variant="ghost"
          onPress={onClose}
          accessibilityLabel="Close paywall"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen."
        >
          Close
        </Button>
      </View>

      {contextHeadline && contextBody ? (
        <DefaultHero body={contextBody} headline={contextHeadline} theme={theme} />
      ) : featureHighlight ? (
        <FeatureHighlightHero featureHighlight={featureHighlight} theme={theme} />
      ) : premiumLane === 'study' ? (
        <StudyLaneHero body={heroBody} headline={heroHeadline} theme={theme} />
      ) : premiumLane === 'run' ? (
        <RunLaneHero body={heroBody} headline={heroHeadline} theme={theme} />
      ) : premiumLane === 'project' ? (
        <ProjectLaneHero body={heroBody} headline={heroHeadline} theme={theme} />
      ) : premiumLane === 'clean' ? (
        <CleanLaneHero body={heroBody} headline={heroHeadline} theme={theme} />
      ) : (
        <DefaultHero body={heroBody} headline={heroHeadline} theme={theme} />
      )}

      {!featureHighlight ? <PaywallFeatureList theme={theme} /> : null}
      {showBoundary ? <FreeBoundaryCard theme={theme} /> : null}
    </>
  );
}
