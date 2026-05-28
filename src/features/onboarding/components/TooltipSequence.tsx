import React, { useState, useCallback } from "react";
import { Dimensions } from "react-native";
import { TooltipBubble, TooltipOverlay, type Tooltip } from "./TooltipBubble";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TooltipSequenceProps {
  hasStreak: boolean;
  hasBoss: boolean;
  onComplete: () => void;
}

export function TooltipSequence({
  hasStreak: _hasStreak,
  hasBoss,
  onComplete,
}: TooltipSequenceProps): JSX.Element {
  const [currentTooltipIndex, setCurrentTooltipIndex] = useState(0);

  const tooltips: Tooltip[] = [
    {
      id: 1,
      title: "Build Your Streak",
      message:
        "Complete one session per day to build your streak. The longer your streak, the bigger your XP multiplier!",
      target: "streak",
      position: { x: SCREEN_WIDTH / 2 - 130, y: 180 },
      arrowDirection: "up",
    },
    ...(hasBoss
      ? [
          {
            id: 2,
            title: "Defeat Bosses",
            message:
              "Bosses give bonus XP. Each session deals damage. Defeat them before they escape!",
            target: "boss" as const,
            position: { x: SCREEN_WIDTH / 2 - 130, y: 320 },
            arrowDirection: "down" as const,
          },
        ]
      : []),
    {
      id: hasBoss ? 3 : 2,
      title: "Complete Challenges",
      message:
        "Daily and weekly challenges give bonus rewards. Check back often for new quests!",
      target: "challenges" as const,
      position: { x: SCREEN_WIDTH / 2 - 130, y: 450 },
      arrowDirection: "down" as const,
    },
  ];

  const handleDismiss = useCallback(() => {
    if (currentTooltipIndex < tooltips.length - 1) {
      setCurrentTooltipIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentTooltipIndex, tooltips.length, onComplete]);

  if (tooltips.length === 0) {
    return <></>;
  }

  const currentTooltip = tooltips[currentTooltipIndex]!;

  return (
    <>
      <TooltipOverlay isVisible={true} onPress={handleDismiss} />
      <TooltipBubble
        tooltip={currentTooltip}
        isActive={true}
        onDismiss={handleDismiss}
      />
    </>
  );
}

export default TooltipSequence;
