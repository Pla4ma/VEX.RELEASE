/**
 * Collaboration Empty Component
 * 
 * Empty state component for realtime collaboration when no data is available,
 * with helpful guidance and action prompts.
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '../../../components/primitives/Button';

interface CollaborationEmptyProps {
  type?: 'sessions' | 'workspaces' | 'participants' | 'immersive' | 'all';
  onAction?: () => void;
  customMessage?: string;
  customIcon?: string;
}

export function CollaborationEmpty({ 
  type = 'all', 
  onAction,
  customMessage,
  customIcon 
}: CollaborationEmptyProps) {
  const getEmptyState = () => {
    switch (type) {
      case 'sessions':
        return {
          icon: customIcon || '🤝',
          title: 'No Collaboration Sessions',
          message: customMessage || 'Start your first collaboration session to work together in real-time.',
          actionText: 'Start Session',
          tips: [
            'Create different types of sessions',
            'Invite team members to join',
            'Use video and audio for better communication',
          ],
        };
      case 'workspaces':
        return {
          icon: customIcon || '🏢',
          title: 'No Workspaces Available',
          message: customMessage || 'Create or join workspaces to collaborate with your team.',
          actionText: 'Create Workspace',
          tips: [
            'Organize projects in workspaces',
            'Share documents and resources',
            'Collaborate with team members',
          ],
        };
      case 'participants':
        return {
          icon: customIcon || '👥',
          title: 'No Participants Online',
          message: customMessage || 'Invite team members to join your collaboration sessions.',
          actionText: 'Invite Members',
          tips: [
            'Invite team members via email',
            'Share workspace links',
            'Schedule collaboration sessions',
          ],
        };
      case 'immersive':
        return {
          icon: customIcon || '🥽',
          title: 'No Immersive Environments',
          message: customMessage || 'Enter immersive environments for enhanced collaboration experiences.',
          actionText: 'Enter Environment',
          tips: [
            'VR environments for spatial collaboration',
            'AR overlays for real-world interaction',
            'Immersive meeting spaces',
          ],
        };
      default:
        return {
          icon: customIcon || '🤝',
          title: 'Welcome to Realtime Collaboration',
          message: customMessage || 'Start collaborating with your team using video, audio, and shared workspaces.',
          actionText: 'Get Started',
          tips: [
            'Real-time video and audio calls',
            'Shared workspaces and documents',
            'AI-powered facilitation',
            'Immersive VR/AR environments',
          ],
        };
    }
  };

  const emptyState = getEmptyState();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{emptyState.icon}</Text>
        </View>

        {/* Title and Message */}
        <Text style={styles.title}>{emptyState.title}</Text>
        <Text style={styles.message}>{emptyState.message}</Text>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <Button
            title={emptyState.actionText}
            onPress={onAction || (() => {})}
            style={styles.actionButton}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Quick Tips:</Text>
          {emptyState.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Collaboration Features:</Text>
          <View style={styles.featureGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📹</Text>
              <Text style={styles.featureName}>Video Calls</Text>
              <Text style={styles.featureDescription}>Face-to-face collaboration</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🎤</Text>
              <Text style={styles.featureName}>Audio Calls</Text>
              <Text style={styles.featureDescription}>Voice collaboration</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📝</Text>
              <Text style={styles.featureName}>Shared Documents</Text>
              <Text style={styles.featureDescription}>Real-time document editing</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤖</Text>
              <Text style={styles.featureName}>AI Facilitator</Text>
              <Text style={styles.featureDescription}>Smart meeting assistance</Text>
            </View>
          </View>
        </View>

        {/* Session Types */}
        <View style={styles.sessionTypesContainer}>
          <Text style={styles.sessionTypesTitle}>Available Session Types:</Text>
          <View style={styles.sessionTypesList}>
            <View style={styles.sessionTypeItem}>
              <Text style={styles.sessionTypeIcon}>🤝</Text>
              <View style={styles.sessionTypeInfo}>
                <Text style={styles.sessionTypeName}>Collaboration</Text>
                <Text style={styles.sessionTypeDesc}>General teamwork</Text>
              </View>
            </View>
            <View style={styles.sessionTypeItem}>
              <Text style={styles.sessionTypeIcon}>💡</Text>
              <View style={styles.sessionTypeInfo}>
                <Text style={styles.sessionTypeName}>Brainstorm</Text>
                <Text style={styles.sessionTypeDesc}>Creative sessions</Text>
              </View>
            </View>
            <View style={styles.sessionTypeItem}>
              <Text style={styles.sessionTypeIcon}>📅</Text>
              <View style={styles.sessionTypeInfo}>
                <Text style={styles.sessionTypeName}>Meeting</Text>
                <Text style={styles.sessionTypeDesc}>Structured discussions</Text>
              </View>
            </View>
            <View style={styles.sessionTypeItem}>
              <Text style={styles.sessionTypeIcon}>🎯</Text>
              <View style={styles.sessionTypeInfo}>
                <Text style={styles.sessionTypeName}>Workshop</Text>
                <Text style={styles.sessionTypeDesc}>Interactive learning</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <Text style={styles.encouragementText}>
            Start collaborating with your team in real-time. Share ideas, work together on documents, and communicate seamlessly.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionContainer: {
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    marginBottom: 32,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#3498DB',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 32,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  sessionTypesContainer: {
    marginBottom: 32,
    width: '100%',
  },
  sessionTypesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  sessionTypesList: {
    gap: 12,
  },
  sessionTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  sessionTypeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sessionTypeInfo: {
    flex: 1,
  },
  sessionTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  sessionTypeDesc: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  encouragementContainer: {
    backgroundColor: '#E8F4FD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B3D9F2',
    width: '100%',
  },
  encouragementText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 20,
  },
});
