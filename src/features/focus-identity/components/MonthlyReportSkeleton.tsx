import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme';
import { launchColors } from '@theme/tokens/launch-colors';

export function MonthlyReportSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[8],
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: theme.spacing[4],
        }}
      >
        <View
          style={{
            width: 200,
            height: 32,
            backgroundColor:
              theme.colors.border?.DEFAULT || launchColors.hex_e5e5e5,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor:
              theme.colors.border?.DEFAULT || launchColors.hex_e5e5e5,
            borderRadius: 16,
          }}
        />
      </View>
      <View style={{ gap: theme.spacing[4] }}>
        <View
          style={{
            height: 200,
            backgroundColor:
              theme.colors.surface?.card || launchColors.hex_f5f5f5,
            borderRadius: 16,
          }}
        />
        <View
          style={{
            height: 150,
            backgroundColor:
              theme.colors.surface?.card || launchColors.hex_f5f5f5,
            borderRadius: 16,
          }}
        />
        <View
          style={{
            height: 100,
            backgroundColor:
              theme.colors.surface?.card || launchColors.hex_f5f5f5,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
}
