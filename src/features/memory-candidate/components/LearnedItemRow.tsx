import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { getMinTouchTargetStyle } from '@/utils/touchTarget';
import type { LearnedItem } from '../schemas';

function confidenceColor(
  confidence: LearnedItem['confidence'],
  theme: ReturnType<typeof useTheme>['theme'],
): string {
  switch (confidence) {
    case 'strong':
      return theme.colors.primary[500];
    case 'medium':
      return theme.colors.text.secondary;
    case 'weak':
      return theme.colors.text.tertiary;
  }
}

function confidenceLabel(confidence: LearnedItem['confidence']): string {
  switch (confidence) {
    case 'strong':
      return 'Strong evidence';
    case 'medium':
      return 'Some evidence';
    case 'weak':
      return 'Limited evidence';
  }
}

export function LearnedItemRow({
  item,
  onEditItem,
  onDeleteItem,
  onHideItem,
}: {
  item: LearnedItem;
  onEditItem?: (item: LearnedItem) => void;
  onDeleteItem?: (item: LearnedItem) => void;
  onHideItem?: (item: LearnedItem) => void;
}): React.ReactElement {
  const { theme } = useTheme();
  if (item.deletedByUser || !item.userVisible) {
    return React.createElement(React.Fragment, null);
  }

  return React.createElement(View, {
    style: {
      backgroundColor: theme.colors.semantic.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing[2],
      padding: theme.spacing[4],
      borderLeftWidth: 3,
      borderLeftColor: confidenceColor(item.confidence, theme),
    },
  }, [
    React.createElement(View, {
      key: 'row',
      style: { flexDirection: 'row', alignItems: 'flex-start' },
    }, [
      React.createElement(View, { key: 'content', style: { flex: 1 } }, [
        React.createElement(Text, {
          key: 'observation',
          style: {
            color: theme.colors.text.primary,
            fontSize: theme.typography.body.medium.fontSize ?? 16,
            fontWeight: theme.fontWeights.semibold,
            lineHeight: 20,
            marginBottom: theme.spacing[1],
          },
        }, item.observation),
        React.createElement(Text, {
          key: 'confidence',
          style: {
            color: confidenceColor(item.confidence, theme),
            fontSize: theme.typography.ui.caption.fontSize ?? 12,
            fontWeight: theme.fontWeights.medium,
            marginBottom: theme.spacing[2],
          },
        }, confidenceLabel(item.confidence)),
        React.createElement(Text, {
          key: 'evidence',
          style: {
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body.small.fontSize ?? 14,
            lineHeight: 18,
          },
        }, item.evidence),
        item.recommendedAction &&
          React.createElement(Text, {
            key: 'action',
            style: {
              color: theme.colors.primary[500],
              fontSize: theme.typography.body.small.fontSize ?? 14,
              fontWeight: theme.fontWeights.medium,
              lineHeight: 18,
              marginTop: theme.spacing[2],
            },
          }, item.recommendedAction),
        item.humilityNote &&
          React.createElement(Text, {
            key: 'humility',
            style: {
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.ui.caption.fontSize ?? 11,
              fontStyle: 'italic',
              lineHeight: 14,
              marginTop: theme.spacing[1],
            },
          }, item.humilityNote),
      ]),
    ]),
    React.createElement(View, {
      key: 'actions',
      style: {
        flexDirection: 'row',
        marginTop: theme.spacing[2],
        gap: theme.spacing[2],
      },
    }, [
      onEditItem &&
        React.createElement(Pressable, {
          key: 'edit',
          accessibilityLabel: 'Edit this observation',
          accessibilityRole: 'button',
          onPress: () => onEditItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.primary[500],
            fontSize: theme.typography.body.small.fontSize ?? 14,
            fontWeight: theme.fontWeights.medium,
          },
        }, 'Edit')),
      onHideItem &&
        React.createElement(Pressable, {
          key: 'hide',
          accessibilityLabel: 'Hide this observation',
          accessibilityRole: 'button',
          accessibilityHint: 'Removes this item from view but keeps the data',
          onPress: () => onHideItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.body.small.fontSize ?? 14,
          },
        }, 'Hide')),
      onDeleteItem &&
        React.createElement(Pressable, {
          key: 'delete',
          accessibilityLabel: 'Delete this observation',
          accessibilityRole: 'button',
          accessibilityHint: 'Permanently removes this observation',
          onPress: () => onDeleteItem(item),
          style: [
            getMinTouchTargetStyle(),
            { paddingVertical: 6, paddingHorizontal: 12 },
          ],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.error.DEFAULT,
            fontSize: theme.typography.body.small.fontSize ?? 14,
          },
        }, 'Delete')),
    ]),
  ]);
}
