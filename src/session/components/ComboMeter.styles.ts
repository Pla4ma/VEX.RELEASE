import { Dimensions } from 'react-native';
import { launchColors } from '@theme/tokens/launch-colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const METER_WIDTH = SCREEN_WIDTH - 48;

export const containerStyle = {
  width: METER_WIDTH,
  alignSelf: 'center' as const,
  marginVertical: 12,
};

export const glowStyle = {
  position: 'absolute' as const,
  top: -10,
  left: -10,
  right: -10,
  bottom: -10,
  borderRadius: 20,
  opacity: 0.3,
};

export const fireContainerStyle = {
  position: 'absolute' as const,
  top: -30,
  right: 10,
  flexDirection: 'row' as const,
  zIndex: 1,
};

export const fireEmojiStyle = { fontSize: 24, marginLeft: -8 };

export const mainContainerStyle = {
  borderRadius: 16,
  padding: 16,
  shadowColor: launchColors.hex_000,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

export const headerRowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  marginBottom: 12,
};

export const tierBadgeStyle = {
  width: 44,
  height: 44,
  borderRadius: 22,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: launchColors.rgb_0_0_0_0_1,
  marginRight: 12,
};

export const tierEmojiStyle = { fontSize: 24 };
export const comboInfoStyle = { flex: 1 };
export const comboTextStyle = { fontWeight: '700' as const };

export const multiplierBadgeStyle = {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 12,
};

export const multiplierTextStyle = {
  color: launchColors.hex_fff,
  fontWeight: '700' as const,
  fontSize: 14,
};

export const progressContainerStyle = {
  height: 12,
  borderRadius: 6,
  overflow: 'hidden' as const,
  marginBottom: 8,
};

export const progressBarStyle = { height: '100%' as const, borderRadius: 6 };
export const nextTierTextStyle = { textAlign: 'center' as const };

export const maxTierTextStyle = {
  textAlign: 'center' as const,
  fontWeight: '700' as const,
};

export const milestoneOverlayStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  zIndex: 10,
};

export const milestoneCardStyle = {
  padding: 24,
  borderRadius: 20,
  alignItems: 'center' as const,
  shadowColor: launchColors.hex_000,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 8,
};

export const milestoneEmojiStyle = { fontSize: 48, marginBottom: 12 };
export const milestoneTextStyle = {
  textAlign: 'center' as const,
  marginBottom: 8,
};

export const comboBrokenOverlayStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  zIndex: 10,
};

export const comboBrokenCardStyle = {
  padding: 20,
  borderRadius: 16,
  alignItems: 'center' as const,
};

export const comboBrokenEmojiStyle = { fontSize: 40, marginBottom: 8 };
export const comboBrokenTextStyle = {
  color: launchColors.hex_fff,
  marginBottom: 4,
};
export const comboBrokenSubtextStyle = {
  color: launchColors.hex_fff,
  opacity: 0.8,
};

export const warningOverlayStyle = {
  position: 'absolute' as const,
  top: -8,
  left: 0,
  right: 0,
  paddingVertical: 4,
  paddingHorizontal: 12,
  borderRadius: 8,
};

export const warningTextStyle = {
  textAlign: 'center' as const,
  fontWeight: '600' as const,
};
