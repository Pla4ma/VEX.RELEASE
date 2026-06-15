import React from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../../../components/primitives/Text';
import type { Lane, LaneConfirmation } from '../../../features/lane-engine';
import { etherealButton, etherealCard, etherealText } from '../../../theme/tokens/ethereal-sky';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';

const LANE_LABELS: Record<Lane, string> = {
  student: 'Study Mode',
  game_like: 'Run Mode',
  deep_creative: 'Project Mode',
  minimal_normal: 'Clean Mode',
};

const LANE_EMOJI: Record<Lane, string> = {
  student: '•',
  game_like: '•',
  deep_creative: '•',
  minimal_normal: '•',
};

type LaneConfirmationStepProps = {
  confirmation: LaneConfirmation | null;
  isChoosing: boolean;
  celebrating?: boolean;
  onAccept: (lane: Lane) => void;
  onChooseAnother: () => void;
};

function ModeSigil(): React.JSX.Element {
  return (
    <View
      style={{
        height: 44,
        width: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(125, 238, 228, 0.24)',
        borderColor: 'rgba(31, 137, 139, 0.42)',
        borderWidth: 1,
      }}
    />
  );
}

export function LaneConfirmationStep({
  confirmation,
  isChoosing,
  celebrating = false,
  onAccept,
  onChooseAnother,
}: LaneConfirmationStepProps): React.ReactNode {
  const lane = confirmation?.recommendedLane ?? 'minimal_normal';
  const laneLabel = LANE_LABELS[lane];

  return (
    <View style={{ gap: 16, paddingTop: 8 }}>
      <View
        style={{
          backgroundColor: etherealCard.fillSelected,
          borderColor: celebrating ? 'rgba(55,212,188,0.72)' : 'rgba(31, 137, 139, 0.64)',
          borderRadius: 24,
          borderWidth: celebrating ? 2.5 : 1.5,
          gap: 14,
          padding: 22,
          boxShadow: `0px 8px 28px ${celebrating ? 'rgba(55,212,188,0.55)' : 'transparent'}`,
        }}
      >
        <ModeSigil />
        <Text fontSize={28} fontWeight="800" style={{ color: etherealText.heading }}>
          {laneLabel}
        </Text>
        <Text
          fontSize={15}
          fontWeight="600"
          style={{ color: etherealText.subtitle, lineHeight: 22 }}
        >
          {confirmation?.reason ??
            'VEX will start with the mode that best matches your answers.'}
        </Text>
      </View>

      <Pressable
        accessibilityHint={`Confirms ${laneLabel} as your focus mode and opens the app`}
        accessibilityLabel={`Use ${laneLabel}`}
        accessibilityRole="button"
        accessibilityState={{ busy: isChoosing }}
        disabled={isChoosing}
        onPress={() => onAccept(lane)}
        style={({ pressed }) => [
          getMinTouchTargetStyle(),
          {
            alignItems: 'center',
            backgroundColor: etherealButton.googleFill,
            borderColor: etherealButton.googleBorder,
            borderRadius: 28,
            borderWidth: 1,
            height: 62,
            justifyContent: 'center',
            opacity: pressed ? 0.94 : 1,
          },
        ]}
      >
        <Text fontSize={16} fontWeight="800" style={{ color: etherealButton.googleText }}>
          Enter VEX
        </Text>
      </Pressable>

      <Pressable
        accessibilityHint="Shows all available focus modes to pick from"
        accessibilityLabel="Choose another mode"
        accessibilityRole="button"
        onPress={onChooseAnother}
        style={({ pressed }) => [
          getMinTouchTargetStyle(),
          {
            alignItems: 'center',
            backgroundColor: etherealButton.emailFill,
            borderColor: etherealButton.emailBorder,
            borderRadius: 28,
            borderWidth: 1,
            height: 62,
            justifyContent: 'center',
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <Text fontSize={16} fontWeight="800" style={{ color: etherealText.heading }}>
          Choose another
        </Text>
      </Pressable>
    </View>
  );
}

export { LANE_LABELS, LANE_EMOJI };
