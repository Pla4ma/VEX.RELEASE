import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { useTheme } from '../../../theme/ThemeContext';
import type { GuideChapter } from '../guide-data';

interface GuideDepthShelfProps {
  cards: GuideChapter[];
  onPress: (card: GuideChapter) => void;
}

export function GuideDepthShelf({ cards, onPress }: GuideDepthShelfProps): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <ScrollView contentContainerStyle={{ gap: theme.spacing[3] }} horizontal showsHorizontalScrollIndicator={false}>
      {cards.map((card) => (
        <Pressable accessibilityHint={card.body} accessibilityLabel={card.actionLabel} accessibilityRole="button" key={card.id} onPress={() => onPress(card)} style={({ pressed }) => ({ backgroundColor: vexFire.panelSoft, borderColor: vexFire.border, borderRadius: theme.borderRadius.lg, borderWidth: 1, opacity: pressed ? 0.82 : 1, overflow: 'hidden', width: theme.spacing[24] * 2 + theme.spacing[4] })}>
          <Image accessibilityIgnoresInvertColors source={card.asset} style={{ backgroundColor: vexFire.panel, height: theme.spacing[24], width: '100%' }} />
          <View style={{ padding: theme.spacing[4] }}>
            <Text color={vexFire.ember} variant="label">{card.eyebrow}</Text>
            <Text color={vexFire.cream} variant="h4" style={{ marginTop: theme.spacing[2] }}>{card.title}</Text>
            <Text color={vexFire.textSecondary} variant="caption" style={{ lineHeight: theme.typography.body.small.lineHeight, marginTop: theme.spacing[2] }}>{card.body}</Text>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
