import React from "react";
import { View, Text } from "react-native";
import { styles } from "./BossPhaseIndicator.styles";

type BossPhase = string;

const PHASE_TIPS: Record<string, string[]> = {
  PHASE_1: [
    "Focus on maintaining high purity",
    "Save your pause time for emergencies",
    "Build momentum for later phases",
  ],
  PHASE_2: [
    "⚠️ Pauses now deal damage to YOU!",
    "Commit to uninterrupted focus",
    "Use Deep Work mode if available",
  ],
  PHASE_3: [
    "🚨 EXECUTE PHASE!",
    "Maintain 90%+ purity or FAIL!",
    "2-minute countdown - finish strong!",
    "Your streak is on the line!",
  ],
  ENRAGED: [
    "⚠️ BOSS IS ENRAGED!",
    "Damage output increased!",
    "Focus now or fail!",
  ],
  EXECUTE: ["🚨 EXECUTE WINDOW!", "FINAL PUSH REQUIRED!", "All or nothing!"],
};

export const PhaseTips: React.FC<{ phase: BossPhase }> = ({ phase }) => {
  const phaseTips = PHASE_TIPS[phase] ?? PHASE_TIPS.PHASE_1 ?? [];
  return (
    <View>
      <Text style={styles.tipsHeader}>Phase Tips:</Text>
      {phaseTips.map((tip: string, index: number) => (
        <Text key={index} style={styles.tip}>
          {" "}
          • {tip}
        </Text>
      ))}
    </View>
  );
};
