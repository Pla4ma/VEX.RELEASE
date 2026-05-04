/**
 * Collaboration Error Component
 * 
 * Error state component for realtime collaboration with different error types,
 * retry functionality, and helpful error messages.
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Card } from '../../../components/primitives/Card';

interface CollaborationErrorProps {
  error: string;
  type?: 'network' | 'permission' | 'session' | 'video' | 'audio' | 'workspace' | 'immersive' | 'unknown';
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

export function CollaborationError({ 
  error, 
  type = 'unknown',
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3 
}: CollaborationErrorProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: '🌐',
          title: 'Network Connection Error',
          description: 'Unable to connect to collaboration servers. Please check your internet connection.',
          canRetry: true,
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Verify firewall settings',
          ],
        };
      case 'permission':
        return {
          icon: '🔒',
          title: 'Permission Denied',
          description: 'You don\'t have permission to access this collaboration feature.',
          canRetry: false,
          suggestions: [
            'Check your subscription plan',
            'Verify workspace access',
            'Contact workspace admin',
          ],
        };
      case 'session':
        return {
          icon: '🤝',
          title: 'Session Error',
          description: 'Unable to join or create collaboration session. The session may be full or expired.',
          canRetry: true,
          suggestions: [
            'Try joining a different session',
            'Create a new session',
            'Check session capacity',
          ],
        };
      case 'video':
        return {
          icon: '📹',
          title: 'Video Call Error',
          description: 'Unable to start video call. Please check your camera permissions and connection.',
          canRetry: true,
          suggestions: [
            'Check camera permissions',
            'Ensure camera is not in use',
            'Test camera functionality',
          ],
        };
      case 'audio':
        return {
          icon: '🎤',
          title: 'Audio Call Error',
          description: 'Unable to start audio call. Please check your microphone permissions.',
          canRetry: true,
          suggestions: [
            'Check microphone permissions',
            'Ensure microphone is not muted',
            'Test audio device',
          ],
        };
      case 'workspace':
        return {
          icon: '🏢',
          title: 'Workspace Error',
          description: 'Unable to access or create workspace. Please check your permissions.',
          canRetry: true,
          suggestions: [
            'Verify workspace access',
            'Check membership status',
            'Contact workspace owner',
          ],
        };
      case 'immersive':
        return {
          icon: '🥽',
          title: 'Immersive Environment Error',
          description: 'Unable to enter immersive environment. VR/AR device may not be connected.',
          canRetry: true,
          suggestions: [
            'Check VR/AR device connection',
            'Verify device compatibility',
            'Update device drivers',
          ],
        };
      default:
        return {
          icon: '❌',
          title: 'Collaboration Error',
          description: 'An unexpected error occurred with the collaboration system.',
          canRetry: true,
          suggestions: [
            'Try refreshing the page',
            'Check your internet connection',
            'Contact support if issues persist',
          ],
        };
    }
  };

  const errorConfig = getErrorConfig();
  const canRetry = errorConfig.canRetry && retryCount < maxRetries;
  const retryAttemptsRemaining = maxRetries - retryCount;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.errorCard}>
          {/* Error Icon and Title */}
          <View style={styles.header}>
            <Text style={styles.icon}>{errorConfig.icon}</Text>
            <Text style={styles.title}>{errorConfig.title}</Text>
          </View>

          {/* Error Description */}
          <Text style={styles.description}>{errorConfig.description}</Text>

          {/* Technical Error Details */}
          <View style={styles.technicalContainer}>
            <Text style={styles.technicalTitle}>Technical Details:</Text>
            <Text style={styles.technicalError}>{error}</Text>
          </View>

          {/* Retry Information */}
          {retryCount > 0 && (
            <View style={styles.retryContainer}>
              <Text style={styles.retryText}>
                Retry attempts: {retryCount}/{maxRetries}
              </Text>
              {canRetry && (
                <Text style={styles.retryRemaining}>
                  {retryAttemptsRemaining} attempts remaining
                </Text>
              )}
            </View>
          )}

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            {errorConfig.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canRetry && onRetry && (
              <Button
                title={`Retry ${retryAttemptsRemaining > 1 ? `(${retryAttemptsRemaining} left)` : ''}`}
                onPress={onRetry}
                style={styles.retryButton}
              />
            )}
            
            {onDismiss && (
              <Button
                title="Dismiss"
                onPress={onDismiss}
                variant="secondary"
                style={styles.dismissButton}
              />
            )}
          </View>

          {/* Additional Help */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Need more help?</Text>
            <View style={styles.helpActions}>
              <Button
                title="Contact Support"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
              <Button
                title="View Documentation"
                variant="outline"
                size="small"
                style={styles.helpButton}
              />
            </View>
          </View>
        </Card>

        {/* Error Context */}
        <Card style={styles.contextCard}>
          <Text style={styles.contextTitle}>What this affects:</Text>
          <View style={styles.contextList}>
            <Text style={styles.contextItem}>• Real-time collaboration sessions</Text>
            <Text style={styles.contextItem}>• Video and audio calls</Text>
            <Text style={styles.contextItem}>• Shared workspaces and documents</Text>
            <Text style={styles.contextItem}>• Immersive VR/AR environments</Text>
          </View>
        </Card>

        {/* Troubleshooting Steps */}
        <Card style={styles.troubleshootingCard}>
          <Text style={styles.troubleshootingTitle}>Quick Troubleshooting:</Text>
          <View style={styles.troubleshootingSteps}>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Check internet connection</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Verify permissions</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Test camera/microphone</Text>
            </View>
            <View style={styles.stepItem}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Restart the application</Text>
            </View>
          </View>
        </Card>

        {/* Collaboration Specific Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsCardTitle}>Collaboration Tips:</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Ensure all participants have stable internet</Text>
            <Text style={styles.tipItem}>• Test video/audio before important sessions</Text>
            <Text style={styles.tipItem}>• Use AI facilitator for better meeting management</Text>
            <Text style={styles.tipItem}>• Share documents before starting sessions</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  errorCard: {
    padding: 24,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  technicalContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  technicalError: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  retryContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  retryRemaining: {
    fontSize: 12,
    color: '#856404',
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 14,
    color: '#3498DB',
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    flex: 1,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3498DB',
  },
  dismissButton: {
    backgroundColor: '#95A5A6',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E8ED',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  helpActions: {
    flexDirection: 'row',
    gap: 12,
  },
  helpButton: {
    flex: 1,
  },
  contextCard: {
    padding: 20,
    marginBottom: 16,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  contextList: {
    gap: 8,
  },
  contextItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  troubleshootingCard: {
    padding: 20,
    marginBottom: 16,
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  troubleshootingSteps: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498DB',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 1,
  },
  tipsCard: {
    padding: 20,
  },
  tipsCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});
