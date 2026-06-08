import { withScreenErrorBoundary } from '../shared/ui/components/ScreenErrorBoundary';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { useTheme } from '../theme';

export function RivalsScreen(): JSX.Element {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
    >
      <EmptyState
        iconName="users"
        title="Rivals — Coming Soon"
        body="Compete weekly with players at your level. This feature is under development."
      />
    </SafeAreaView>
  );
}

export default withScreenErrorBoundary(RivalsScreen, 'Rivals');
