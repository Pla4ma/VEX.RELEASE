/**
 * User Feedback Integration
 *
 * Phase 8D: Post-Production Optimization - User feedback integration and iteration
 *
 * Collects, analyzes, and acts on user feedback to continuously improve the Vex-App.
 * Implements feedback loops for all major systems and features.
 */

import { z } from 'zod';
import { eventBus } from '../../events';

// ============================================================================
// User Feedback Integration Constants
// ============================================================================

export const FEEDBACK_INTEGRATION_CONFIG = {
  // Feedback collection methods
  COLLECTION_METHODS: {
    IN_APP_SURVEYS: 'in_app_surveys',
    SESSION_RATINGS: 'session_ratings',
    FEATURE_FEEDBACK: 'feature_feedback',
    BUG_REPORTS: 'bug_reports',
    SUGGESTION_BOX: 'suggestion_box',
    ANALYTICS_EVENTS: 'analytics_events',
  },

  // Feedback categories
  FEEDBACK_CATEGORIES: {
    USER_EXPERIENCE: 'user_experience',
    FEATURE_REQUESTS: 'feature_requests',
    BUG_REPORTS: 'bug_reports',
    PERFORMANCE: 'performance',
    UI_UX: 'ui_ux',
    CONTENT: 'content',
    SOCIAL_FEATURES: 'social_features',
    AI_COACH: 'ai_coach',
  },

  // Response priorities
  RESPONSE_PRIORITIES: {
    CRITICAL: 1,    // System-breaking issues
    HIGH: 2,        // Major functionality issues
    MEDIUM: 3,      // Feature improvements
    LOW: 4,         // Nice-to-have enhancements
    INFO: 5,        // Informational feedback
  },

  // Analysis thresholds
  ANALYSIS_THRESHOLDS: {
    MIN_FEEDBACK_COUNT: 5,        // Minimum feedback for analysis
    TREND_THRESHOLD: 0.7,        // 70% agreement for trend
    SENTIMENT_THRESHOLD: 0.6,     // 60% sentiment for action
    RESPONSE_TIME_TARGET: 24000,  // 24 hours response target
  },
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const FeedbackCategorySchema = z.enum([
  'user_experience',
  'feature_requests',
  'bug_reports',
  'performance',
  'ui_ux',
  'content',
  'social_features',
  'ai_coach',
]);

export const FeedbackPrioritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

export const FeedbackSourceSchema = z.enum([
  'in_app_survey',
  'session_rating',
  'feature_feedback',
  'bug_report',
  'suggestion_box',
  'analytics_event',
]);

export const UserFeedbackSchema = z.object({
  id: z.string(),
  userId: z.string(),
  
  // Feedback content
  category: FeedbackCategorySchema,
  source: FeedbackSourceSchema,
  rating: z.number().min(1).max(5).optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  message: z.string(),
  
  // Context
  feature: z.string().optional(),
  sessionId: z.string().optional(),
  deviceInfo: z.record(z.string()).optional(),
  appVersion: z.string(),
  
  // Metadata
  timestamp: z.number(),
  priority: FeedbackPrioritySchema,
  status: z.enum(['new', 'reviewing', 'addressed', 'closed', 'wont_fix']).default('new'),
  
  // Response tracking
  respondedAt: z.number().nullable().default(null),
  response: z.string().nullable().default(null),
  followUpRequired: z.boolean().default(false),
});

export const FeedbackTrendSchema = z.object({
  category: FeedbackCategorySchema,
  trend: z.enum(['improving', 'stable', 'declining']),
  averageRating: z.number(),
  feedbackCount: z.number(),
  sentimentScore: z.number(),
  topIssues: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;
export type FeedbackPriority = z.infer<typeof FeedbackPrioritySchema>;
export type FeedbackSource = z.infer<typeof FeedbackSourceSchema>;
export type UserFeedback = z.infer<typeof UserFeedbackSchema>;
export type FeedbackTrend = z.infer<typeof FeedbackTrendSchema>;

export interface FeedbackAnalysis {
  totalFeedback: number;
  averageRating: number;
  sentimentDistribution: Record<string, number>;
  categoryBreakdown: Record<FeedbackCategory, number>;
  topIssues: Array<{ issue: string; count: number; priority: FeedbackPriority }>;
  trends: FeedbackTrend[];
  actionableInsights: string[];
}

export interface FeedbackResponse {
  feedbackId: string;
  response: string;
  action: string;
  priority: FeedbackPriority;
  estimatedEffort: 'minutes' | 'hours' | 'days' | 'weeks';
  followUpRequired: boolean;
}

// ============================================================================
// User Feedback Integration Service
// ============================================================================

export class UserFeedbackIntegration {
  private feedbackHistory: Map<string, UserFeedback> = new Map();
  private feedbackTrends: Map<string, FeedbackTrend> = new Map();
  private responseQueue: Map<string, FeedbackResponse> = new Map();
  private isCollecting: boolean = false;

  /**
   * Start feedback collection and analysis
   */
  async startFeedbackCollection(): Promise<void> {
    if (this.isCollecting) {
      console.log('[UserFeedbackIntegration] Feedback collection already active');
      return;
    }

    console.log('[UserFeedbackIntegration] Starting comprehensive feedback collection');
    this.isCollecting = true;

    // Set up feedback collection intervals
    this.setupFeedbackCollection();

    // Initial feedback analysis
    await this.analyzeCurrentFeedback();

    // Emit start event
    eventBus.publish('feedback_integration:started', {
      timestamp: Date.now(),
      collectionMethods: Object.values(FEEDBACK_INTEGRATION_CONFIG.COLLECTION_METHODS),
    });
  }

  /**
   * Collect user feedback
   */
  async collectFeedback(feedback: {
    userId: string;
    category: FeedbackCategory;
    source: FeedbackSource;
    rating?: number;
    message: string;
    feature?: string;
    sessionId?: string;
    deviceInfo?: Record<string, unknown>;
  }): Promise<UserFeedback> {
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userFeedback: UserFeedback = {
      id: feedbackId,
      userId: feedback.userId,
      category: feedback.category,
      source: feedback.source,
      rating: feedback.rating,
      sentiment: this.determineSentiment(feedback.rating, feedback.message),
      message: feedback.message,
      feature: feedback.feature,
      sessionId: feedback.sessionId,
      deviceInfo: feedback.deviceInfo,
      appVersion: '1.0.0', // Would get from app context
      timestamp: Date.now(),
      priority: this.determinePriority(feedback.category, feedback.rating, feedback.message),
      status: 'new',
    };

    this.feedbackHistory.set(feedbackId, userFeedback);

    // Emit feedback collection event
    eventBus.publish('feedback_integration:collected', {
      feedbackId,
      category: feedback.category,
      priority: userFeedback.priority,
    });

    return userFeedback;
  }

  /**
   * Analyze current feedback
   */
  async analyzeCurrentFeedback(): Promise<FeedbackAnalysis> {
    console.log('[UserFeedbackIntegration] Analyzing current feedback...');
    
    const allFeedback = Array.from(this.feedbackHistory.values());
    
    if (allFeedback.length === 0) {
      return this.createEmptyAnalysis();
    }

    // Calculate overall metrics
    const totalFeedback = allFeedback.length;
    const ratings = allFeedback.filter(f => f.rating !== undefined).map(f => f.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    // Sentiment distribution
    const sentimentDistribution = allFeedback.reduce((dist, feedback) => {
      dist[feedback.sentiment] = (dist[feedback.sentiment] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    // Category breakdown
    const categoryBreakdown = allFeedback.reduce((breakdown, feedback) => {
      breakdown[feedback.category] = (breakdown[feedback.category] || 0) + 1;
      return breakdown;
    }, {} as Record<FeedbackCategory, number>);

    // Identify top issues
    const topIssues = this.identifyTopIssues(allFeedback);

    // Analyze trends
    const trends = await this.analyzeTrends(allFeedback);

    // Generate actionable insights
    const actionableInsights = this.generateActionableInsights(allFeedback, trends);

    const analysis: FeedbackAnalysis = {
      totalFeedback,
      averageRating,
      sentimentDistribution,
      categoryBreakdown,
      topIssues,
      trends,
      actionableInsights,
    };

    // Emit analysis completion event
    eventBus.publish('feedback_integration:analyzed', {
      timestamp: Date.now(),
      totalFeedback,
      averageRating,
      actionableInsights: actionableInsights.length,
    });

    return analysis;
  }

  /**
   * Generate automated responses
   */
  async generateResponse(feedbackId: string): Promise<FeedbackResponse | null> {
    const feedback = this.feedbackHistory.get(feedbackId);
    if (!feedback) return null;

    let response: string;
    let action: string;
    let estimatedEffort: 'minutes' | 'hours' | 'days' | 'weeks';

    // Generate response based on category and sentiment
    switch (feedback.category) {
      case 'ai_coach':
        if (feedback.sentiment === 'negative') {
          response = "We're sorry the AI Coach isn't meeting your expectations. We're continuously improving its predictions and personalization.";
          action = 'Review AI Coach performance and adjust algorithms';
          estimatedEffort = 'days';
        } else {
          response = "Thank you for your feedback on the AI Coach! We're glad it's helping you stay productive.";
          action = 'Continue monitoring AI Coach effectiveness';
          estimatedEffort = 'minutes';
        }
        break;

      case 'social_features':
        response = "Your feedback on social features is valuable for building better squad experiences.";
        action = 'Analyze squad engagement patterns and optimize social features';
        estimatedEffort = 'hours';
        break;

      case 'performance':
        response = "Performance is our top priority. We're working on optimizations to improve your experience.";
        action = 'Implement performance optimizations based on feedback';
        estimatedEffort = 'days';
        break;

      case 'ui_ux':
        response = "UI/UX feedback helps us create a more intuitive experience. Thank you for your input!";
        action = 'Review UI/UX design and implement improvements';
        estimatedEffort = 'hours';
        break;

      default:
        response = "Thank you for your feedback! We appreciate your input and will use it to improve the app.";
        action = 'Review feedback and determine appropriate action';
        estimatedEffort = 'minutes';
    }

    const feedbackResponse: FeedbackResponse = {
      feedbackId,
      response,
      action,
      priority: feedback.priority,
      estimatedEffort,
      followUpRequired: feedback.priority === 'critical' || feedback.priority === 'high',
    };

    this.responseQueue.set(feedbackId, feedbackResponse);

    // Update feedback status
    feedback.status = 'reviewing';
    feedback.respondedAt = Date.now();
    feedback.response = response;
    this.feedbackHistory.set(feedbackId, feedback);

    // Emit response generation event
    eventBus.publish('feedback_integration:response_generated', {
      feedbackId,
      category: feedback.category,
      priority: feedback.priority,
      estimatedEffort,
    });

    return feedbackResponse;
  }

  /**
   * Get feedback insights for specific feature
   */
  getFeatureInsights(featureName: string): {
    feedbackCount: number;
    averageRating: number;
    topIssues: string[];
    improvementSuggestions: string[];
    userSentiment: 'positive' | 'neutral' | 'negative';
  } {
    const featureFeedback = Array.from(this.feedbackHistory.values())
      .filter(f => f.feature === featureName);

    if (featureFeedback.length === 0) {
      return {
        feedbackCount: 0,
        averageRating: 0,
        topIssues: [],
        improvementSuggestions: [],
        userSentiment: 'neutral',
      };
    }

    const ratings = featureFeedback.filter(f => f.rating !== undefined).map(f => f.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

    const topIssues = featureFeedback
      .filter(f => f.sentiment === 'negative')
      .map(f => f.message)
      .slice(0, 5);

    const improvementSuggestions = featureFeedback
      .filter(f => f.category === 'feature_requests')
      .map(f => f.message)
      .slice(0, 3);

    const sentimentCounts = featureFeedback.reduce((counts, f) => {
      counts[f.sentiment] = (counts[f.sentiment] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const userSentiment = sentimentCounts.positive > sentimentCounts.negative ? 'positive' :
                        sentimentCounts.negative > sentimentCounts.positive ? 'negative' : 'neutral';

    return {
      feedbackCount: featureFeedback.length,
      averageRating,
      topIssues,
      improvementSuggestions,
      userSentiment,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Setup feedback collection methods
   */
  private setupFeedbackCollection(): void {
    // In a real implementation, this would set up various collection methods:
    // - In-app survey triggers
    // - Session rating prompts
    // - Feature feedback buttons
    // - Bug report forms
    // - Analytics event listeners
    
    console.log('[UserFeedbackIntegration] Feedback collection methods configured');
  }

  /**
   * Determine sentiment from rating and message
   */
  private determineSentiment(rating?: number, message?: string): 'positive' | 'neutral' | 'negative' {
    if (rating) {
      if (rating >= 4) return 'positive';
      if (rating <= 2) return 'negative';
      return 'neutral';
    }

    if (message) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('love') || lowerMessage.includes('great') || lowerMessage.includes('amazing')) {
        return 'positive';
      }
      if (lowerMessage.includes('hate') || lowerMessage.includes('terrible') || lowerMessage.includes('broken')) {
        return 'negative';
      }
    }

    return 'neutral';
  }

  /**
   * Determine feedback priority
   */
  private determinePriority(category: FeedbackCategory, rating?: number, message?: string): FeedbackPriority {
    // Critical issues
    if (category === 'bug_reports' && (rating !== undefined && rating <= 2)) {
      return 'critical';
    }
    if (category === 'performance' && (rating !== undefined && rating <= 2)) {
      return 'critical';
    }

    // High priority
    if (category === 'ai_coach' && (rating !== undefined && rating <= 2)) {
      return 'high';
    }
    if (category === 'social_features' && (rating !== undefined && rating <= 2)) {
      return 'high';
    }

    // Medium priority
    if (category === 'feature_requests') {
      return 'medium';
    }
    if (category === 'ui_ux' && (rating !== undefined && rating <= 3)) {
      return 'medium';
    }

    // Low priority
    if (rating !== undefined && rating >= 4) {
      return 'low';
    }

    return 'info';
  }

  /**
   * Identify top issues from feedback
   */
  private identifyTopIssues(feedback: UserFeedback[]): Array<{ issue: string; count: number; priority: FeedbackPriority }> {
    const issueCounts = feedback
      .filter(f => f.sentiment === 'negative' || f.category === 'bug_reports')
      .reduce((counts, f) => {
        const key = f.message.substring(0, 100); // First 100 chars as issue key
        counts[key] = (counts[key] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    return Object.entries(issueCounts)
      .map(([issue, count]) => ({
        issue,
        count,
        priority: this.determinePriorityFromCount(count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Determine priority from issue count
   */
  private determinePriorityFromCount(count: number): FeedbackPriority {
    if (count >= 10) return 'critical';
    if (count >= 5) return 'high';
    if (count >= 3) return 'medium';
    return 'low';
  }

  /**
   * Analyze trends in feedback
   */
  private async analyzeTrends(feedback: UserFeedback[]): Promise<FeedbackTrend[]> {
    const trends: FeedbackTrend[] = [];

    // Analyze each category
    Object.values(FEEDBACK_INTEGRATION_CONFIG.FEEDBACK_CATEGORIES).forEach(category => {
      const categoryFeedback = feedback.filter(f => f.category === category);
      
      if (categoryFeedback.length >= FEEDBACK_INTEGRATION_CONFIG.ANALYSIS_THRESHOLDS.MIN_FEEDBACK_COUNT) {
        const ratings = categoryFeedback.filter(f => f.rating !== undefined).map(f => f.rating!);
        const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
        const sentimentScore = categoryFeedback.filter(f => f.sentiment === 'positive').length / categoryFeedback.length;
        
        const topIssues = categoryFeedback
          .filter(f => f.sentiment === 'negative')
          .map(f => f.message)
          .slice(0, 3);

        const recommendations = this.generateCategoryRecommendations(category, categoryFeedback);

        trends.push({
          category,
          trend: this.calculateTrend(categoryFeedback),
          averageRating,
          feedbackCount: categoryFeedback.length,
          sentimentScore,
          topIssues,
          recommendations,
        });
      }
    });

    return trends;
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(feedback: UserFeedback[]): 'improving' | 'stable' | 'declining' {
    // Simple trend calculation based on recent vs older feedback
    const sortedFeedback = feedback.sort((a, b) => a.timestamp - b.timestamp);
    const midpoint = Math.floor(sortedFeedback.length / 2);
    
    const olderFeedback = sortedFeedback.slice(0, midpoint);
    const recentFeedback = sortedFeedback.slice(midpoint);

    const olderRating = olderFeedback.filter(f => f.rating !== undefined).reduce((sum, f) => sum + (f.rating || 0), 0) / olderFeedback.length || 0;
    const recentRating = recentFeedback.filter(f => f.rating !== undefined).reduce((sum, f) => sum + (f.rating || 0), 0) / recentFeedback.length || 0;

    if (recentRating > olderRating + 0.2) return 'improving';
    if (recentRating < olderRating - 0.2) return 'declining';
    return 'stable';
  }

  /**
   * Generate category-specific recommendations
   */
  private generateCategoryRecommendations(category: FeedbackCategory, feedback: UserFeedback[]): string[] {
    const recommendations: string[] = [];

    switch (category) {
      case 'ai_coach':
        recommendations.push('Review AI Coach prediction accuracy');
        recommendations.push('Improve personalization algorithms');
        break;
      case 'social_features':
        recommendations.push('Enhance squad communication tools');
        recommendations.push('Improve raid coordination features');
        break;
      case 'performance':
        recommendations.push('Optimize bundle size and loading times');
        recommendations.push('Improve app responsiveness');
        break;
      case 'ui_ux':
        recommendations.push('Simplify complex workflows');
        recommendations.push('Improve navigation and discoverability');
        break;
      default:
        recommendations.push('Monitor user satisfaction trends');
        recommendations.push('Continue gathering feedback for improvements');
    }

    return recommendations;
  }

  /**
   * Generate actionable insights
   */
  private generateActionableInsights(feedback: UserFeedback[], trends: FeedbackTrend[]): string[] {
    const insights: string[] = [];

    // High-priority issues
    const criticalIssues = feedback.filter(f => f.priority === 'critical');
    if (criticalIssues.length > 0) {
      insights.push(`Address ${criticalIssues.length} critical issues immediately`);
    }

    // Declining trends
    const decliningTrends = trends.filter(t => t.trend === 'declining');
    if (decliningTrends.length > 0) {
      insights.push(`Investigate declining trends in: ${decliningTrends.map(t => t.category).join(', ')}`);
    }

    // Low-rated features
    const lowRatedFeedback = feedback.filter(f => f.rating !== undefined && f.rating <= 2);
    if (lowRatedFeedback.length > 0) {
      insights.push(`Review ${lowRatedFeedback.length} poorly rated features for improvement`);
    }

    // Feature requests
    const featureRequests = feedback.filter(f => f.category === 'feature_requests');
    if (featureRequests.length > 0) {
      insights.push(`Consider implementing ${featureRequests.length} feature requests`);
    }

    return insights;
  }

  /**
   * Create empty analysis
   */
  private createEmptyAnalysis(): FeedbackAnalysis {
    return {
      totalFeedback: 0,
      averageRating: 0,
      sentimentDistribution: {},
      categoryBreakdown: {} as Record<FeedbackCategory, number>,
      topIssues: [],
      trends: [],
      actionableInsights: ['Start collecting user feedback to generate insights'],
    };
  }

  /**
   * Get current feedback status
   */
  getFeedbackStatus(): {
    isCollecting: boolean;
    totalFeedback: number;
    pendingResponses: number;
    averageRating: number;
    topCategory: FeedbackCategory | null;
  } {
    const allFeedback = Array.from(this.feedbackHistory.values());
    const pendingResponses = allFeedback.filter(f => f.status === 'new').length;
    const ratings = allFeedback.filter(f => f.rating !== undefined).map(f => f.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    const categoryCounts = allFeedback.reduce((counts, f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
      return counts;
    }, {} as Record<FeedbackCategory, number>);

    const topCategory = Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    return {
      isCollecting: this.isCollecting,
      totalFeedback: allFeedback.length,
      pendingResponses,
      averageRating,
      topCategory,
    };
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createUserFeedbackIntegration(): UserFeedbackIntegration {
  return new UserFeedbackIntegration();
}

// Singleton instance
let userFeedbackIntegration: UserFeedbackIntegration | null = null;

export function getUserFeedbackIntegration(): UserFeedbackIntegration {
  if (!userFeedbackIntegration) {
    userFeedbackIntegration = new UserFeedbackIntegration();
  }
  return userFeedbackIntegration;
}
