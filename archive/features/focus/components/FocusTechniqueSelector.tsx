/**
 * Focus Technique Selector Component
 *
 * UI for selecting and configuring focus techniques.
 * Supports Pomodoro, Flowtime, 52/17, Deep Work, Custom.
 *
 * @phase 4
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { Icon } from '../../../components/Icon';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('focus:technique-selector');

// ============================================================================
// Types
// ============================================================================

interface FocusTechnique {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration?: number; // minutes
  sessionsUntilLongBreak?: number;
  isCustom: boolean;
  isRecommended?: boolean;
  benefits: string[];
  bestFor: string[];
}

interface TechniqueConfig {
  workDuration: number;
  breakDuration: number;
  longBreakDuration?: number;
  sessionsUntilLongBreak?: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

// ============================================================================
// Component
// ============================================================================

interface FocusTechniqueSelectorProps {
  selectedTechnique?: string;
  onTechniqueSelect: (technique: FocusTechnique) => void;
  onConfigChange?: (techniqueId: string, config: TechniqueConfig) => void;
  showConfig?: boolean;
}

export const FocusTechniqueSelector: React.FC<FocusTechniqueSelectorProps> = ({
  selectedTechnique,
  onTechniqueSelect,
  onConfigChange,
  showConfig = false,
}) => {
  const theme = useTheme();
  const [config, setConfig] = React.useState<Record<string, TechniqueConfig>>({});

  // Predefined focus techniques
  const techniques: FocusTechnique[] = useMemo(() => [
    {
      id: 'pomodoro',
      name: 'Pomodoro',
      description: 'Classic 25-minute work sessions with 5-minute breaks',
      icon: 'clock',
      duration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      isCustom: false,
      isRecommended: true,
      benefits: ['Prevents burnout', 'Maintains focus', 'Easy to follow'],
      bestFor: ['Tasks requiring deep focus', 'Learning new material', 'Writing'],
    },
    {
      id: 'flowtime',
      name: 'Flowtime',
      description: 'Work until you need a break, then rest as needed',
      icon: 'zap',
      duration: 0, // Variable
      breakDuration: 0, // Variable
      isCustom: false,
      benefits: ['Natural breaks', 'Follows your energy', 'Less rigid'],
      bestFor: ['Creative work', 'Problem-solving', 'When energy fluctuates'],
    },
    {
      id: '52-17',
      name: '52/17',
      description: '52 minutes of focused work followed by 17 minutes of rest',
      icon: 'activity',
      duration: 52,
      breakDuration: 17,
      isCustom: false,
      benefits: ['Longer focus periods', 'Adequate rest', 'Optimized for productivity'],
      bestFor: ['Complex projects', 'Deep work sessions', 'Research tasks'],
    },
    {
      id: 'deep-work',
      name: 'Deep Work',
      description: 'Extended 90-minute sessions for maximum concentration',
      icon: 'brain',
      duration: 90,
      breakDuration: 20,
      isCustom: false,
      benefits: ['Maximum focus', 'Fewer interruptions', 'Complex task mastery'],
      bestFor: ['Difficult subjects', 'Creative projects', 'Strategic planning'],
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Create your own perfect focus routine',
      icon: 'settings',
      duration: 30,
      breakDuration: 10,
      isCustom: true,
      benefits: ['Personalized', 'Flexible', 'Adapts to your needs'],
      bestFor: ['Unique preferences', 'Specific requirements', 'Experimentation'],
    },
  ], []);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleTechniqueSelect = useCallback((technique: FocusTechnique) => {
    onTechniqueSelect(technique);
    debug.info('Focus technique selected', { technique: technique.id });
  }, [onTechniqueSelect]);

  const handleConfigChange = useCallback((
    techniqueId: string,
    field: keyof TechniqueConfig,
    value: unknown
  ) => {
    const newConfig = {
      ...config[techniqueId],
      [field]: value,
    };
    
    setConfig(prev => ({
      ...prev,
      [techniqueId]: newConfig,
    }));

    if (onConfigChange) {
      onConfigChange(techniqueId, newConfig);
    }
    
    debug.info('Technique config changed', { techniqueId, field, value });
  }, [config, onConfigChange]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const getTechniqueConfig = (techniqueId: string): TechniqueConfig => {
    if (config[techniqueId]) {
      return config[techniqueId];
    }

    // Default configs for each technique
    const defaults: Record<string, TechniqueConfig> = {
      pomodoro: {
        workDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: true,
        autoStartWork: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
      flowtime: {
        workDuration: 0, // Variable
        breakDuration: 0, // Variable
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
      },
      '52-17': {
        workDuration: 52,
        breakDuration: 17,
        autoStartBreaks: true,
        autoStartWork: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
      'deep-work': {
        workDuration: 90,
        breakDuration: 20,
        autoStartBreaks: true,
        autoStartWork: true,
        soundEnabled: true,
        notificationsEnabled: true,
      },
      custom: {
        workDuration: 30,
        breakDuration: 10,
        autoStartBreaks: false,
        autoStartWork: false,
        soundEnabled: true,
        notificationsEnabled: true,
      },
    };

    return defaults[techniqueId] || defaults.custom;
  };

  // ============================================================================
  // Render Technique Card
  // ============================================================================

  const renderTechniqueCard = (technique: FocusTechnique) => {
    const isSelected = selectedTechnique === technique.id;
    const currentConfig = getTechniqueConfig(technique.id);

    return (
      <Card
        key={technique.id}
        variant={isSelected ? 'elevated' : 'outlined'}
        padding="lg"
        background={isSelected ? 'card' : 'secondary'}
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT,
        }}
      >
        <VStack gap="md">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack gap="sm" align="center">
              <Icon
                name={technique.icon}
                size={24}
                color={isSelected ? theme.colors.primary.DEFAULT : theme.colors.text.secondary}
              />
              <VStack gap="xs">
                <Text variant="body" weight="semibold">
                  {technique.name}
                </Text>
                {technique.isRecommended && (
                  <View
                    style={{
                      backgroundColor: theme.colors.success.DEFAULT,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: theme.spacing.xs,
                      borderRadius: theme.radius.sm,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text
                      variant="caption"
                      color="inverse"
                      weight="semibold"
                    >
                      RECOMMENDED
                    </Text>
                  </View>
                )}
              </VStack>
            </HStack>
            
            {isSelected && (
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.primary.DEFAULT,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="check" size={16} color={theme.colors.text.inverse} />
              </View>
            )}
          </HStack>

          {/* Description */}
          <Text variant="body" color="secondary">
            {technique.description}
          </Text>

          {/* Duration Info */}
          {!technique.isCustom && (
            <View
              style={{
                backgroundColor: theme.colors.background.secondary,
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
              }}
            >
              <HStack justify="space-around" align="center">
                <VStack align="center" gap="xs">
                  <Text variant="caption" color="secondary">
                    Work
                  </Text>
                  <Text variant="body" weight="semibold">
                    {technique.duration > 0 ? `${technique.duration}m` : 'Variable'}
                  </Text>
                </VStack>
                <VStack align="center" gap="xs">
                  <Text variant="caption" color="secondary">
                    Break
                  </Text>
                  <Text variant="body" weight="semibold">
                    {technique.breakDuration > 0 ? `${technique.breakDuration}m` : 'Variable'}
                  </Text>
                </VStack>
                {technique.longBreakDuration && (
                  <VStack align="center" gap="xs">
                    <Text variant="caption" color="secondary">
                      Long Break
                    </Text>
                    <Text variant="body" weight="semibold">
                      {technique.longBreakDuration}m
                    </Text>
                  </VStack>
                )}
              </HStack>
            </View>
          )}

          {/* Benefits */}
          <VStack gap="xs">
            <Text variant="body" size="sm" weight="semibold">
              Benefits:
            </Text>
            <HStack gap="sm" flexWrap="wrap">
              {technique.benefits.map((benefit, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                  }}
                >
                  <Text variant="caption" color="secondary">
                    {benefit}
                  </Text>
                </View>
              ))}
            </HStack>
          </VStack>

          {/* Best For */}
          <VStack gap="xs">
            <Text variant="body" size="sm" weight="semibold">
              Best for:
            </Text>
            <Text variant="body" color="secondary">
              {technique.bestFor.join(', ')}
            </Text>
          </VStack>

          {/* Configuration */}
          {showConfig && isSelected && (
            <View
              style={{
                backgroundColor: theme.colors.background.secondary,
                padding: theme.spacing.md,
                borderRadius: theme.radius.md,
              }}
            >
              <VStack gap="md">
                <Text variant="body" weight="semibold">
                  Configuration
                </Text>

                {!technique.isCustom && technique.duration > 0 && (
                  <HStack justify="space-between" align="center">
                    <Text variant="body" size="sm">
                      Work Duration
                    </Text>
                    <HStack gap="sm" align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleConfigChange(
                          technique.id,
                          'workDuration',
                          Math.max(1, currentConfig.workDuration - 5)
                        )}
                      >
                        <Icon name="minus" size={16} color={theme.colors.text.secondary} />
                      </Button>
                      <Text variant="body" weight="semibold" style={{ minWidth: 40 }}>
                        {currentConfig.workDuration}m
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleConfigChange(
                          technique.id,
                          'workDuration',
                          currentConfig.workDuration + 5
                        )}
                      >
                        <Icon name="plus" size={16} color={theme.colors.text.secondary} />
                      </Button>
                    </HStack>
                  </HStack>
                )}

                {!technique.isCustom && technique.breakDuration > 0 && (
                  <HStack justify="space-between" align="center">
                    <Text variant="body" size="sm">
                      Break Duration
                    </Text>
                    <HStack gap="sm" align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleConfigChange(
                          technique.id,
                          'breakDuration',
                          Math.max(1, currentConfig.breakDuration - 5)
                        )}
                      >
                        <Icon name="minus" size={16} color={theme.colors.text.secondary} />
                      </Button>
                      <Text variant="body" weight="semibold" style={{ minWidth: 40 }}>
                        {currentConfig.breakDuration}m
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleConfigChange(
                          technique.id,
                          'breakDuration',
                          currentConfig.breakDuration + 5
                        )}
                      >
                        <Icon name="plus" size={16} color={theme.colors.text.secondary} />
                      </Button>
                    </HStack>
                  </HStack>
                )}

                <HStack justify="space-between" align="center">
                  <Text variant="body" size="sm">
                    Auto-start Breaks
                  </Text>
                  <Button
                    variant={currentConfig.autoStartBreaks ? 'primary' : 'ghost'}
                    size="sm"
                    onPress={() => handleConfigChange(
                      technique.id,
                      'autoStartBreaks',
                      !currentConfig.autoStartBreaks
                    )}
                  >
                    {currentConfig.autoStartBreaks ? 'On' : 'Off'}
                  </Button>
                </HStack>

                <HStack justify="space-between" align="center">
                  <Text variant="body" size="sm">
                    Sound Effects
                  </Text>
                  <Button
                    variant={currentConfig.soundEnabled ? 'primary' : 'ghost'}
                    size="sm"
                    onPress={() => handleConfigChange(
                      technique.id,
                      'soundEnabled',
                      !currentConfig.soundEnabled
                    )}
                  >
                    {currentConfig.soundEnabled ? 'On' : 'Off'}
                  </Button>
                </HStack>

                <HStack justify="space-between" align="center">
                  <Text variant="body" size="sm">
                    Notifications
                  </Text>
                  <Button
                    variant={currentConfig.notificationsEnabled ? 'primary' : 'ghost'}
                    size="sm"
                    onPress={() => handleConfigChange(
                      technique.id,
                      'notificationsEnabled',
                      !currentConfig.notificationsEnabled
                    )}
                  >
                    {currentConfig.notificationsEnabled ? 'On' : 'Off'}
                  </Button>
                </HStack>
              </VStack>
            </View>
          )}

          {/* Select Button */}
          {!isSelected && (
            <Button
              variant="primary"
              onPress={() => handleTechniqueSelect(technique)}
              leftIcon={<Icon name="check" size={16} color={theme.colors.text.inverse} />}
            >
              Select Technique
            </Button>
          )}
        </VStack>
      </Card>
    );
  };

  // ============================================================================
  // Main UI
  // ============================================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
    >
      <VStack gap="lg">
        {/* Header */}
        <VStack gap="sm">
          <Text variant="heading">Focus Techniques</Text>
          <Text variant="body" color="secondary">
            Choose a focus method that works best for your study style and energy patterns.
          </Text>
        </VStack>

        {/* Technique Cards */}
        <VStack gap="md">
          {techniques.map(renderTechniqueCard)}
        </VStack>

        {/* Tips Section */}
        <Card variant="outlined" padding="md" background="secondary">
          <VStack gap="sm">
            <Text variant="heading" size="sm">
              Choosing the Right Technique
            </Text>
            <Text variant="body" color="secondary">
              • Start with Pomodoro if you're new to focus techniques
            </Text>
            <Text variant="body" color="secondary">
              • Use Flowtime if you prefer natural break timing
            </Text>
            <Text variant="body" color="secondary">
              • Try 52/17 for longer, structured work sessions
            </Text>
            <Text variant="body" color="secondary">
              • Use Deep Work for complex, challenging material
            </Text>
            <Text variant="body" color="secondary">
              • Create Custom techniques for your unique needs
            </Text>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
};
