import React from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { TomorrowPreviewPersonalized } from "./TomorrowPreviewPersonalized";

function EventIcon({
  type,
}: {
  type: TomorrowPreviewProps["events"][number]["type"];
}): JSX.Element {
  return (
    <Text fontSize={14}>
      {type === "double_xp" && "🔥"}
      {type === "squad_war" && "⚔️"}
      {type === "boss_rush" && "👹"}
      {type === "season_event" && "🌙"}
    </Text>
  );
}

export * from "./TomorrowPreview.types";
export * from "./TomorrowPreview.part1";
export * from "./TomorrowPreview.part2";
