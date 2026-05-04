/**
 * Monthly Report Ceremony
 *
 * Wraps MonthlyFocusReport for the spectacle system.
 * Displays the monthly focus report as a full-screen spectacle
 * after completing the first session of a new month.
 */

import React from 'react';
import { View } from 'react-native';

import { MonthlyFocusReport } from '../../focus-identity/components/MonthlyFocusReport';
import type { MonthlyReportPayload } from '../types';

interface MonthlyReportCeremonyProps {
  payload: MonthlyReportPayload;
  onComplete: () => void;
}

export function MonthlyReportCeremony({
  payload,
  onComplete,
}: MonthlyReportCeremonyProps): JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      <MonthlyFocusReport
        userId={payload.userId}
        visible={true}
        onClose={onComplete}
      />
    </View>
  );
}
