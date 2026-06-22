import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { PlanWorkspace } from './components/PlanWorkspace';

function PlanScreenContent(): React.ReactNode {
  const insets = useSafeAreaInsets();

  return (
    <GlassScreen showAura variant="progress">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: 12,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <PlanWorkspace />
      </ScrollView>
    </GlassScreen>
  );
}

export const PlanScreen = withScreenErrorBoundary(PlanScreenContent, 'Plan');