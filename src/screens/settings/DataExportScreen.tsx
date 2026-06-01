import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store';
import { DataExportScreen as AnalyticsDataExportScreen } from '../../features/analytics/components';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import type { SettingsStackParams } from '../../navigation';

type Props = NativeStackScreenProps<SettingsStackParams, 'DataExport'>;

export const DataExportScreen = withScreenErrorBoundary(
  function _DataExportScreen({ navigation }: Props): React.JSX.Element {
    const user = useAuthStore((store) => store.user);
    const userId = user?.id ?? '';

    return (
      <AnalyticsDataExportScreen
        userId={userId}
        onClose={() => navigation.goBack()}
      />
    );
  },
  'DataExport',
);

export default DataExportScreen;
