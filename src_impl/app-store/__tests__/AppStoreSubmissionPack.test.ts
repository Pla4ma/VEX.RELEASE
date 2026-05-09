/**
 * App Store Submission Pack Tests
 * 
 * Comprehensive test suite for App Store submission preparation.
 * Tests metadata preparation, visual assets, privacy policy generation,
 * terms of service, compliance checking, and testing account setup.
 */

import { AppStoreSubmissionPack, appStoreSubmissionPack } from '../AppStoreSubmissionPack';
import { privacyInventory } from '../../privacy/PrivacyInventory';
import { performanceGate } from '../../performance/PerformanceGate';
import type {
  AppStoreSubmissionResult,
  AppStoreIssue,
} from '../AppStoreSubmissionPack';

// Mock dependencies
jest.mock('../../privacy/PrivacyInventory');
jest.mock('../../performance/PerformanceGate');

const mockPrivacyInventory = privacyInventory as jest.Mocked<typeof privacyInventory>;
const mockPerformanceGate = performanceGate as jest.Mocked<typeof performanceGate>;

describe('AppStoreSubmissionPack', () => {
  let submissionPack: AppStoreSubmissionPack;

  beforeEach(() => {
    submissionPack = AppStoreSubmissionPack.getInstance();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AppStoreSubmissionPack.getInstance();
      const instance2 = AppStoreSubmissionPack.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(appStoreSubmissionPack).toBeInstanceOf(AppStoreSubmissionPack);
    });
  });

  describe('App Metadata Preparation', () => {
    it('should prepare complete app metadata', async () => {
      const result = await submissionPack.prepareAppMetadata();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.metadata.appName).toBe('VEX - Focus & Productivity');
      expect(result.metadata.subtitle).toBe('Gamified Focus Sessions');
      expect(result.metadata.category).toBe('Productivity');
      expect(result.metadata.contentRating).toBe('4+');
      expect(result.metadata.version).toBe('1.0.0');
      expect(result.metadata.buildNumber).toBe('1');
    });

    it('should generate comprehensive app description', async () => {
      const result = await submissionPack.prepareAppMetadata();

      expect(result.metadata.description).toContain('gamified productivity');
      expect(result.metadata.description).toContain('focus sessions');
      expect(result.metadata.description).toContain('achievements');
      expect(result.metadata.description).toContain('squads');
      expect(result.metadata.description).toContain('analytics');
    });

    it('should include relevant keywords', async () => {
      const result = await submissionPack.prepareAppMetadata();

      expect(result.metadata.keywords).toContain('focus');
      expect(result.metadata.keywords).toContain('productivity');
      expect(result.metadata.keywords).toContain('pomodoro');
      expect(result.metadata.keywords).toContain('gamification');
    });

    it('should generate meaningful release notes', async () => {
      const result = await submissionPack.prepareAppMetadata();

      expect(result.metadata.releaseNotes).toContain('Welcome to VEX 1.0.0');
      expect(result.metadata.releaseNotes).toContain('gamified focus timer');
      expect(result.metadata.releaseNotes).toContain('achievement system');
    });

    it('should calculate app size', async () => {
      const result = await submissionPack.prepareAppMetadata();

      expect(result.metadata.size).toBe('45.2 MB');
    });
  });

  describe('Visual Assets Preparation', () => {
    it('should prepare complete visual assets', async () => {
      const result = await submissionPack.prepareVisualAssets();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.assets.screenshots.iPhone).toHaveLength(6);
      expect(result.assets.screenshots.iPad).toHaveLength(3);
      expect(result.assets.screenshots.AppleTV).toHaveLength(2);
    });

    it('should include all required iPhone screenshots', async () => {
      const result = await submissionPack.prepareVisualAssets();

      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-1.png');
      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-2.png');
      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-3.png');
      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-4.png');
      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-5.png');
      expect(result.assets.screenshots.iPhone).toContain('iPhone-6.7-6.png');
    });

    it('should include required iPad screenshots', async () => {
      const result = await submissionPack.prepareVisualAssets();

      expect(result.assets.screenshots.iPad).toContain('iPad-12.9-1.png');
      expect(result.assets.screenshots.iPad).toContain('iPad-12.9-2.png');
      expect(result.assets.screenshots.iPad).toContain('iPad-12.9-3.png');
    });

    it('should include Apple TV screenshots', async () => {
      const result = await submissionPack.prepareVisualAssets();

      expect(result.assets.screenshots.AppleTV).toContain('AppleTV-1.png');
      expect(result.assets.screenshots.AppleTV).toContain('AppleTV-2.png');
    });

    it('should generate app icon with all required sizes', async () => {
      const result = await submissionPack.prepareVisualAssets();

      expect(result.assets.appIcon.generated).toBe(true);
      expect(result.assets.appIcon.sizes['1024x1024']).toBe('AppIcon-1024.png');
      expect(result.assets.appIcon.sizes['180x180']).toBe('AppIcon-180.png');
      expect(result.assets.appIcon.sizes['167x167']).toBe('AppIcon-167.png');
      expect(result.assets.appIcon.sizes['152x152']).toBe('AppIcon-152.png');
    });
  });

  describe('Privacy Policy Generation', () => {
    it('should generate comprehensive privacy policy', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      const result = await submissionPack.generatePrivacyPolicy();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.privacyPolicy.generated).toBe(true);
      expect(result.privacyPolicy.content).toContain('Privacy Policy for VEX');
    });

    it('should include all required privacy policy sections', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      const result = await submissionPack.generatePrivacyPolicy();

      expect(result.privacyPolicy.content).toContain('Introduction');
      expect(result.privacyPolicy.content).toContain('Information We Collect');
      expect(result.privacyPolicy.content).toContain('How We Use Your Information');
      expect(result.privacyPolicy.content).toContain('Data Storage and Security');
      expect(result.privacyPolicy.content).toContain('Data Sharing');
      expect(result.privacyPolicy.content).toContain('Your Rights');
      expect(result.privacyPolicy.content).toContain('Contact Us');
      expect(result.privacyPolicy.content).toContain('GDPR Compliance');
    });

    it('should set last updated date', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      const result = await submissionPack.generatePrivacyPolicy();

      expect(result.privacyPolicy.lastUpdated).toBe(new Date().toISOString().split('T')[0]);
    });

    it('should handle privacy report errors', async () => {
      mockPrivacyInventory.generateComplianceReport.mockRejectedValue(new Error('Privacy report failed'));

      const result = await submissionPack.generatePrivacyPolicy();

      expect(result.complete).toBe(false);
      expect(result.issues).toContain('Privacy policy generation failed: Privacy report failed');
    });
  });

  describe('Terms of Service Generation', () => {
    it('should generate comprehensive terms of service', async () => {
      const result = await submissionPack.generateTermsOfService();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.termsOfService.generated).toBe(true);
      expect(result.termsOfService.content).toContain('Terms of Service for VEX');
    });

    it('should include all required terms sections', async () => {
      const result = await submissionPack.generateTermsOfService();

      expect(result.termsOfService.content).toContain('Acceptance of Terms');
      expect(result.termsOfService.content).toContain('Description of Service');
      expect(result.termsOfService.content).toContain('User Accounts');
      expect(result.termsOfService.content).toContain('Acceptable Use');
      expect(result.termsOfService.content).toContain('Intellectual Property');
      expect(result.termsOfService.content).toContain('Privacy');
      expect(result.termsOfService.content).toContain('Disclaimers');
      expect(result.termsOfService.content).toContain('Limitation of Liability');
      expect(result.termsOfService.content).toContain('Contact Information');
    });

    it('should include paid features section', async () => {
      const result = await submissionPack.generateTermsOfService();

      expect(result.termsOfService.content).toContain('Paid Features');
      expect(result.termsOfService.content).toContain('In-App Purchases');
      expect(result.termsOfService.content).toContain('Subscription Services');
    });

    it('should set last updated date', async () => {
      const result = await submissionPack.generateTermsOfService();

      expect(result.termsOfService.lastUpdated).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('App Store Compliance Check', () => {
    it('should pass compliance check with good metrics', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 95,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.checkAppStoreCompliance();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect performance score issues', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 75,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.checkAppStoreCompliance();

      expect(result.complete).toBe(false);
      expect(result.issues).toContain('App performance score is below 80 - may affect App Store approval');
    });

    it('should detect GDPR compliance issues', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: false,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 50,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 95,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.checkAppStoreCompliance();

      expect(result.complete).toBe(false);
      expect(result.issues).toContain('App is not GDPR compliant - required for App Store approval');
    });

    it('should handle compliance check errors', async () => {
      mockPrivacyInventory.generateComplianceReport.mockRejectedValue(new Error('Compliance check failed'));

      const result = await submissionPack.checkAppStoreCompliance();

      expect(result.complete).toBe(false);
      expect(result.issues).toContain('Compliance check failed: Compliance check failed');
    });
  });

  describe('Testing Accounts Setup', () => {
    it('should setup complete testing accounts', async () => {
      const result = await submissionPack.setupTestingAccounts();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.testingAccounts.demo.username).toBe('vex-demo@example.com');
      expect(result.testingAccounts.demo.password).toBe('VexDemo123!');
      expect(result.testingAccounts.premium.username).toBe('vex-premium@example.com');
      expect(result.testingAccounts.premium.password).toBe('VexPremium123!');
    });

    it('should include descriptive account information', async () => {
      const result = await submissionPack.setupTestingAccounts();

      expect(result.testingAccounts.demo.description).toContain('Demo account');
      expect(result.testingAccounts.demo.description).toContain('App Store review');
      expect(result.testingAccounts.premium.description).toContain('Premium account');
      expect(result.testingAccounts.premium.description).toContain('all features unlocked');
    });
  });

  describe('App Store Connect Configuration', () => {
    it('should generate complete App Store Connect config', async () => {
      const result = await submissionPack.generateAppStoreConnectConfig();

      expect(result.complete).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.config.appInformation['App Name']).toBe('VEX - Focus & Productivity');
      expect(result.config.appInformation['SKU']).toBe('com.vexapp.focus');
      expect(result.config.appInformation['Bundle ID']).toBe('com.vexapp.focus');
      expect(result.config.appInformation['Category']).toBe('Productivity');
    });

    it('should include pricing and availability', async () => {
      const result = await submissionPack.generateAppStoreConnectConfig();

      expect(result.config.pricingAndAvailability['Price']).toBe('Free');
      expect(result.config.pricingAndAvailability['Availability']).toBe('Worldwide');
    });

    it('should include app review information', async () => {
      const result = await submissionPack.generateAppStoreConnectConfig();

      expect(result.config.appReviewInformation['Review Notes']).toContain('demo accounts');
      expect(result.config.appReviewInformation['Contact Info']).toBe('support@vexapp.com');
      expect(result.config.appReviewInformation['Demo Account']).toBe('vex-demo@example.com / VexDemo123!');
      expect(result.config.appReviewInformation['App Review Account']).toBe('vex-premium@example.com / VexPremium123!');
    });
  });

  describe('Full Submission Pack Preparation', () => {
    it('should prepare complete submission pack', async () => {
      // Mock all dependencies to return successful results
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 95,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.prepareFullSubmissionPack();

      expect(result.ready).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.issues).toHaveLength(0);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should include all materials in submission pack', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 95,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.prepareFullSubmissionPack();

      expect(result.materials.metadata).toBeDefined();
      expect(result.materials.privacyPolicy).toBeDefined();
      expect(result.materials.termsOfService).toBeDefined();
      expect(result.materials.screenshots).toBeDefined();
      expect(result.materials.appIcon).toBeDefined();
      expect(result.materials.testingAccounts).toBeDefined();
      expect(result.materials.appStoreConnect).toBeDefined();
    });

    it('should calculate correct score based on issues', async () => {
      // Mock dependencies to return results with issues
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: false,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 50,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 75,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.prepareFullSubmissionPack();

      expect(result.ready).toBe(false);
      expect(result.score).toBeLessThan(90);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should generate appropriate recommendations', async () => {
      // Mock dependencies to return results with issues
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: false,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 50,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 75,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.prepareFullSubmissionPack();

      expect(result.recommendations).toContain('Complete privacy policy and terms of service');
      expect(result.recommendations).toContain('Ensure compliance with GDPR and other privacy regulations');
      expect(result.recommendations).toContain('Address all App Store guideline violations');
    });

    it('should track submission results', async () => {
      mockPrivacyInventory.generateComplianceReport.mockResolvedValue({
        gdprCompliant: true,
        dataPoints: [],
        consentRecords: [],
        issues: [],
        score: 100,
      });

      mockPerformanceGate.generatePerformanceReport.mockResolvedValue({
        score: 95,
        metrics: {},
        issues: [],
        recommendations: [],
        timestamp: Date.now(),
      });

      const result = await submissionPack.prepareFullSubmissionPack();

      const submissionResults = submissionPack.getSubmissionResults();
      expect(submissionResults).toHaveLength(1);
      expect(submissionResults[0]).toBe(result);
    });
  });

  describe('Error Handling', () => {
    it('should handle service initialization errors gracefully', async () => {
      // Mock errors in all services
      mockPrivacyInventory.generateComplianceReport.mockRejectedValue(new Error('Service unavailable'));
      mockPerformanceGate.generatePerformanceReport.mockRejectedValue(new Error('Service unavailable'));

      const result = await submissionPack.prepareFullSubmissionPack();

      expect(result.ready).toBe(false);
      expect(result.score).toBeLessThan(90);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});