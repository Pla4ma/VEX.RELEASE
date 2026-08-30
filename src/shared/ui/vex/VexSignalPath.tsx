import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

export interface VexSignalPathItem {
  title: string;
  subtitle: string;
}

interface VexSignalPathProps {
  items: readonly VexSignalPathItem[];
  currentIndex: number;
  fireThread?: boolean;
}

export function VexSignalPath({
  items,
  currentIndex,
  fireThread = false,
}: VexSignalPathProps): React.JSX.Element {
  const { theme } = useTheme();

  if (fireThread) {
    return (
      <View style={{ paddingVertical: theme.spacing[4], position: 'relative' }}>
        <View pointerEvents="none" style={{ backgroundColor: theme.colors.primary[500], bottom: theme.spacing[4], left: '50%', opacity: 0.34, position: 'absolute', top: theme.spacing[4], width: theme.spacing[1] }} />
        {items.map((item, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;
          const signalColor = isCurrent || isComplete ? theme.colors.primary[500] : theme.colors.primary[800];
          const isLeft = index % 2 === 0;
          const copy = <View style={{ alignItems: isLeft ? 'flex-end' : 'flex-start', flex: 1, justifyContent: 'center', paddingHorizontal: theme.spacing[3] }}><Text style={{ color: isCurrent ? theme.colors.primary[500] : theme.colors.text.primary, fontSize: theme.typography.ui.label.fontSize, fontWeight: theme.fontWeights.bold, letterSpacing: 1.4, textAlign: isLeft ? 'right' : 'left' }}>{item.title}</Text><Text color="text.tertiary" variant="bodySmall" style={{ textAlign: isLeft ? 'right' : 'left' }}>{item.subtitle}</Text></View>;
          const node = <View style={{ alignItems: 'center', height: isCurrent ? theme.spacing[16] : theme.spacing[12], justifyContent: 'center', width: isCurrent ? theme.spacing[16] : theme.spacing[12] }}>{isCurrent ? <View pointerEvents="none" style={{ borderColor: theme.colors.primary[500], borderRadius: theme.borderRadius.full, borderWidth: 2, height: theme.spacing[16], opacity: 0.38, position: 'absolute', width: theme.spacing[16] }} /> : null}<View style={{ alignItems: 'center', backgroundColor: isCurrent ? theme.colors.primary[500] : theme.colors.background.secondary, borderColor: signalColor, borderRadius: theme.borderRadius.full, borderWidth: isCurrent ? 2 : 1, height: isCurrent ? theme.spacing[12] : theme.spacing[10], justifyContent: 'center', shadowColor: isCurrent ? theme.colors.primary[500] : theme.colors.semantic.shadow, shadowOpacity: isCurrent ? 0.9 : 0, shadowRadius: theme.spacing[4], width: isCurrent ? theme.spacing[12] : theme.spacing[10] }}><Text style={{ color: isCurrent ? theme.colors.text.inverse : theme.colors.text.secondary, fontSize: theme.typography.body.small.fontSize, fontWeight: theme.fontWeights.bold }}>{index + 1}</Text></View></View>;
          return <View key={item.title} style={{ alignItems: 'center', flexDirection: 'row', minHeight: theme.spacing[16] }}>{isLeft ? copy : <View style={{ flex: 1 }} />}{node}{isLeft ? <View style={{ flex: 1 }} /> : copy}</View>;
        })}
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing[1] }}>
      {items.map((item, index) => {
        const isCurrent = index === currentIndex;
        const isComplete = index < currentIndex;
        const signalColor = isCurrent || isComplete
          ? theme.colors.primary[500]
          : theme.colors.primary[800];
        return (
          <View key={item.title} style={{ flexDirection: 'row', minHeight: 68 }}>
            <View style={{ alignItems: 'center', width: 48 }}>
              <View
                style={{
                  backgroundColor: isCurrent ? theme.colors.primary[500] : theme.colors.surface.card,
                  borderColor: signalColor,
                  borderRadius: theme.borderRadius.full,
                  borderWidth: isCurrent ? 2 : 1,
                  height: isCurrent ? 38 : 30,
                  justifyContent: 'center',
                  marginTop: isCurrent ? 0 : 4,
                  width: isCurrent ? 38 : 30,
                }}
              >
                <Text
                  style={{
                    color: isCurrent ? theme.colors.text.inverse : theme.colors.text.secondary,
                    fontSize: theme.typography.body.small.fontSize,
                    fontWeight: theme.fontWeights.bold,
                    textAlign: 'center',
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              {index < items.length - 1 ? (
                <View
                  style={{
                    backgroundColor: index < currentIndex ? theme.colors.primary[500] : theme.colors.border.DEFAULT,
                    flex: 1,
                    marginVertical: theme.spacing[1],
                    width: 1,
                  }}
                />
              ) : null}
            </View>
            <View style={{ flex: 1, gap: theme.spacing[1], paddingLeft: theme.spacing[3], paddingTop: isCurrent ? 0 : theme.spacing[1] }}>
              <Text
                style={{
                  color: isCurrent ? theme.colors.primary[500] : theme.colors.text.primary,
                  fontSize: theme.typography.ui.label.fontSize,
                  fontWeight: theme.fontWeights.bold,
                  letterSpacing: 1.4,
                }}
              >
                {item.title}
              </Text>
              <Text color="text.tertiary" variant="bodySmall">
                {item.subtitle}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
