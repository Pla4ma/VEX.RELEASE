import { captureSilentFailure } from "../../../utils/silent-failure";
/**
 * VictoryCard Component
 *
 * Export-ready image cards for sharing achievements outside the app.
 * Types: Session Receipt, Achievement Badge, Streak Milestone, Boss Defeat
 *
 * Uses react-native-view-shot for capturing as image.
 *
 * @phase 10.3
 */

import React, { useRef, useCallback, useState } from "react";
import { View, Share, Platform } from "react-native";

// react-native-view-shot is installed as an optional dependency
// It will be dynamically imported to avoid hard crashes if not available
let captureRef:
  | ((
      ref: React.RefObject<View | null>,
      options: {
        format: "png" | "jpg";
        quality: number;
        result: "tmpfile" | "base64" | "data-uri";
      },
    ) => Promise<string>)
  | null = null;

// Dynamic import for react-native-view-shot
try {
  const ViewShot = require("react-native-view-shot");
  captureRef = ViewShot.captureRef;
} catch (error) {
  captureSilentFailure(error, { feature: "social", operation: "network-fallback", type: "network" });
  // Module not installed - will fall back to text sharing
  captureRef = null;
}

import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";

// ============================================================================
// Types
// ============================================================================

export type VictoryCardType = "SESSION" | "ACHIEVEMENT" | "STREAK" | "BOSS";

export interface VictoryCardData {
  type: VictoryCardType;
  username: string;
  /** For all types */
  timestamp: number;
  /** Session type: duration in minutes */
  duration?: number;
  /** Session type: grade (S/A/B/C/D) */
  grade?: string;
  /** Session type: XP earned */
  xp?: number;
  /** Session type: streak days */
  streakDays?: number;
  /** Achievement type: achievement name */
  achievementName?: string;
  /** Achievement type: rarity */
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  /** Streak type: days */
  milestoneDays?: number;
  /** Boss type: boss name */
  bossName?: string;
  /** Boss type: damage dealt */
  damageDealt?: number;
  /** Boss type: tier (1-6) */
  bossTier?: number;
  /** Optional quote from AI coach */
  coachQuote?: string;
}

interface VictoryCardProps {
  /** Card data */
  data: VictoryCardData;
  /** Aspect ratio: 'square' (1:1) or 'story' (9:16) */
  format?: "square" | "story";
  /** Share callback */
  onShare?: (uri: string) => void;
  /** Ref for capturing */
  captureRef?: React.RefObject<View | null>;
}

// ============================================================================
// Card Designs
// ============================================================================

const RARITY_COLORS: Record<string, string> = {
  COMMON: "#94A3B8",
  UNCOMMON: "#22C55E",
  RARE: "#3B82F6",
  EPIC: "#A855F7",
  LEGENDARY: "#F59E0B",
};

const BOSS_ICONS: Record<number, string> = {
  1: "👾",
  2: "👹",
  3: "📱",
  4: "🤹",
  5: "👺",
  6: "👻",
};

/**
 * Session Receipt Card
 */
function SessionReceiptCard({ data, format }: { data: VictoryCardData; format: "square" | "story" }): JSX.Element {
  const { theme } = useTheme();
  const isStory = format === "story";

  return (
    <Box
      flex={1}
      p={isStory ? "xl" : "lg"}
      bg="background.primary"
      style={{
        backgroundColor: "#0F172A", // Dark background for premium feel
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* VEX Logo */}
      <Text fontSize={isStory ? 48 : 32} fontWeight="900" color="primary.500" mb="lg">
        VEX
      </Text>

      {/* Main Content */}
      <Box alignItems="center" gap="lg">
        {/* Grade Badge */}
        <Box
          width={isStory ? 120 : 80}
          height={isStory ? 120 : 80}
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          style={{
            backgroundColor: `${theme.colors.primary[500]}30`,
            borderWidth: 4,
            borderColor: theme.colors.primary[500],
          }}
        >
          <Text fontSize={isStory ? 56 : 40} fontWeight="900" color="primary.500">
            {data.grade || "A"}
          </Text>
        </Box>

        {/* Duration */}
        <Text fontSize={isStory ? 64 : 48} fontWeight="800" color="text.inverse">
          {data.duration || 25}
          <Text fontSize={isStory ? 32 : 24} color="text.tertiary">
            m
          </Text>
        </Text>

        {/* Stats Row */}
        <Box flexDirection="row" gap="xl">
          <Box alignItems="center">
            <Text fontSize={isStory ? 32 : 24} fontWeight="700" color="success.DEFAULT">
              +{data.xp || 45}
            </Text>
            <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
              XP Earned
            </Text>
          </Box>
          <Box alignItems="center">
            <Text fontSize={isStory ? 32 : 24} fontWeight="700" color="warning.DEFAULT">
              🔥{data.streakDays || 1}
            </Text>
            <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
              Day Streak
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Username */}
      <Box mt="xl" alignItems="center">
        <Text fontSize={isStory ? 20 : 16} color="text.inverse" fontWeight="600">
          {data.username}
        </Text>
        <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
          Focus Session Complete
        </Text>
      </Box>

      {/* Coach Quote */}
      {data.coachQuote && (
        <Box mt="lg" p="md" borderRadius="lg" style={{ backgroundColor: "#1E293B", maxWidth: "80%" }}>
          <Text fontSize={isStory ? 16 : 14} color="text.secondary" textAlign="center" style={{ fontStyle: "italic" }}>
            "{data.coachQuote}"
          </Text>
        </Box>
      )}

      {/* App Tagline */}
      <Box position="absolute" bottom={isStory ? 40 : 20} alignItems="center">
        <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
          @VEXApp • Build your focus streak
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Achievement Badge Card
 */
function AchievementBadgeCard({ data, format }: { data: VictoryCardData; format: "square" | "story" }): JSX.Element {
  const isStory = format === "story";
  const rarityColor = RARITY_COLORS[data.rarity || "COMMON"];

  return (
    <Box
      flex={1}
      p={isStory ? "xl" : "lg"}
      style={{
        backgroundColor: "#0F172A",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* VEX Logo */}
      <Text fontSize={isStory ? 36 : 24} fontWeight="900" color="primary.500" mb="xl">
        VEX
      </Text>

      {/* Rarity Badge */}
      <Box px="lg" py="sm" borderRadius="full" style={{ backgroundColor: rarityColor }} mb="lg">
        <Text fontSize={isStory ? 16 : 14} fontWeight="700" color="white">
          {data.rarity || "COMMON"} ACHIEVEMENT
        </Text>
      </Box>

      {/* Achievement Icon */}
      <Box
        width={isStory ? 140 : 100}
        height={isStory ? 140 : 100}
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: `${rarityColor}30`,
          borderWidth: 4,
          borderColor: rarityColor,
        }}
        mb="lg"
      >
        <Text fontSize={isStory ? 72 : 48}>🏆</Text>
      </Box>

      {/* Achievement Name */}
      <Text fontSize={isStory ? 32 : 24} fontWeight="800" color="text.inverse" textAlign="center" mb="md">
        {data.achievementName || "Achievement Unlocked"}
      </Text>

      {/* Username */}
      <Text fontSize={isStory ? 20 : 16} color="text.tertiary" mb="xl">
        {data.username}
      </Text>

      {/* Unlock Date */}
      <Text fontSize={isStory ? 14 : 12} color="text.secondary">
        Unlocked {new Date(data.timestamp).toLocaleDateString()}
      </Text>

      {/* App Tagline */}
      <Box position="absolute" bottom={isStory ? 40 : 20} alignItems="center">
        <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
          @VEXApp • Your focus journey
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Streak Milestone Card
 */
function StreakMilestoneCard({ data, format }: { data: VictoryCardData; format: "square" | "story" }): JSX.Element {
  const isStory = format === "story";
  const days = data.milestoneDays || data.streakDays || 7;

  const getMilestoneTitle = (d: number): string => {
    if (d >= 100) {
      return "CENTURY LEGEND";
    }
    if (d >= 60) {
      return "CONSISTENCY KING";
    }
    if (d >= 30) {
      return "MONTHLY MASTER";
    }
    if (d >= 14) {
      return "TWO WEEK CHAMP";
    }
    if (d >= 7) {
      return "WEEK WARRIOR";
    }
    return "STREAK STARTER";
  };

  return (
    <Box
      flex={1}
      p={isStory ? "xl" : "lg"}
      style={{
        backgroundColor: "#0F172A",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* VEX Logo */}
      <Text fontSize={isStory ? 36 : 24} fontWeight="900" color="primary.500" mb="xl">
        VEX
      </Text>

      {/* Milestone Badge */}
      <Box px="lg" py="sm" borderRadius="full" bg="warning.DEFAULT" mb="lg">
        <Text fontSize={isStory ? 16 : 14} fontWeight="700" color="white">
          🔥 {getMilestoneTitle(days)}
        </Text>
      </Box>

      {/* Flame Animation Effect */}
      <Box mb="lg">
        <Text fontSize={isStory ? 64 : 48}>{"🔥".repeat(Math.min(Math.floor(days / 7) + 1, 6))}</Text>
      </Box>

      {/* Day Count */}
      <Text fontSize={isStory ? 120 : 80} fontWeight="900" color="warning.DEFAULT" mb="sm">
        {days}
      </Text>
      <Text fontSize={isStory ? 28 : 20} fontWeight="700" color="text.inverse" mb="lg">
        DAY STREAK
      </Text>

      {/* Username */}
      <Text fontSize={isStory ? 20 : 16} color="text.tertiary" mb="xl">
        {data.username}
      </Text>

      {/* Motivational Text */}
      <Text fontSize={isStory ? 16 : 14} color="text.secondary" textAlign="center" style={{ maxWidth: "80%" }}>
        {days >= 30 ? "A month of dedication. You are unstoppable!" : days >= 7 ? "A week of focus. Keep the fire burning!" : "Building momentum. Keep going!"}
      </Text>

      {/* App Tagline */}
      <Box position="absolute" bottom={isStory ? 40 : 20} alignItems="center">
        <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
          @VEXApp • Don't break the chain
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Boss Defeat Card
 */
function BossDefeatCard({ data, format }: { data: VictoryCardData; format: "square" | "story" }): JSX.Element {
  const isStory = format === "story";
  const bossIcon = BOSS_ICONS[data.bossTier || 1] || "👾";

  return (
    <Box
      flex={1}
      p={isStory ? "xl" : "lg"}
      style={{
        backgroundColor: "#0F172A",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* VEX Logo */}
      <Text fontSize={isStory ? 36 : 24} fontWeight="900" color="primary.500" mb="xl">
        VEX
      </Text>

      {/* Victory Badge */}
      <Box px="lg" py="sm" borderRadius="full" bg="success.DEFAULT" mb="lg">
        <Text fontSize={isStory ? 16 : 14} fontWeight="700" color="white">
          🏆 BOSS DEFEATED
        </Text>
      </Box>

      {/* Boss Icon */}
      <Box
        width={isStory ? 140 : 100}
        height={isStory ? 140 : 100}
        borderRadius="full"
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: "#EF444430",
          borderWidth: 4,
          borderColor: "#EF4444",
        }}
        mb="lg"
      >
        <Text fontSize={isStory ? 72 : 48}>{bossIcon}</Text>
      </Box>

      {/* Boss Name */}
      <Text fontSize={isStory ? 32 : 24} fontWeight="800" color="text.inverse" textAlign="center" mb="md">
        {data.bossName || "Unknown Boss"}
      </Text>

      {/* Damage Stats */}
      <Box flexDirection="row" alignItems="center" gap="xl" mb="lg">
        <Box alignItems="center">
          <Text fontSize={isStory ? 40 : 32} fontWeight="800" color="error.DEFAULT">
            ⚔️ {data.damageDealt || 0}
          </Text>
          <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
            Damage Dealt
          </Text>
        </Box>
      </Box>

      {/* Username */}
      <Text fontSize={isStory ? 20 : 16} color="text.tertiary" mb="xl">
        {data.username}
      </Text>

      {/* App Tagline */}
      <Box position="absolute" bottom={isStory ? 40 : 20} alignItems="center">
        <Text fontSize={isStory ? 14 : 12} color="text.tertiary">
          @VEXApp • Defeat your distractions
        </Text>
      </Box>
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Victory Card component - renders the appropriate card type
 */
export function VictoryCard({ data, format = "square" }: VictoryCardProps): JSX.Element {
  switch (data.type) {
    case "SESSION":
      return <SessionReceiptCard data={data} format={format} />;
    case "ACHIEVEMENT":
      return <AchievementBadgeCard data={data} format={format} />;
    case "STREAK":
      return <StreakMilestoneCard data={data} format={format} />;
    case "BOSS":
      return <BossDefeatCard data={data} format={format} />;
    default:
      return <SessionReceiptCard data={data} format={format} />;
  }
}

/**
 * Victory Card with capture and share functionality
 */
export function VictoryCardWithShare({ data, format = "square" }: Omit<VictoryCardProps, "captureRef">): JSX.Element {
  const cardRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { theme } = useTheme();

  const handleShare = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    try {
      setIsCapturing(true);

      // Capture the card as image if view-shot is available
      let uri: string | undefined;
      if (captureRef) {
        uri = await captureRef(cardRef, {
          format: "png",
          quality: 1,
          result: "tmpfile",
        });
      }

      // Share the image or text
      const shareMessage = getShareMessage(data);

      if (uri) {
        if (Platform.OS === "ios") {
          await Share.share({
            url: uri,
            message: shareMessage,
          });
        } else {
          await Share.share({
            message: `${shareMessage}\n${uri}`,
          });
        }
      } else {
        // Text-only fallback
        await Share.share({
          message: `${shareMessage}\n\nJoin me on VEX!`,
        });
      }
    } catch (error) {
      // Silent fail - don't disrupt the ceremony
    } finally {
      setIsCapturing(false);
    }
  }, [data]);

  return (
    <Box gap="lg">
      {/* Card for capture */}
      <View
        ref={cardRef}
        style={{
          width: format === "story" ? 360 : 360,
          height: format === "story" ? 640 : 360,
          overflow: "hidden",
        }}
        collapsable={false}
      >
        <VictoryCard data={data} format={format} />
      </View>

      {/* Share Button */}
      <Button variant="primary" size="lg" onPress={handleShare} disabled={isCapturing} fullWidth accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
        {isCapturing ? "Capturing..." : "Share Victory"}
      </Button>

      {/* Format Toggle */}
      <Box flexDirection="row" justifyContent="center" gap="md">
        <Text fontSize={12} color="text.tertiary">
          Format: {format === "square" ? "1:1 (Instagram)" : "9:16 (Stories)"}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Get pre-filled share message based on card type
 */
function getShareMessage(data: VictoryCardData): string {
  const base = `I just focused for ${data.duration || 25} minutes and dealt ${data.damageDealt || 0} damage to ${data.bossName || "my distractions"} on @VEXApp`;

  switch (data.type) {
    case "SESSION":
      return `I just focused for ${data.duration} minutes and earned a ${data.grade} grade on @VEXApp! 🔥 ${data.streakDays}-day streak going strong.`;
    case "ACHIEVEMENT":
      return `I just unlocked the "${data.achievementName}" achievement on @VEXApp! 🏆 ${data.rarity} rarity!`;
    case "STREAK":
      return `I just hit a ${data.milestoneDays || data.streakDays}-day focus streak on @VEXApp! 🔥🔥🔥 Don't break the chain!`;
    case "BOSS":
      return `I just defeated ${data.bossName} on @VEXApp! ⚔️ ${data.damageDealt} damage dealt. Who's next?`;
    default:
      return base;
  }
}

/**
 * Generate shareable caption for social media
 */
export function generateShareCaption(data: VictoryCardData): string {
  const hashtags = "#VEXApp #FocusMode #Productivity #GamifiedFocus";
  return `${getShareMessage(data)}\n\n${hashtags}`;
}

export default VictoryCardWithShare;
