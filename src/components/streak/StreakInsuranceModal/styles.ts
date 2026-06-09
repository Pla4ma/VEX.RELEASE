import type { ViewStyle } from 'react-native';
import type { Theme } from './types';

export const overlayStyle = (t: Theme): ViewStyle => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: t.colors.background.overlay,
});

export const containerStyle = (t: Theme): ViewStyle => ({
  backgroundColor: t.colors.background.secondary,
  borderRadius: 16,
  overflow: 'hidden',
  maxHeight: '90%',
});

export const headerStyle: ViewStyle = { padding: 20, alignItems: 'center' };

export const headerTitleStyle = (t: Theme) => ({
  fontSize: 20,
  fontWeight: 'bold' as const,
  color: t.colors.text.inverse,
});

export const streakDaysStyle = (t: Theme) => ({
  fontSize: 16,
  color: t.colors.text.inverse,
  marginTop: 4,
});

export const riskSectionStyle = (t: Theme): ViewStyle => ({
  padding: 20,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: t.colors.border.DEFAULT,
});

export const riskLabelStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.tertiary,
  textTransform: 'uppercase' as const,
});

export const riskValueStyle = (_t: Theme) => ({
  fontSize: 24,
  fontWeight: 'bold' as const,
  marginTop: 4,
});

export const riskMessageStyle = (t: Theme) => ({
  fontSize: 14,
  color: t.colors.text.secondary,
  textAlign: 'center' as const,
  marginTop: 8,
});

export const hoursRemainingStyle = (t: Theme) => ({
  fontSize: 16,
  fontWeight: '600' as const,
  color: t.colors.text.primary,
  marginTop: 8,
});

export const optionsContainerStyle: ViewStyle = { padding: 16 };

export const optionRowStyle = (t: Theme): ViewStyle => ({
  flexDirection: 'row',
  backgroundColor: t.colors.background.primary,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: t.colors.border.DEFAULT,
});

export const optionIconStyle = (t: Theme): ViewStyle => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: t.colors.background.secondary,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
});

export const iconTextStyle = { fontSize: 24 };

export const optionContentStyle: ViewStyle = { flex: 1 };

export const optionTitleStyle = (t: Theme) => ({
  fontSize: 16,
  fontWeight: 'bold' as const,
  color: t.colors.text.primary,
});

export const optionDescriptionStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.tertiary,
  marginTop: 4,
});

export const costBaseStyle = (_t: Theme) => ({
  fontSize: 14,
  fontWeight: '600' as const,
  marginTop: 8,
});

export const gambleHeaderStyle = (t: Theme) => ({
  fontSize: 14,
  fontWeight: '600' as const,
  color: t.colors.text.secondary,
  marginTop: 8,
  marginBottom: 12,
});

export const gambleOptionStyle = (t: Theme): ViewStyle => ({
  flexDirection: 'row',
  backgroundColor: t.colors.background.secondary,
  borderRadius: 12,
  padding: 12,
  marginBottom: 8,
  borderWidth: 2,
});

export const gambleBadgeStyle: ViewStyle = {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 8,
  marginRight: 12,
  alignSelf: 'center',
};

export const gambleTypeTextStyle = (t: Theme) => ({
  fontSize: 12,
  fontWeight: '700' as const,
  color: t.colors.text.inverse,
  textTransform: 'uppercase' as const,
});

export const gambleContentStyle: ViewStyle = { flex: 1 };

export const gambleDescriptionStyle = (t: Theme) => ({
  fontSize: 12,
  color: t.colors.text.secondary,
});

export const xpBonusStyle = {
  fontSize: 14,
  fontWeight: '600' as const,
  marginTop: 4,
};

export const comebackTokenStyle = (t: Theme): ViewStyle => ({
  flexDirection: 'row',
  backgroundColor: t.colors.primary[50],
  borderRadius: 12,
  padding: 16,
  marginTop: 12,
  borderWidth: 2,
  borderColor: t.colors.primary[500],
});

export const dismissStyle = (t: Theme): ViewStyle => ({
  padding: 16,
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: t.colors.border.DEFAULT,
});

export const dismissTextStyle = (t: Theme) => ({
  color: t.colors.text.tertiary,
  fontSize: 14,
});
