import React from 'react';
import { Image, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { VexRouteShell } from '../../shared/ui/vex/VexRouteShell';
import { Text } from '../../components/primitives/Text';
import { vexFire } from '../../theme/tokens/vex-fire';
import { useTheme } from '../../theme/ThemeContext';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { navigateToMainStackScreen, navigateToMainTab, navigateToRootScreen } from '../../navigation/navigation-helpers';
import { GUIDE_CHAPTERS, GUIDE_DEPTH, type GuideAction, type GuideChapter } from './guide-data';
import { GuideChapterCard } from './components/GuideChapterCard';
import { GuideDepthShelf } from './components/GuideDepthShelf';

type Navigation = NativeStackNavigationProp<ExtendedRootStackParams>;
const GUIDE_ATLAS = require('../../../assets/vex/guides/vex-field-guide-atlas.png');

function VexFieldGuideScreen(): React.JSX.Element {
  const navigation = useNavigation<Navigation>();
  const { theme } = useTheme();

  const openAction = (action: GuideAction): void => {
    if (action === 'focus') {
      navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup', params: {} });
      return;
    }
    if (action === 'study') {
      navigateToMainStackScreen(navigation, 'ContentStudy');
      return;
    }
    if (action === 'coach') {
      navigateToMainStackScreen(navigation, 'AICoach');
      return;
    }
    if (action === 'companion') {
      navigateToMainStackScreen(navigation, 'CompanionDetail');
      return;
    }
    if (action === 'memory') {
      navigateToMainStackScreen(navigation, 'MemoryConsole');
      return;
    }
    if (action === 'challenges') {
      navigateToMainStackScreen(navigation, 'Challenges');
      return;
    }
    if (action === 'achievements') {
      navigateToRootScreen(navigation, 'Achievements');
      return;
    }
    navigateToMainTab(navigation, 'Progress');
  };

  const openDepthCard = (card: GuideChapter): void => openAction(card.action);

  return (
    <VexRouteShell atmosphere="utility" eyebrow="Orientation / VEX" title="The Field Guide" subtitle="A calm map of what VEX can do with you. Start anywhere; the system learns from the work you actually keep.">
      <Image accessibilityIgnoresInvertColors source={GUIDE_ATLAS} resizeMode="cover" style={{ borderRadius: theme.borderRadius.lg, height: theme.spacing[24] * 2, marginBottom: theme.spacing[5], width: '100%' }} />
      <View style={{ backgroundColor: vexFire.panelSoft, borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.lg, borderWidth: 1, marginBottom: theme.spacing[3], padding: theme.spacing[5] }}>
        <Text color={vexFire.ember} variant="label">THE VEX LOOP</Text>
        <Text color={vexFire.cream} variant="h3" style={{ marginTop: theme.spacing[2] }}>Choose → Focus → Reflect → Adapt</Text>
        <Text color={vexFire.textSecondary} variant="bodySmall" style={{ lineHeight: theme.typography.body.small.lineHeight, marginTop: theme.spacing[2] }}>You do not need to understand every layer before you begin. Each honest block gives VEX better evidence for the next one.</Text>
      </View>
      <View>
        {GUIDE_CHAPTERS.map((chapter) => <GuideChapterCard chapter={chapter} key={chapter.id} onPress={() => openAction(chapter.action)} />)}
      </View>
      <View style={{ marginTop: theme.spacing[5] }}>
        <Text color={vexFire.ember} variant="label">DEPTH ON DEMAND</Text>
        <Text color={vexFire.textSecondary} variant="bodySmall" style={{ marginBottom: theme.spacing[3], marginTop: theme.spacing[2] }}>The deeper systems are here when you want them. Nothing competes with the next block.</Text>
        <GuideDepthShelf cards={GUIDE_DEPTH} onPress={openDepthCard} />
      </View>
      <View style={{ borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, marginTop: theme.spacing[5], padding: theme.spacing[5] }}>
        <Text color={vexFire.amber} variant="label">DEPTH, NOT LOCKS</Text>
        <Text color={vexFire.cream} variant="h4" style={{ marginTop: theme.spacing[2] }}>The doors are visible from day one.</Text>
        <Text color={vexFire.textSecondary} variant="bodySmall" style={{ lineHeight: theme.typography.body.small.lineHeight, marginTop: theme.spacing[2] }}>Mastery, memory, companion growth, challenges, and momentum become more personal as your pattern becomes clearer.</Text>
      </View>
    </VexRouteShell>
  );
}

export const VexFieldGuideScreenWithBoundary = withScreenErrorBoundary(VexFieldGuideScreen, 'Guide');
export { VexFieldGuideScreen };
