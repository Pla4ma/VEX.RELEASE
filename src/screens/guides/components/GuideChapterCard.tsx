import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { VexIcon } from '../../../shared/ui/vex/VexIcon';
import { vexFire } from '../../../theme/tokens/vex-fire';
import { useTheme } from '../../../theme/ThemeContext';
import type { GuideChapter } from '../guide-data';

interface GuideChapterCardProps {
  chapter: GuideChapter;
  onPress: () => void;
}

export function GuideChapterCard({ chapter, onPress }: GuideChapterCardProps): React.JSX.Element {
  const { theme } = useTheme();
  return (
    <View style={{ borderBottomColor: vexFire.line, borderBottomWidth: 1, paddingVertical: theme.spacing[5] }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing[4] }}>
        <Image accessibilityIgnoresInvertColors source={chapter.asset} style={{ backgroundColor: vexFire.panel, borderRadius: theme.borderRadius.md, height: theme.spacing[24], width: theme.spacing[20] }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text color={vexFire.ember} variant="label">{chapter.eyebrow}</Text>
          <Text color={vexFire.cream} variant="h3" style={{ marginTop: theme.spacing[2] }}>{chapter.title}</Text>
          <Text color={vexFire.textSecondary} variant="bodySmall" style={{ lineHeight: theme.typography.body.small.lineHeight, marginTop: theme.spacing[2] }}>{chapter.body}</Text>
        </View>
      </View>
      <Pressable accessibilityHint={chapter.body} accessibilityLabel={chapter.actionLabel} accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', borderColor: vexFire.borderStrong, borderRadius: theme.borderRadius.full, borderWidth: 1, flexDirection: 'row', gap: theme.spacing[2], justifyContent: 'center', marginTop: theme.spacing[4], minHeight: theme.spacing[12], opacity: pressed ? 0.8 : 1 })}>
        <Text color={vexFire.amber} variant="button">{chapter.actionLabel}</Text>
        <VexIcon color={vexFire.amber} name="arrow-right" size="sm" variant="outline" />
      </Pressable>
    </View>
  );
}
