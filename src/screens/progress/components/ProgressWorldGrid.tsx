import React from 'react';
import { Image, Pressable, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { useTheme } from '../../../theme/ThemeContext';
import { navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import type { ExtendedRootStackParams, MainStackRoute } from '../../../navigation/types';
import { canNavigateToRegisteredRoute } from '../../../navigation/feature-route-registry';
import { useFeatureAccess } from '../../../features/liveops-config';

type WorldNavigation = NativeStackNavigationProp<ExtendedRootStackParams>;

type WorldNode = {
  asset: number;
  description: string;
  label: string;
  route: MainStackRoute;
};

const WORLD_NODES: readonly WorldNode[] = [
  { asset: require('../../../../assets/vex/coach/coach-artifact.png'), description: 'Ask, plan, recover, and decide.', label: 'AI Coach', route: 'AICoach' },
  { asset: require('../../../../assets/vex/study/library-codex.png'), description: 'Turn your material into a study path.', label: 'Study Library', route: 'ContentStudy' },
  { asset: require('../../../../assets/vex/utility/companion-portal.png'), description: 'See what your focus is growing.', label: 'Companion', route: 'CompanionDetail' },
  { asset: require('../../../../assets/vex/utility/challenge-badge.png'), description: 'One concrete action for today.', label: 'Challenges', route: 'Challenges' },
  { asset: require('../../../../assets/vex/home/daily-ritual-seal.png'), description: 'A living target for your next run.', label: 'Boss Board', route: 'Boss' },
  { asset: require('../../../../assets/vex/utility/mastery-crown.png'), description: 'Techniques you are building over time.', label: 'Mastery', route: 'Mastery' },
  { asset: require('../../../../assets/vex/profile-focus-emblem.png'), description: 'What VEX remembers and why.', label: 'Memory', route: 'MemoryConsole' },
  { asset: require('../../../../assets/vex/analytics/analytics-lens.png'), description: 'Patterns, reports, and your focus signal.', label: 'Intelligence', route: 'Analytics' },
];

export function ProgressWorldGrid({ navigation }: { navigation: WorldNavigation }): React.JSX.Element {
  const { theme } = useTheme();
  const { features } = useFeatureAccess();
  return (
    <BoxSection title="VEX world" subtitle="Every system is here from day one. Depth grows with use.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3] }}>
        {WORLD_NODES.map((node) => (
          (() => {
            const canNavigate = canNavigateToRegisteredRoute(features, node.route);
            return <Pressable
            accessibilityHint={canNavigate ? `Opens ${node.label}` : `${node.label} is visible, but unlocks as your rhythm grows`}
            accessibilityLabel={node.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canNavigate }}
            key={node.route}
            onPress={canNavigate ? () => navigateToMainStackScreen(navigation, node.route) : undefined}
            style={({ pressed }) => ({ flexBasis: '47%', flexGrow: 1, minHeight: theme.spacing[24], opacity: pressed ? 0.78 : canNavigate ? 1 : theme.opacity[60] })}
          >
            <VexSurface tone="quiet" style={{ flex: 1, minHeight: theme.spacing[24], padding: theme.spacing[3] }}>
              <Image accessibilityIgnoresInvertColors accessibilityLabel={`${node.label} artifact`} resizeMode="contain" source={node.asset} style={{ height: theme.spacing[10], width: theme.spacing[10] }} />
              <Text color={vexFire.cream} numberOfLines={1} variant="label">{node.label}</Text>
              <Text color={vexFire.textMuted} numberOfLines={2} variant="caption">{canNavigate ? node.description : 'Visible now · unlock depth as you return.'}</Text>
            </VexSurface>
          </Pressable>
          })()
        ))}
      </View>
    </BoxSection>
  );
}

function BoxSection({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ gap: theme.spacing[2], marginTop: theme.spacing[5] }}>
      <Text color={vexFire.cream} variant="h4">{title}</Text>
      <Text color={vexFire.textSecondary} variant="caption">{subtitle}</Text>
      {children}
    </View>
  );
}
