/**
 * Privacy Inventory System
 * 
 * Comprehensive privacy compliance and data handling audit system:
 * - GDPR compliance tracking
 * - Data collection inventory
 * - Privacy policy enforcement
 * - Data retention management
 * - User consent management
 * - Security audit integration
 */

import { createDebugger } from '../utils/debug';
import { eventBus } from '../events';
import { 
  sanitizeAnalyticsProperties,
  sanitizeUserTraits,
  type SafeAnalyticsProperties,
} from '../shared/analytics/privacy';
import {
  validateXSS,
  validateSQLInjection,
  validateCSRF,
  type SecurityValidationResult,
} from '../validation/securityValidation';

const debug = createDebugger('privacy-inventory');

// ============================================================================
// Privacy Data Types
// ============================================================================

export interface PersonalData {
  /** User identifier */
  userId?: string;
  /** User email (hashed) */
  emailHash?: string;
  /** User profile data */
  profileData?: {
    displayName?: string;
    avatar?: string;
    timezone?: string;
    preferences?: Record<string, any>;
  };
  /** Session data */
  sessionData?: {
    duration: number;
    completionRate: number;
    streakDays: number;
    lastActiveAt: number;
  };
  /** Performance data */
  performanceData?: {
    averageFPS: number;
    memoryUsage: number;
    deviceInfo: string;
  };
}

export interface DataCollectionPoint {
  id: string;
  category: 'analytics' | 'performance' | 'crash' | 'user-behavior' | 'personal' | 'session' | 'location' | 'device';
  purpose: string;
  dataTypes: string[];
  retentionDays?: number;
  requiredConsent: boolean;
  sharedWithThirdParties: boolean;
  encryptionRequired: boolean;
  collectedAt: number;
}

export interface PrivacyComplianceLevel {
  level: 'compliant' | 'partial' | 'non-compliant';
  score: number; // 0-100
  issues: PrivacyIssue[];
  gdprRequirements: {
    lawfulBasis: boolean;
    purposeLimitation: boolean;
    dataMinimization: boolean;
    accuracy: boolean;
    storageLimitation: boolean;
    security: boolean;
  };
}

export interface PrivacyIssue {
  id: string;
  category: 'data-collection' | 'consent' | 'retention' | 'security' | 'transparency' | 'access' | 'international';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  message: string;
  recommendation: string;
  gdprArticle?: string;
  affectedDataPoints?: string[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'analytics' | 'marketing' | 'personalization' | 'essential';
  granted: boolean;
  grantedAt: number;
  expiresAt?: number;
  version: string;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// Privacy Inventory Class
// ============================================================================

export class PrivacyInventory {
  private static instance: PrivacyInventory;
  private dataCollectionPoints: Map<string, DataCollectionPoint> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private personalDataStore: Map<string, PersonalData> = new Map();
  private auditHistory: PrivacyComplianceLevel[] = [];

  private constructor() {
    this.initializeDataCollectionPoints();
    this.loadConsentRecords();
    this.loadPersonalData();
  }

  static getInstance(): PrivacyInventory {
    if (!PrivacyInventory.instance) {
      PrivacyInventory.instance = new PrivacyInventory();
    }
    return PrivacyInventory.instance;
  }

  // ============================================================================
  // Data Collection Management
  // ============================================================================

  private initializeDataCollectionPoints(): void {
    const defaultDataPoints: DataCollectionPoint[] = [
      {
        id: 'user-analytics',
        category: 'analytics',
        purpose: 'App performance optimization and user behavior analysis',
        dataTypes: ['session-duration', 'completion-rate', 'feature-usage', 'performance-metrics'],
        retentionDays: 365,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      },
      {
        id: 'crash-reporting',
        category: 'crash',
        purpose: 'App stability improvement and bug fixing',
        dataTypes: ['stack-trace', 'device-info', 'app-version', 'error-message'],
        retentionDays: 30,
        requiredConsent: true,
        sharedWithThirdParties: true, // Shared with crash reporting service
        encryptionRequired: true,
        collectedAt: Date.now(),
      },
      {
        id: 'user-profile',
        category: 'personal',
        purpose: 'User account management and personalization',
        dataTypes: ['display-name', 'avatar', 'timezone', 'preferences'],
        retentionDays: 1095, // 3 years
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      },
      {
        id: 'session-data',
        category: 'session',
        purpose: 'User progress tracking and achievement system',
        dataTypes: ['session-duration', 'completion-rate', 'streak-days', 'performance-metrics'],
        retentionDays: 180,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      },
      {
        id: 'device-info',
        category: 'device',
        purpose: 'App optimization and compatibility',
        dataTypes: ['device-model', 'os-version', 'screen-resolution', 'memory-info'],
        retentionDays: 0, // Not persistent
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: false,
        collectedAt: Date.now(),
      },
    ];

    defaultDataPoints.forEach(point => {
      this.dataCollectionPoints.set(point.id, point);
    });

    debug.info('Data collection points initialized:', defaultDataPoints.length);
  }

  registerDataCollectionPoint(point: DataCollectionPoint): void {
    this.dataCollectionPoints.set(point.id, point);
    this.dataCollectionPoints.get(point.id).collectedAt = Date.now();
    
    debug.info('Data collection point registered:', point.id, point.category);
    eventBus.publish('privacy:data-point-registered', { pointId: point.id });
  }

  getDataCollectionPoint(id: string): DataCollectionPoint | undefined {
    return this.dataCollectionPoints.get(id);
  }

  getAllDataCollectionPoints(): DataCollectionPoint[] {
    return Array.from(this.dataCollectionPoints.values());
  }

  // ============================================================================
  // Consent Management
  // ============================================================================

  recordConsent(consent: Omit<ConsentRecord, 'id' | 'grantedAt'>): void {
    const consentRecord: ConsentRecord = {
      id: this.generateId(),
      ...consent,
      grantedAt: consent.grantedAt || Date.now(),
      version: '1.0',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
    };

    this.consentRecords.set(consentRecord.id, consentRecord);
    
    debug.info('Consent recorded:', consentRecord.id, consent.consentType);
    eventBus.publish('privacy:consent-recorded', { consentId: consentRecord.id });
  }

  getConsentRecord(id: string): ConsentRecord | undefined {
    return this.consentRecords.get(id);
  }

  getUserConsents(userId: string): ConsentRecord[] {
    return Array.from(this.consentRecords.values()).filter(
      consent => consent.userId === userId
    );
  }

  hasConsent(userId: string, consentType: string): boolean {
    const userConsents = this.getUserConsents(userId);
    return userConsents.some(consent => 
      consent.consentType === consentType && consent.granted
    );
  }

  revokeConsent(consentId: string): void {
    const consent = this.consentRecords.get(consentId);
    if (consent) {
      consent.granted = false;
      consent.expiresAt = Date.now();
      
      debug.info('Consent revoked:', consentId);
      eventBus.publish('privacy:consent-revoked', { consentId });
    }
  }

  // ============================================================================
  // Personal Data Management
  // ============================================================================

  storePersonalData(userId: string, data: PersonalData): void {
    const existingData = this.personalDataStore.get(userId) || {};
    const updatedData = { ...existingData, ...data };
    
    this.personalDataStore.set(userId, updatedData);
    
    debug.info('Personal data stored for user:', userId);
    eventBus.publish('privacy:personal-data-stored', { userId });
  }

  getPersonalData(userId: string): PersonalData | undefined {
    return this.personalDataStore.get(userId);
  }

  deletePersonalData(userId: string): void {
    this.personalDataStore.delete(userId);
    
    debug.info('Personal data deleted for user:', userId);
    eventBus.publish('privacy:personal-data-deleted', { userId });
  }

  // ============================================================================
  // Privacy Compliance Audit
  // ============================================================================

  async performPrivacyAudit(): Promise<PrivacyComplianceLevel> {
    debug.info('Performing privacy compliance audit...');

    const issues: PrivacyIssue[] = [];
    let gdprCompliance = {
      lawfulBasis: true,
      purposeLimitation: true,
      dataMinimization: true,
      accuracy: true,
      storageLimitation: true,
      security: true,
    };

    // Audit data collection points
    for (const point of this.getAllDataCollectionPoints()) {
      const pointIssues = this.auditDataCollectionPoint(point);
      issues.push(...pointIssues);
    }

    // Audit consent records
    for (const consent of Array.from(this.consentRecords.values())) {
      const consentIssues = this.auditConsentRecord(consent);
      issues.push(...consentIssues);
    }

    // Audit personal data handling
    for (const [userId, data] of Array.from(this.personalDataStore.entries())) {
      const dataIssues = this.auditPersonalData(userId, data);
      issues.push(...dataIssues);
    }

    // Calculate compliance score
    const score = this.calculateComplianceScore(issues, gdprCompliance);

    const complianceLevel: PrivacyComplianceLevel = {
      level: score >= 90 ? 'compliant' : score >= 70 ? 'partial' : 'non-compliant',
      score,
      issues,
      gdprRequirements: gdprCompliance,
    };

    // Store audit result
    this.auditHistory.push(complianceLevel);

    debug.info('Privacy audit completed:', {
      level: complianceLevel.level,
      score,
      issuesCount: issues.length,
    });

    eventBus.publish('privacy:audit-completed', {
      complianceLevel,
      score,
      issuesCount: issues.length,
    });

    return complianceLevel;
  }

  private auditDataCollectionPoint(point: DataCollectionPoint): PrivacyIssue[] {
    const issues: PrivacyIssue[] = [];

    // Check if consent is properly recorded
    if (point.requiredConsent && !this.hasConsent('current-user', 'analytics')) {
      issues.push({
        id: `missing-consent-${point.id}`,
        category: 'consent',
        severity: 'critical',
        message: `Data collection point ${point.id} requires consent but no consent record found`,
        recommendation: 'Ensure user consent is properly recorded before collecting data',
        gdprArticle: '6.1a',
        affectedDataPoints: [point.id],
      });
    }

    // Check data retention compliance
    if (point.retentionDays && point.retentionDays > 365) {
      issues.push({
        id: `excessive-retention-${point.id}`,
        category: 'retention',
        severity: 'major',
        message: `Data collection point ${point.id} retains data for ${point.retentionDays} days (exceeds GDPR limit)`,
        recommendation: 'Reduce data retention period to comply with GDPR requirements',
        gdprArticle: '5.3',
        affectedDataPoints: [point.id],
      });
    }

    // Check encryption requirements
    if (point.encryptionRequired && !this.isDataEncrypted(point.id)) {
      issues.push({
        id: `missing-encryption-${point.id}`,
        category: 'security',
        severity: 'critical',
        message: `Data collection point ${point.id} requires encryption but data is not encrypted`,
        recommendation: 'Implement encryption for sensitive data collection and storage',
        gdprArticle: '4.1',
        affectedDataPoints: [point.id],
      });
    }

    return issues;
  }

  private auditConsentRecord(consent: ConsentRecord): PrivacyIssue[] {
    const issues: PrivacyIssue[] = [];

    // Check consent expiration
    if (consent.expiresAt && consent.expiresAt < Date.now()) {
      issues.push({
        id: `expired-consent-${consent.id}`,
        category: 'consent',
        severity: 'major',
        message: `Consent record ${consent.id} has expired`,
        recommendation: 'Renew user consent or implement consent renewal process',
        gdprArticle: '6.1b',
      });
    }

    // Check consent scope
    if (!consent.userId) {
      issues.push({
        id: `missing-user-id-${consent.id}`,
        category: 'consent',
        severity: 'major',
        message: `Consent record ${consent.id} is not associated with a user ID`,
        recommendation: 'Ensure consent records are properly associated with user accounts',
        gdprArticle: '6.1a',
      });
    }

    return issues;
  }

  private auditPersonalData(userId: string, data: PersonalData): PrivacyIssue[] {
    const issues: PrivacyIssue[] = [];

    // Check for unnecessary personal data collection
    if (data.profileData && !this.isDataNecessary(data.profileData)) {
      issues.push({
        id: `unnecessary-personal-data-${userId}`,
        category: 'data-collection',
        severity: 'moderate',
        message: `User ${userId} has unnecessary personal data stored`,
        recommendation: 'Review and remove unnecessary personal data collection',
        gdprArticle: '5.1c',
      });
    }

    return issues;
  }

  private calculateComplianceScore(issues: PrivacyIssue[], gdprCompliance: any): any {
    let score = 100;

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'major':
          score -= 15;
          break;
        case 'moderate':
          score -= 8;
          break;
        case 'minor':
          score -= 3;
          break;
      }
    });

    return score;
  }

  private isDataNecessary(data: any): boolean {
    // Simplified check for data necessity
    return !!(data === null || data === undefined || Object.keys(data).length === 0);
  }

  private isDataEncrypted(dataPointId: string): boolean {
    // Simplified check - in production, this would verify actual encryption
    return true; // Assume encrypted for now
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In production, this would get actual client IP
    return '127.0.0.1'; // Placeholder
  }

  private getUserAgent(): string {
    // In production, this would get actual user agent
    return 'VEX App/1.0.0'; // Placeholder
  }

  // ============================================================================
  // Reporting and Analytics
  // ============================================================================

  generatePrivacyReport(): string {
    const complianceLevel = this.auditHistory[this.auditHistory.length - 1];
    const dataPoints = this.getAllDataCollectionPoints();
    const consentRecords = Array.from(this.consentRecords.values());

    let report = `# Privacy Compliance Report\n\n`;
    report += `**Overall Compliance Level: ${complianceLevel.level.toUpperCase()}**\n`;
    report += `**Compliance Score: ${complianceLevel.score}/100**\n\n`;

    report += `## Data Collection Summary\n`;
    report += `- Total Data Points: ${dataPoints.length}\n`;
    report += `- Points Requiring Consent: ${dataPoints.filter(p => p.requiredConsent).length}\n`;
    report += `- Points with Third Party Sharing: ${dataPoints.filter(p => p.sharedWithThirdParties).length}\n\n`;

    report += `## Consent Summary\n`;
    report += `- Total Consent Records: ${consentRecords.length}\n`;
    report += `- Active Consents: ${consentRecords.filter(c => c.granted).length}\n`;
    report += `- Expired Consents: ${consentRecords.filter(c => c.expiresAt && c.expiresAt < Date.now()).length}\n\n`;

    if (complianceLevel.issues.length > 0) {
      report += `## Privacy Issues Found\n`;
      complianceLevel.issues.forEach(issue => {
        report += `### ${issue.category.toUpperCase()}: ${issue.message}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **GDPR Article:** ${issue.gdprArticle || 'N/A'}\n`;
        report += `- **Recommendation:** ${issue.recommendation}\n`;
        if (issue.affectedDataPoints) {
          report += `- **Affected Data Points:** ${issue.affectedDataPoints.join(', ')}\n`;
        }
      });
    }

    return report;
  }

  getAuditHistory(): PrivacyComplianceLevel[] {
    return [...this.auditHistory];
  }

  clearAuditHistory(): void {
    this.auditHistory = [];
    debug.info('Privacy audit history cleared');
  }

  // ============================================================================
  // Export Singleton Instance
  // ============================================================================

  export const privacyInventory = PrivacyInventory.getInstance();
}