/**
 * Life Simulation Component
 * 
 * Main UI component for life simulation features including avatar display,
 * life events, career information, relationships, achievements, and life statistics.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { useLifeSimulation, Avatar, LifeEvent, Career, Relationship, Achievement } from '../hooks/useLifeSimulation';

interface LifeSimulationProps {
  userId: string;
  onCreateAvatar?: () => void;
  onManageCareer?: () => void;
  onManageRelationships?: () => void;
  onViewAchievements?: () => void;
  onLifeEventAction?: (eventId: string, action: string) => void;
}

export function LifeSimulation({
  userId,
  onCreateAvatar,
  onManageCareer,
  onManageRelationships,
  onViewAchievements,
  onLifeEventAction,
}: LifeSimulationProps) {
  const {
    avatar,
    lifeEvents,
    currentCareer,
    relationships,
    achievements,
    lifeStats,
    loading,
    error,
    createAvatar,
    updateStats,
    generateLifeEvent,
    resolveEvent,
    skipEvent,
    startCareer,
    promoteCareer,
    quitCareer,
    createRelationship,
    updateRelationship,
    endRelationship,
    checkAchievements,
    unlockAchievement,
    ageUp,
    saveGame,
    loadGame,
    resetGame,
  } = useLifeSimulation(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'career' | 'relationships' | 'achievements' | 'stats'>('overview');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEventChoice = (eventId: string, choiceId: string) => {
    resolveEvent(eventId, choiceId);
    if (onLifeEventAction) {
      onLifeEventAction(eventId, choiceId);
    }
  };

  const handleSkipEvent = (eventId: string) => {
    skipEvent(eventId);
  };

  const renderAvatarCard = () => {
    if (!avatar) {
      return (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyTitle}>No Avatar Created</Text>
            <Text style={styles.emptyDescription}>Create your avatar to start your life simulation journey</Text>
            <Button
              title="Create Avatar"
              onPress={onCreateAvatar || createAvatar}
              variant="primary"
              style={styles.createButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <View style={styles.avatarHeader}>
          <Text style={styles.avatarName}>{avatar.name}</Text>
          <Badge text={`Age ${avatar.age}`} variant="primary" />
        </View>
        
        <View style={styles.avatarInfo}>
          <View style={styles.appearanceInfo}>
            <Text style={styles.infoTitle}>Appearance</Text>
            <Text style={styles.infoText}>Hair: {avatar.appearance.hairColor}</Text>
            <Text style={styles.infoText}>Eyes: {avatar.appearance.eyeColor}</Text>
            <Text style={styles.infoText}>Height: {avatar.appearance.height}cm</Text>
            <Text style={styles.infoText}>Build: {avatar.appearance.build}</Text>
          </View>
          
          <View style={styles.personalityInfo}>
            <Text style={styles.infoTitle}>Personality</Text>
            <View style={styles.traitsContainer}>
              {avatar.personality.traits.map((trait, index) => (
                <Badge key={index} text={trait} variant="secondary" style={styles.traitBadge} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Life Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Health</Text>
              <ProgressBar progress={avatar.stats.health} color="#E74C3C" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Happiness</Text>
              <ProgressBar progress={avatar.stats.happiness} color="#F39C12" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Intelligence</Text>
              <ProgressBar progress={avatar.stats.intelligence} color="#3498DB" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Social</Text>
              <ProgressBar progress={avatar.stats.social} color="#9B59B6" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Creativity</Text>
              <ProgressBar progress={avatar.stats.creativity} color="#27AE60" />
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Energy</Text>
              <ProgressBar progress={avatar.stats.energy} color="#E67E22" />
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderLifeEvents = () => {
    const unresolvedEvents = lifeEvents.filter(event => !event.resolved);
    const currentEvent = unresolvedEvents[0];

    if (!currentEvent) {
      return (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Current Events</Text>
            <Text style={styles.emptyDescription}>Generate a new life event to continue your journey</Text>
            <Button
              title="Generate Event"
              onPress={generateLifeEvent}
              variant="primary"
              style={styles.createButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventType}>{currentEvent.type}</Text>
          <Badge text="Active" variant="warning" />
        </View>
        
        <Text style={styles.eventTitle}>{currentEvent.title}</Text>
        <Text style={styles.eventDescription}>{currentEvent.description}</Text>
        
        {currentEvent.impact && (
          <View style={styles.impactContainer}>
            <Text style={styles.impactTitle}>Potential Impact:</Text>
            <View style={styles.impactList}>
              {Object.entries(currentEvent.impact).map(([key, value]) => (
                <Text key={key} style={styles.impactText}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}: {value > 0 ? '+' : ''}{value}
                </Text>
              ))}
            </View>
          </View>
        )}
        
        {currentEvent.choices && (
          <View style={styles.choicesContainer}>
            <Text style={styles.choicesTitle}>Choose Your Action:</Text>
            {currentEvent.choices.map((choice) => (
              <Button
                key={choice.id}
                title={choice.text}
                onPress={() => handleEventChoice(currentEvent.id, choice.id)}
                variant="secondary"
                style={styles.choiceButton}
              />
            ))}
          </View>
        )}
        
        <View style={styles.eventActions}>
          <Button
            title="Skip Event"
            onPress={() => handleSkipEvent(currentEvent.id)}
            variant="secondary"
            style={styles.skipButton}
          />
        </View>
      </Card>
    );
  };

  const renderCareer = () => {
    if (!currentCareer) {
      return (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>No Career</Text>
            <Text style={styles.emptyDescription}>Start a career to earn money and gain experience</Text>
            <Button
              title="Browse Careers"
              onPress={onManageCareer}
              variant="primary"
              style={styles.createButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <View style={styles.careerHeader}>
          <Text style={styles.careerName}>{currentCareer.name}</Text>
          <Badge text={`Level ${currentCareer.level}`} variant="primary" />
        </View>
        
        <View style={styles.careerInfo}>
          <Text style={styles.careerCategory}>{currentCareer.category}</Text>
          <Text style={styles.careerSalary}>${currentCareer.salary.toLocaleString()}/year</Text>
        </View>
        
        <View style={styles.experienceContainer}>
          <Text style={styles.experienceTitle}>Experience</Text>
          <ProgressBar progress={(currentCareer.experience / 1000) * 100} color="#3498DB" />
          <Text style={styles.experienceText}>{currentCareer.experience} / 1000 XP</Text>
        </View>
        
        <View style={styles.careerActions}>
          <Button
            title="Promote"
            onPress={promoteCareer}
            variant="primary"
            style={styles.promoteButton}
            disabled={currentCareer.level >= currentCareer.progression.length}
          />
          <Button
            title="Change Career"
            onPress={onManageCareer}
            variant="secondary"
            style={styles.changeButton}
          />
          <Button
            title="Quit Job"
            onPress={quitCareer}
            variant="danger"
            style={styles.quitButton}
          />
        </View>
      </Card>
    );
  };

  const renderRelationships = () => {
    const activeRelationships = relationships.filter(rel => rel.status === 'active');

    if (activeRelationships.length === 0) {
      return (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No Relationships</Text>
            <Text style={styles.emptyDescription}>Build relationships to improve your social life</Text>
            <Button
              title="Meet People"
              onPress={onManageRelationships}
              variant="primary"
              style={styles.createButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Text style={styles.relationshipsTitle}>Active Relationships ({activeRelationships.length})</Text>
        <View style={styles.relationshipsList}>
          {activeRelationships.map((relationship) => (
            <View key={relationship.id} style={styles.relationshipItem}>
              <View style={styles.relationshipHeader}>
                <Text style={styles.relationshipName}>{relationship.name}</Text>
                <Badge text={relationship.type} variant="secondary" />
              </View>
              <Text style={styles.relationshipAge}>Age {relationship.age}</Text>
              <View style={styles.relationshipLevel}>
                <Text style={styles.relationshipLevelText}>Level {relationship.relationshipLevel}</Text>
                <ProgressBar progress={(relationship.relationshipLevel / 100) * 100} color="#9B59B6" />
              </View>
              <View style={styles.relationshipActions}>
                <Button
                  title="Interact"
                  onPress={() => onManageRelationships && onManageRelationships()}
                  variant="secondary"
                  style={styles.interactButton}
                />
              </View>
            </View>
          ))}
        </View>
        <Button
          title="Manage All Relationships"
          onPress={onManageRelationships}
          variant="primary"
          style={styles.manageButton}
        />
      </Card>
    );
  };

  const renderAchievements = () => {
    const completedAchievements = achievements.filter(ach => ach.completed);
    const inProgressAchievements = achievements.filter(ach => !ach.completed);

    return (
      <Card style={styles.card}>
        <View style={styles.achievementsHeader}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <Badge text={`${completedAchievements.length}/${achievements.length}`} variant="primary" />
        </View>
        
        <View style={styles.achievementsList}>
          {completedAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Badge text="✓" variant="success" />
              </View>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <Text style={styles.achievementReward}>Reward: {achievement.reward.points} points</Text>
            </View>
          ))}
          
          {inProgressAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Badge text={`${Math.round(achievement.progress)}%`} variant="warning" />
              </View>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <ProgressBar progress={achievement.progress} color="#F39C12" />
            </View>
          ))}
        </View>
        
        <Button
          title="View All Achievements"
          onPress={onViewAchievements}
          variant="primary"
          style={styles.viewButton}
        />
      </Card>
    );
  };

  const renderLifeStats = () => {
    return (
      <Card style={styles.card}>
        <Text style={styles.statsOverviewTitle}>Life Statistics</Text>
        <View style={styles.statsOverviewGrid}>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>{lifeStats.totalEvents}</Text>
            <Text style={styles.statOverviewLabel}>Life Events</Text>
          </View>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>{lifeStats.careerChanges}</Text>
            <Text style={styles.statOverviewLabel}>Career Changes</Text>
          </View>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>{lifeStats.relationshipsFormed}</Text>
            <Text style={styles.statOverviewLabel}>Relationships</Text>
          </View>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>{lifeStats.achievementsUnlocked}</Text>
            <Text style={styles.statOverviewLabel}>Achievements</Text>
          </View>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>${lifeStats.moneyEarned.toLocaleString()}</Text>
            <Text style={styles.statOverviewLabel}>Money Earned</Text>
          </View>
          <View style={styles.statOverviewItem}>
            <Text style={styles.statOverviewValue}>{lifeStats.lifeYears}</Text>
            <Text style={styles.statOverviewLabel}>Life Years</Text>
          </View>
        </View>
        
        <View style={styles.gameActions}>
          <Button
            title="Age Up (+1 Year)"
            onPress={ageUp}
            variant="primary"
            style={styles.ageUpButton}
          />
          <Button
            title="Save Game"
            onPress={saveGame}
            variant="secondary"
            style={styles.saveButton}
          />
          <Button
            title="Load Game"
            onPress={loadGame}
            variant="secondary"
            style={styles.loadButton}
          />
          <Button
            title="Reset Game"
            onPress={resetGame}
            variant="danger"
            style={styles.resetButton}
          />
        </View>
      </Card>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderAvatarCard()}
            {avatar && renderLifeEvents()}
          </Animated.View>
        );
      case 'events':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderLifeEvents()}
          </Animated.View>
        );
      case 'career':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderCareer()}
          </Animated.View>
        );
      case 'relationships':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderRelationships()}
          </Animated.View>
        );
      case 'achievements':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderAchievements()}
          </Animated.View>
        );
      case 'stats':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderLifeStats()}
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Life Simulation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={loadGame} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['overview', 'events', 'career', 'relationships', 'achievements', 'stats'].map((tab) => (
          <Button
            key={tab}
            title={tab.charAt(0).toUpperCase() + tab.slice(1)}
            onPress={() => setActiveTab(tab as any)}
            variant={activeTab === tab ? 'primary' : 'secondary'}
            style={styles.tabButton}
          />
        ))}
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  avatarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  avatarInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  appearanceInfo: {
    flex: 1,
  },
  personalityInfo: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  traitBadge: {
    marginRight: 4,
  },
  statsContainer: {
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statsGrid: {
    gap: 12,
  },
  statItem: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  impactContainer: {
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  impactList: {
    gap: 4,
  },
  impactText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  choicesContainer: {
    marginBottom: 16,
  },
  choicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  choiceButton: {
    marginBottom: 8,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 16,
  },
  careerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  careerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  careerInfo: {
    marginBottom: 16,
  },
  careerCategory: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  careerSalary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  experienceContainer: {
    marginBottom: 20,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  careerActions: {
    gap: 12,
  },
  promoteButton: {
    // Additional styling handled by Button component
  },
  changeButton: {
    // Additional styling handled by Button component
  },
  quitButton: {
    // Additional styling handled by Button component
  },
  relationshipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  relationshipsList: {
    gap: 12,
  },
  relationshipItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  relationshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  relationshipName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  relationshipAge: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  relationshipLevel: {
    marginBottom: 12,
  },
  relationshipLevelText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  relationshipActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  interactButton: {
    paddingHorizontal: 16,
  },
  manageButton: {
    marginTop: 16,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    lineHeight: 18,
  },
  achievementReward: {
    fontSize: 12,
    color: '#27AE60',
  },
  viewButton: {
    marginTop: 16,
  },
  statsOverviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  statsOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statOverviewItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statOverviewValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9B59B6',
    marginBottom: 4,
  },
  statOverviewLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  gameActions: {
    gap: 12,
  },
  ageUpButton: {
    // Additional styling handled by Button component
  },
  saveButton: {
    // Additional styling handled by Button component
  },
  loadButton: {
    // Additional styling handled by Button component
  },
  resetButton: {
    // Additional styling handled by Button component
  },
});
