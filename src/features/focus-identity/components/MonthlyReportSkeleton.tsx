import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../../theme';
import { lightColors } from '@/theme/tokens/colors';


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
              theme.colors.border?.DEFAULT || lightColors.border.light,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 32,
            height: 32,
            backgroundColor:
              theme.colors.border?.DEFAULT || lightColors.border.light,
            borderRadius: 16,
          }}
        />
      </View>
      <View style={{ gap: theme.spacing[4] }}>
        <View
          style={{
            height: 200,
            backgroundColor:
              theme.colors.surface?.card || lightColors.surface.button,
            borderRadius: 16,
          }}
        />
        <View
          style={{
            height: 150,
            backgroundColor:
              theme.colors.surface?.card || lightColors.surface.button,
            borderRadius: 16,
          }}
        />
        <View
          style={{
            height: 100,
            backgroundColor:
              theme.colors.surface?.card || lightColors.surface.button,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
}
