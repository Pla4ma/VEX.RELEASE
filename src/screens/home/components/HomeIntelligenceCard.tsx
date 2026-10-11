import React from 'react';
import { Image, Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import { VexSurface } from '../../../shared/ui/vex/VexSurface';
import { useTheme } from '../../../theme/ThemeContext';
import { vexFire } from '../../../theme/tokens/vex-fire';
import type { HomeController } from '../hooks/home-controller-types';

const COACH_ARTIFACT = require('../../../../assets/vex/coach/coach-artifact.png');
const AI_STUDY_ATLAS = require('../../../../assets/vex/study/ai-study-atlas.png');

export function HomeIntelligenceCard({ controller }: { controller: HomeController }): React.JSX.Element {
  const { theme } = useTheme();
  const recommendation = controller.primaryRecommendation;
  const title = recommendation?.title ?? 'VEX is watching the signal';
  const body = recommendation?.reason ?? 'Ask for a plan, turn material into a study path, or let VEX choose the next clean move.';
  return (
    <VexSurface tone="quiet" style={{ marginBottom: theme.spacing[5], padding: theme.spacing[4] }}>
      <Image accessibilityIgnoresInvertColors accessibilityLabel="Abstract VEX intelligence atlas" resizeMode="cover" source={AI_STUDY_ATLAS} style={{ bottom: 0, opacity: 0.18, position: 'absolute', right: 0, top: 0, width: '54%' }} />
      <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing[3] }}>
        <Image accessibilityIgnoresInvertColors accessibilityLabel="VEX Coach artifact" resizeMode="contain" source={COACH_ARTIFACT} style={{ height: theme.spacing[12], width: theme.spacing[12] }} />
        <View style={{ flex: 1, gap: theme.spacing[1] }}>
          <Text color={vexFire.ember} variant="label">VEX INTELLIGENCE / ADAPTIVE BRIEF</Text>
          <Text color={vexFire.cream} numberOfLines={2} variant="bodyLarge">{title}</Text>
          <Text color={vexFire.textSecondary} numberOfLines={3} variant="caption">{body}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[3] }}>
        <Pressable accessibilityHint="Open the AI Coach conversation" accessibilityLabel="Ask VEX Coach" accessibilityRole="button" onPress={controller.openCoach} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.lg, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: theme.spacing[12], opacity: pressed ? 0.78 : 1 })}>
          <Text color={vexFire.amber} variant="button">Ask VEX</Text>
        </Pressable>
        <Pressable accessibilityHint="Open the study material importer" accessibilityLabel="Open study tools" accessibilityRole="button" onPress={controller.openContentStudy} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: theme.spacing[12], opacity: pressed ? 0.78 : 1 })}>
          <Text color={vexFire.textSecondary} variant="button">Feed VEX</Text>
        </Pressable>
      </View>
    </VexSurface>
  );
}
