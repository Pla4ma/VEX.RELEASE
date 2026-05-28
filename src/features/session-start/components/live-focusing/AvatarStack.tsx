/**
 * Overlapping avatar stack with overflow counter.
 */
import React from "react";
import { Box } from "../../../../components/primitives/Box";
import { Text } from "../../../../components/primitives/Text";
import { Avatar } from "../../../../components/Avatar";
import { useTheme } from "../../../../theme";

interface AvatarStackProps {
  avatars?: Array<{ url?: string; initials: string }>;
  maxDisplay?: number;
}

export function AvatarStack({
  avatars,
  maxDisplay = 4,
}: AvatarStackProps): JSX.Element {
  const { theme } = useTheme();
  if (!avatars || avatars.length === 0) {
    return (
      <Box flexDirection="row" alignItems="center">
        <Box
          width={32}
          height={32}
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          style={{ backgroundColor: theme.colors.background.tertiary }}
        >
          <Text fontSize={14}>👤</Text>
        </Box>
      </Box>
    );
  }
  const displayAvatars = avatars.slice(0, maxDisplay);
  const remaining = avatars.length - maxDisplay;
  return (
    <Box flexDirection="row" alignItems="center">
      {displayAvatars.map((avatar, index) => {
        return (
          <Box
            key={index}
            style={{
              marginLeft: index === 0 ? 0 : -8,
              zIndex: displayAvatars.length - index,
            }}
          >
            <Box
              width={32}
              height={32}
              borderRadius="full"
              borderWidth={2}
              borderColor="background.primary"
              style={{ overflow: "hidden" }}
            >
              <Avatar
                size="sm"
                source={avatar.url ? { uri: avatar.url } : undefined}
                name={avatar.initials}
              />
            </Box>
          </Box>
        );
      })}

      {remaining > 0 && (
        <Box
          width={32}
          height={32}
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
          style={{
            marginLeft: -8,
            backgroundColor: theme.colors.background.tertiary,
            borderWidth: 2,
            borderColor: theme.colors.background.primary,
          }}
        >
          <Text variant="caption" color="text.primary" fontWeight="600">
            +{remaining}
          </Text>
        </Box>
      )}
    </Box>
  );
}
