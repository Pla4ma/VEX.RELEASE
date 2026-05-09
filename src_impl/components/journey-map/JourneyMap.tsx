/**
 * Journey Map Component - Visual Branching Battle Pass
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/theme';
import type { JourneyNode, JourneyPath, UserJourneyProgress } from '../../features/battle-pass/journey-map';
import { PATH_CONFIG } from '../../features/battle-pass/journey-map';

interface JourneyMapProps {
  nodes: JourneyNode[];
  progress: UserJourneyProgress;
  onNodePress?: (node: JourneyNode) => void;
  onPathSwitch?: (path: JourneyPath) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ nodes, progress, onNodePress, onPathSwitch }) => {
  const { theme } = useTheme();
  const paths = useMemo(() => {
    const pathGroups: Record<JourneyPath, JourneyNode[]> = {
      PURITY: [],
      SPEED: [],
      SOCIAL: [],
      BALANCED: [],
    };

    nodes.forEach((node) => {
      if (node.tier > 0) {
        pathGroups[node.path].push(node);
      }
    });

    // Sort each path by tier
    Object.keys(pathGroups).forEach((key) => {
      pathGroups[key as JourneyPath].sort((a, b) => a.tier - b.tier);
    });

    return pathGroups;
  }, [nodes]);

  const currentNode = useMemo(() => {
    return nodes.find((n) => n.id === progress.currentNodeId);
  }, [nodes, progress.currentNodeId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background.secondary }} horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', padding: theme.spacing[4], gap: theme.spacing[3] }}>
        {/* Start Node */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.text.secondary,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            marginTop: 40,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: 'bold' as const,
              fontSize: 12,
            }}
          >
            START
          </Text>
        </View>

        {/* Connection lines */}
        <View
          style={{
            position: 'absolute' as const,
            left: 46,
            top: 100,
            width: 200,
            height: 4,
            flexDirection: 'row' as const,
            gap: 48,
          }}
        >
          <View style={[{ width: 40, height: 2, opacity: 0.5 }, { backgroundColor: PATH_CONFIG.PURITY.color }]} />
          <View style={[{ width: 40, height: 2, opacity: 0.5 }, { backgroundColor: PATH_CONFIG.SPEED.color }]} />
          <View style={[{ width: 40, height: 2, opacity: 0.5 }, { backgroundColor: PATH_CONFIG.SOCIAL.color }]} />
          <View style={[{ width: 40, height: 2, opacity: 0.5 }, { backgroundColor: PATH_CONFIG.BALANCED.color }]} />
        </View>

        {/* Path columns */}
        {(Object.keys(paths) as JourneyPath[]).map((path) => (
          <PathColumn key={path} path={path} nodes={paths[path]} currentNode={currentNode} progress={progress} onNodePress={onNodePress} onPathSwitch={onPathSwitch} />
        ))}
      </View>
    </ScrollView>
  );
};

interface PathColumnProps {
  path: JourneyPath;
  nodes: JourneyNode[];
  currentNode?: JourneyNode;
  progress: UserJourneyProgress;
  onNodePress?: (node: JourneyNode) => void;
  onPathSwitch?: (path: JourneyPath) => void;
}

const PathColumn: React.FC<PathColumnProps> = ({ path, nodes, currentNode, progress, onNodePress, onPathSwitch }) => {
  const config = PATH_CONFIG[path];
  const isCurrentPath = progress.currentPath === path;

  // Group nodes by tier (10 tiers per section)
  const nodeSections = useMemo(() => {
    const sections: JourneyNode[][] = [];
    for (let i = 0; i < 5; i++) {
      sections.push(nodes.filter((n) => n.tier > i * 10 && n.tier <= (i + 1) * 10));
    }
    return sections;
  }, [nodes]);

  return (
    <View style={{ width: 80, alignItems: 'center' as const }}>
      {/* Path header */}
      <View
        style={[
          {
            width: '100%',
            paddingVertical: 8,
            paddingHorizontal: 4,
            borderRadius: 8,
            alignItems: 'center' as const,
            marginBottom: 8,
          },
          { backgroundColor: config.color },
        ]}
      >
        <Text style={{ fontSize: 20 }}>{config.icon}</Text>
        <Text
          style={{
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold' as const,
            textAlign: 'center' as const,
          }}
        >
          {config.name}
        </Text>
        {isCurrentPath && (
          <View
            style={{
              position: 'absolute' as const,
              top: -4,
              right: -4,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#FFD700',
            }}
          />
        )}
      </View>

      {/* Switch path button (at intersections) */}
      {currentNode?.isIntersection && !isCurrentPath && (
        <Pressable
          onPress={() => onPathSwitch?.(path)}
          style={({ pressed }) => ({
            backgroundColor: '#E2E8F0',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            marginBottom: 8,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ fontSize: 10, color: '#4A5568' }}>Switch</Text>
        </Pressable>
      )}

      {/* Node sections */}
      <View style={{ gap: 8 }}>
        {nodeSections.map((sectionNodes: JourneyNode[], sectionIndex: number) => (
          <View key={sectionIndex} style={{ gap: 4 }}>
            {sectionNodes.map((node) => {
              const isCompleted = progress.completedNodes.includes(node.id);
              const isCurrent = currentNode?.id === node.id;
              const isNext = node.prevNodeIds.includes(currentNode?.id || '');

              return <NodeItem key={node.id} node={node} isCompleted={isCompleted} isCurrent={isCurrent} isNext={isNext} pathColor={config.color} onPress={() => onNodePress?.(node)} />;
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

interface NodeItemProps {
  node: JourneyNode;
  isCompleted: boolean;
  isCurrent: boolean;
  isNext: boolean;
  pathColor: string;
  onPress: () => void;
}

const NodeItem: React.FC<NodeItemProps> = ({ node, isCompleted, isCurrent, isNext, pathColor, onPress }) => {
  const { theme } = useTheme();
  const nodeStyle = [
    {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: (theme.colors as any)?.background?.secondary || '#f5f5f5',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    isCompleted && [{ backgroundColor: 'white' }, { borderColor: pathColor }],
    isCurrent && [{ transform: [{ scale: 1.2 }] }, { backgroundColor: pathColor }],
    isNext && { borderColor: (theme.colors as any)?.text?.tertiary || '#999', borderStyle: 'dashed' as const },
    node.isMilestone && { width: 48, height: 48, borderRadius: 24 },
    node.isIntersection && { borderWidth: 3 },
  ];

  return (
    <Pressable onPress={onPress} disabled={!isNext && !isCurrent} style={({ pressed }) => [nodeStyle, pressed && { opacity: 0.7 }]}>
      <Text
        style={[
          {
            fontSize: 12,
            color: (theme.colors as any)?.text?.secondary || '#666',
            fontWeight: '600' as const,
          },
          isCurrent && { color: 'white' },
        ]}
      >
        {node.tier}
      </Text>
      {node.isMilestone && (
        <View
          style={[
            {
              position: 'absolute' as const,
              bottom: -4,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: 8,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
            },
            { backgroundColor: pathColor },
          ]}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 10,
            }}
          >
            ★
          </Text>
        </View>
      )}
    </Pressable>
  );
};
