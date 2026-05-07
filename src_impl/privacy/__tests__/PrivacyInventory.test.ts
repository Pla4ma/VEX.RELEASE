/**
 * Privacy Inventory Tests
 * 
 * Tests for comprehensive privacy compliance and security validation systems
 * including GDPR compliance checks and data handling.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  PrivacyInventory,
  privacyInventory,
  type PersonalData,
  type DataCollectionPoint,
  type ConsentRecord,
  type PrivacyComplianceLevel,
} from '../PrivacyInventory';
import {
  validateXSS,
  validateSQLInjection,
  validateCSRF,
  type SecurityValidationResult,
} from '../../validation/securityValidation';
import {
  sanitizeAnalyticsProperties,
  sanitizeUserTraits,
} from '../../shared/analytics/privacy';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PrivacyInventory', () => {
  let inventory: PrivacyInventory;

  beforeEach(() => {
    jest.clearAllMocks();
    inventory = privacyInventory;
  });

  afterEach(() => {
    inventory.cleanup();
  });

  describe('Data Collection Points', () => {
    it('should initialize with default data collection points', () => {
      const points = inventory.getAllDataCollectionPoints();

      expect(points).toHaveLength(5);
      expect(points.find(p => p.id === 'user-analytics')).toBeDefined();
      expect(points.find(p => p.id === 'crash-reporting')).toBeDefined();
      expect(points.find(p => p.id === 'user-profile')).toBeDefined();
      expect(points.find(p => p.id === 'session-data')).toBeDefined();
      expect(points.find(p => p.id === 'device-info')).toBeDefined();
    });

    it('should register new data collection point', () => {
      const newPoint: DataCollectionPoint = {
        id: 'custom-analytics',
        category: 'analytics',
        purpose: 'Custom analytics tracking',
        dataTypes: ['custom-event'],
        retentionDays: 90,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      };

      inventory.registerDataCollectionPoint(newPoint);

      const points = inventory.getAllDataCollectionPoints();
      expect(points).toHaveLength(6);
      expect(points.find(p => p.id === 'custom-analytics')).toBeDefined();
    });

    it('should retrieve data collection point by ID', () => {
      const point = inventory.getDataCollectionPoint('user-analytics');
      
      expect(point).toBeDefined();
      expect(point.id).toBe('user-analytics');
      expect(point.category).toBe('analytics');
      expect(point.requiredConsent).toBe(true);
    });

    it('should emit data point registration event', () => {
      const eventSpy = jest.spyOn(global, 'dispatchEvent');
      
      const newPoint: DataCollectionPoint = {
        id: 'test-point',
        category: 'analytics',
        purpose: 'Test point',
        dataTypes: ['test-data'],
        retentionDays: 30,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: false,
        collectedAt: Date.now(),
      };

      inventory.registerDataCollectionPoint(newPoint);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'privacy:data-point-registered',
          detail: expect.objectContaining({ pointId: newPoint.id }),
        })
      );
    });
  });

  describe('Consent Management', () => {
    it('should record user consent', () => {
      const consent = {
        id: 'analytics-consent',
        userId: 'test-user',
        consentType: 'analytics',
        granted: true,
        grantedAt: Date.now(),
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
      };

      inventory.recordConsent({
        consentType: 'analytics',
        granted: true,
        userId: 'test-user',
      });

      const userConsents = inventory.getUserConsents('test-user');
      expect(userConsents).toHaveLength(1);
      expect(userConsents[0].id).toBe('analytics-consent');
      expect(userConsents[0].granted).toBe(true);
    });

    it('should check consent status', () => {
      inventory.recordConsent({
        consentType: 'marketing',
        granted: false,
        userId: 'test-user',
      });

      const hasAnalyticsConsent = inventory.hasConsent('test-user', 'analytics');
      const hasMarketingConsent = inventory.hasConsent('test-user', 'marketing');

      expect(hasAnalyticsConsent).toBe(true);
      expect(hasMarketingConsent).toBe(false);
    });

    it('should revoke consent', () => {
      // First grant consent
      inventory.recordConsent({
        consentType: 'analytics',
        granted: true,
        userId: 'test-user',
      });

      const consentId = inventory.getUserConsents('test-user')[0].id;

      inventory.revokeConsent(consentId);

      const hasConsent = inventory.hasConsent('test-user', 'analytics');
      expect(hasConsent).toBe(false);
    });
  });

  describe('Personal Data Management', () => {
    it('should store and retrieve personal data', () => {
      const personalData: PersonalData = {
        displayName: 'Test User',
        avatar: 'avatar-url',
        timezone: 'America/New_York',
        preferences: { theme: 'dark', notifications: true },
      };

      inventory.storePersonalData('test-user', personalData);

      const retrievedData = inventory.getPersonalData('test-user');
      
      expect(retrievedData.displayName).toBe('Test User');
      expect(retrievedData.avatar).toBe('avatar-url');
      expect(retrievedData.preferences.theme).toBe('dark');
    });

    it('should update personal data', () => {
      inventory.storePersonalData('test-user', {
        displayName: 'Updated User',
        preferences: { theme: 'light', notifications: false },
      });

      const updatedData = inventory.getPersonalData('test-user');
      expect(updatedData.displayName).toBe('Updated User');
      expect(updatedData.preferences.theme).toBe('light');
    });

    it('should delete personal data', () => {
      inventory.storePersonalData('test-user', {
        displayName: 'Test User',
        avatar: 'avatar-url',
        timezone: 'America/New_York',
        preferences: { theme: 'dark', notifications: true },
      });

      inventory.deletePersonalData('test-user');

      const deletedData = inventory.getPersonalData('test-user');
      expect(deletedData).toBeUndefined();
    });

    it('should emit personal data events', () => {
      const eventSpy = jest.spyOn(global, 'dispatchEvent');
      
      inventory.storePersonalData('test-user', {
        displayName: 'Event Test User',
        preferences: { theme: 'dark' },
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'privacy:personal-data-stored',
          detail: expect.objectContaining({ userId: 'test-user' }),
        })
      );
    });
  });

  describe('Privacy Compliance Audit', () => {
    it('should pass audit with compliant configuration', async () => {
      // Set up compliant configuration
      inventory.registerDataCollectionPoint({
        id: 'compliant-analytics',
        category: 'analytics',
        purpose: 'Compliant analytics',
        dataTypes: ['session-duration'],
        retentionDays: 365,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      });

      inventory.recordConsent({
        consentType: 'analytics',
        granted: true,
        userId: 'compliant-user',
      });

      const result = await inventory.performPrivacyAudit();

      expect(result.passed).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.issues).toHaveLength(0);
      expect(result.gdprRequirements.lawfulBasis).toBe(true);
      expect(result.gdprRequirements.purposeLimitation).toBe(true);
      expect(result.gdprRequirements.dataMinimization).toBe(true);
      expect(result.gdprRequirements.accuracy).toBe(true);
      expect(result.gdprRequirements.storageLimitation).toBe(true);
      expect(result.gdprRequirements.security).toBe(true);
    });

    it('should detect missing consent for required data collection', async () => {
      inventory.registerDataCollectionPoint({
        id: 'required-analytics',
        category: 'analytics',
        purpose: 'Required analytics',
        dataTypes: ['user-behavior'],
        retentionDays: 180,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      });

      // Don't record consent
      const result = await inventory.performPrivacyAudit();

      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(80);
      expect(result.issues.some(issue => issue.category === 'consent')).toBe(true);
      expect(result.issues.some(issue => issue.severity === 'critical')).toBe(true);
    });

    it('should detect excessive data retention', async () => {
      inventory.registerDataCollectionPoint({
        id: 'excessive-retention',
        category: 'personal',
        purpose: 'Excessive personal data storage',
        dataTypes: ['profile-data'],
        retentionDays: 1000, // Over 2.7 years
        requiredConsent: false,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      });

      const result = await inventory.performPrivacyAudit();

      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.issues.some(issue => issue.category === 'retention')).toBe(true);
      expect(result.issues.some(issue => issue.severity === 'major')).toBe(true);
    });

    it('should detect missing encryption for sensitive data', async () => {
      inventory.registerDataCollectionPoint({
        id: 'unencrypted-sensitive',
        category: 'personal',
        purpose: 'Unencrypted sensitive data',
        dataTypes: ['financial-info'],
        retentionDays: 365,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      });

      const result = await inventory.performPrivacyAudit();

      expect(result.passed).toBe(false);
      expect(result.score).toBeLessThan(60);
      expect(result.issues.some(issue => issue.category === 'security')).toBe(true);
      expect(result.issues.some(issue => issue.severity === 'critical')).toBe(true);
    });

    it('should generate comprehensive privacy report', () => {
      inventory.registerDataCollectionPoint({
        id: 'test-issue',
        category: 'analytics',
        purpose: 'Test issue',
        dataTypes: ['test-data'],
        retentionDays: 30,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: false,
        collectedAt: Date.now(),
      });

      inventory.recordConsent({
        consentType: 'analytics',
        granted: false,
        userId: 'test-user',
      });

      const result = await inventory.performPrivacyAudit();
      const report = inventory.generatePrivacyReport();

      expect(report).toContain('# Privacy Compliance Report');
      expect(report).toContain('## Issues Found');
      expect(report).toContain('### CONSENT: Missing consent for required data collection');
    });
  });

  describe('Integration with Security Validation', () => {
    it('should integrate XSS validation in data collection', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      const sanitized = sanitizeAnalyticsProperties({
        eventName: maliciousInput,
        userId: 'test-user',
        sessionId: 'test-session',
      });

      expect(sanitized.eventName).not.toBe(maliciousInput);
      expect(sanitized.eventName).toBe('xss_alert_xss_');
    });

    it('should integrate SQL injection validation', () => {
      const maliciousQuery = "SELECT * FROM users WHERE id = '1' OR '1' = '1; DROP TABLE users;--";
      
      const result = validateSQLInjection(maliciousQuery);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.threats).toHaveLength(1);
    });

    it('should integrate CSRF validation', () => {
      const result = validateCSRF('test-token', 'session-123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Audit History', () => {
    it('should maintain audit history', async () => {
      await inventory.performPrivacyAudit();
      await inventory.performPrivacyAudit();

      const history = inventory.getAuditHistory();
      expect(history).toHaveLength(2);
    });

    it('should clear audit history', () => {
      inventory.clearAuditHistory();
      
      const history = inventory.getAuditHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Reporting and Analytics Integration', () => {
    it('should emit privacy events for data operations', () => {
      const eventSpy = jest.spyOn(global, 'dispatchEvent');
      
      inventory.registerDataCollectionPoint({
        id: 'event-test',
        category: 'analytics',
        purpose: 'Event testing',
        dataTypes: ['test-event'],
        retentionDays: 30,
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      });

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'privacy:data-point-registered',
          detail: expect.objectContaining({ pointId: 'event-test' }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const invalidPoint = {
        id: 'invalid-point',
        category: 'analytics',
        purpose: 'Invalid point',
        dataTypes: ['invalid-data'],
        retentionDays: -1, // Invalid
        requiredConsent: true,
        sharedWithThirdParties: false,
        encryptionRequired: true,
        collectedAt: Date.now(),
      };

      // Should not throw error but handle gracefully
      expect(() => inventory.registerDataCollectionPoint(invalidPoint)).not.toThrow();
      
      const result = await inventory.performPrivacyAudit();
      expect(result.issues.some(issue => issue.category === 'data-collection')).toBe(true);
    });
  });
});