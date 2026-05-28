import React from "react";
import { Pressable, Text, View } from "react-native";
import { type ProjectThread } from "../schemas";

export function Skeleton(): React.ReactElement {
  return (
    <View
      accessibilityLabel="Loading project card"
      style={{ padding: 16, borderRadius: 12, backgroundColor: "#1a1a2e" }}
    >
      <View
        style={{
          height: 16,
          width: "60%",
          backgroundColor: "#2a2a3e",
          borderRadius: 8,
        }}
      />
      <View
        style={{
          height: 12,
          width: "80%",
          backgroundColor: "#2a2a3e",
          borderRadius: 6,
          marginTop: 8,
        }}
      />
      <View
        style={{
          height: 36,
          width: 120,
          backgroundColor: "#2a2a3e",
          borderRadius: 8,
          marginTop: 12,
        }}
      />
    </View>
  );
}

export function EmptyState({
  onPressCreate,
}: {
  onPressCreate: () => void;
}): React.ReactElement {
  return (
    <Pressable
      accessibilityLabel="Create a new project"
      accessibilityRole="button"
      accessibilityHint="Opens project creation flow"
      onPress={onPressCreate}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#1a1a2e",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: "#e0e0ff", fontSize: 16, fontWeight: "600" }}>
        Project Thread
      </Text>
      <Text style={{ color: "#8888aa", fontSize: 13, marginTop: 4 }}>
        Track your creative or deep work project across sessions.
      </Text>
      <View
        style={{
          marginTop: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          backgroundColor: "#2a2a4e",
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#aabbff", fontSize: 14, fontWeight: "600" }}>
          Create project
        </Text>
      </View>
    </Pressable>
  );
}

export function ActiveCard({
  onPressResume,
  thread,
}: {
  onPressResume: () => void;
  thread: ProjectThread;
}): React.ReactElement {
  const isRescued = thread.state === "rescued";
  const isStale = thread.state === "stale";
  const isBlocked = thread.state === "blocked";

  return (
    <Pressable
      accessibilityLabel={`Resume project: ${thread.projectTitle}`}
      accessibilityRole="button"
      accessibilityHint={
        isRescued
          ? "Continue recovery session"
          : isStale
            ? "Re-enter stale project"
            : "Resume your project"
      }
      onPress={onPressResume}
      style={({ pressed }) => ({
        padding: 16,
        borderRadius: 12,
        backgroundColor: isRescued
          ? "#1a2e1a"
          : isStale
            ? "#2e2a1a"
            : "#1a1a2e",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ color: "#e0e0ff", fontSize: 16, fontWeight: "600" }}
          numberOfLines={1}
        >
          {thread.projectTitle}
        </Text>
        {isBlocked && (
          <View
            style={{
              paddingVertical: 2,
              paddingHorizontal: 8,
              borderRadius: 4,
              backgroundColor: "#3a2a1a",
            }}
          >
            <Text style={{ color: "#ffaa44", fontSize: 11, fontWeight: "600" }}>
              Blocked
            </Text>
          </View>
        )}
      </View>

      {isRescued && (
        <Text style={{ color: "#66cc88", fontSize: 13, marginTop: 6 }}>
          Recovery session ready. Start small.
        </Text>
      )}
      {isStale && !isRescued && (
        <Text style={{ color: "#ffcc44", fontSize: 13, marginTop: 6 }}>
          Project is stale. Short review block recommended.
        </Text>
      )}

      <Text
        style={{ color: "#aaaacc", fontSize: 13, marginTop: 6 }}
        numberOfLines={2}
      >
        {thread.nextMove}
      </Text>

      {thread.handoffNote ? (
        <Text
          style={{ color: "#7777aa", fontSize: 12, marginTop: 4 }}
          numberOfLines={2}
        >
          {thread.handoffNote}
        </Text>
      ) : null}

      <View
        style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: "#2a2a4e",
          }}
        >
          <Text style={{ color: "#aabbff", fontSize: 14, fontWeight: "600" }}>
            {isRescued
              ? "Recover project"
              : isStale
                ? "Re-enter project"
                : "Resume project"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
