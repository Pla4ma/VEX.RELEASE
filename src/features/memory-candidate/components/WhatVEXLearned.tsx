import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { LearnedItemRow } from './LearnedItemRow';
import type { LearnedItem, WhatVEXLearned } from '../schemas';

interface Props {
  data: WhatVEXLearned;
  onEditItem?: (item: LearnedItem) => void;
  onDeleteItem?: (item: LearnedItem) => void;
  onHideItem?: (item: LearnedItem) => void;
  onDismiss?: () => void;
}

export function WhatVEXLearnedView({
  data,
  onEditItem,
  onDeleteItem,
  onHideItem,
  onDismiss,
}: Props): React.ReactElement {
  const { theme } = useTheme();

  if (!data.hasEnoughEvidence) {
    return React.createElement(View, {
      style: {
        backgroundColor: theme.colors.semantic.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing[12],
        alignItems: 'center',
      },
    }, [
      React.createElement(Text, {
        key: 'title',
        style: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.body.large.fontSize,
          fontWeight: theme.fontWeights.semibold,
          marginBottom: theme.spacing[2],
        },
      }, 'What VEX learned'),
      React.createElement(Text, {
        key: 'empty',
        style: {
          color: theme.colors.text.secondary,
          fontSize: theme.typography.body.medium.fontSize,
          lineHeight: 20,
          textAlign: 'center',
        },
      }, 'VEX is still learning. Complete one more session to make this sharper.'),
    ]);
  }

  return React.createElement(View, {
    style: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[8],
      borderWidth: 1,
      borderColor: theme.colors.border.DEFAULT,
    },
  }, [
    React.createElement(View, {
      key: 'header',
      style: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
      },
    }, [
      React.createElement(Text, {
        key: 'title',
        style: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.heading.h4.fontSize,
          fontWeight: theme.fontWeights.semibold,
        },
      }, 'What VEX learned'),
      onDismiss &&
        React.createElement(Pressable, {
          key: 'dismiss',
          accessibilityLabel: 'Dismiss',
          accessibilityRole: 'button',
          onPress: onDismiss,
          style: [getMinTouchTargetStyle(), { padding: theme.spacing[2] }],
        }, React.createElement(Text, {
          style: {
            color: theme.colors.text.tertiary,
            fontSize: theme.typography.body.large.fontSize,
          },
        }, '\u00D7')),
    ]),
    ...data.items.map((item) =>
      React.createElement(LearnedItemRow, {
        key: item.id,
        item,
        onEditItem,
        onDeleteItem,
        onHideItem,
      }),
    ),
    React.createElement(View, {
      key: 'disclaimer',
      style: {
        backgroundColor: theme.colors.warning.light,
        borderRadius: theme.borderRadius.sm,
        padding: theme.spacing[2],
        marginTop: theme.spacing[2],
      },
    }, React.createElement(Text, {
      style: {
        color: theme.colors.warning.DEFAULT,
        fontSize: theme.typography.ui.caption.fontSize,
        lineHeight: 16,
      },
    }, data.disclaimer)),
  ]);
}
