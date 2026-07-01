import React from 'react';
import { Pressable, View } from 'react-native';

import { GlassCard } from '../../../components/glass/GlassCard';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { borderRadius } from '../../../theme/tokens/radius';
import { bodyTypography, fontWeights } from '../../../theme/tokens/typography';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

export type HomeSubTab = 'overview' | 'coach' | 'progress';

const tabs: ReadonlyArray<{ id: HomeSubTab; label: string; hint: string }> = [
  { id: 'overview', label: 'Home', hint: 'Show main daily actions' },
  { id: 'coach', label: 'AI Coach', hint: 'Show coach and agent guidance' },
  { id: 'progress', label: 'Progress', hint: 'Show metrics and unlocks' },
];

interface HomeSubTabsProps {
  activeTab: HomeSubTab;
  onChange: (tab: HomeSubTab) => void;
}

export function HomeSubTabs({
  activeTab,
  onChange,
}: HomeSubTabsProps): React.ReactNode {
  return (
    <GlassCard padding={spacing[2]} radius={borderRadius.full} variant="strong">
      <View style={{ flexDirection: 'row', gap: spacing[1] }}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              accessibilityHint={tab.hint}
              accessibilityLabel={`${tab.label} home tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={({ pressed }) => ({
                alignItems: 'center',
                backgroundColor: selected
                  ? vexLightGlass.mint[100]
                  : vexLightGlass.background.transparent,
                borderColor: selected
                  ? vexLightGlass.mint[300]
                  : vexLightGlass.background.transparent,
                borderRadius: borderRadius.full,
                borderWidth: 1,
                flex: 1,
                minHeight: spacing[12],
                justifyContent: 'center',
                opacity: pressed ? 0.82 : 1,
                paddingHorizontal: spacing[3],
              })}
            >
              <Text
                style={[
                  bodyTypography.medium,
                  {
                    color: selected
                      ? vexLightGlass.mint[800]
                      : vexLightGlass.text.tertiary,
                    fontWeight: selected
                      ? fontWeights.heavy
                      : fontWeights.semibold,
                    textAlign: 'center',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}
