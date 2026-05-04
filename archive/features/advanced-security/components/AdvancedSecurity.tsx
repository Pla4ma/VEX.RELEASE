/**
 * Advanced Security Component
 * 
 * Main UI component for advanced security features including threat detection,
 * security monitoring, vulnerability assessment, incident response,
 * security analytics, and compliance tracking.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Card } from '../../../components/primitives/Card';
import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { useAdvancedSecurity, SecurityThreat, SecurityVulnerability, SecurityIncident, SecurityCompliance } from '../hooks/useAdvancedSecurity';

interface AdvancedSecurityProps {
  userId: string;
  onThreatDetails?: (threatId: string) => void;
  onVulnerabilityDetails?: (vulnerabilityId: string) => void;
  onIncidentDetails?: (incidentId: string) => void;
  onComplianceDetails?: (complianceId: string) => void;
  onSecuritySettings?: () => void;
}

export function AdvancedSecurity({
  userId,
  onThreatDetails,
  onVulnerabilityDetails,
  onIncidentDetails,
  onComplianceDetails,
  onSecuritySettings,
}: AdvancedSecurityProps) {
  const {
    threats,
    metrics,
    vulnerabilities,
    incidents,
    compliance,
    analytics,
    loading,
    error,
    detectThreats,
    acknowledgeThreat,
    investigateThreat,
    mitigateThreat,
    resolveThreat,
    markFalsePositive,
    scanVulnerabilities,
    assessVulnerability,
    remediateVulnerability,
    patchVulnerability,
    acceptRisk,
    createIncident,
    updateIncident,
    escalateIncident,
    closeIncident,
    assessCompliance,
    updateCompliance,
    remediateCompliance,
    generateComplianceReport,
    refreshAnalytics,
    exportSecurityData,
    startMonitoring,
    stopMonitoring,
    updateMonitoringRules,
  } = useAdvancedSecurity(userId);

  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'vulnerabilities' | 'incidents' | 'compliance' | 'analytics'>('overview');
  const [expandedThreat, setExpandedThreat] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleThreatAction = (threatId: string, action: 'acknowledge' | 'investigate' | 'mitigate' | 'resolve' | 'false_positive') => {
    switch (action) {
      case 'acknowledge':
        acknowledgeThreat(threatId);
        break;
      case 'investigate':
        investigateThreat(threatId);
        break;
      case 'mitigate':
        mitigateThreat(threatId, ['Initial mitigation applied']);
        break;
      case 'resolve':
        resolveThreat(threatId);
        break;
      case 'false_positive':
        markFalsePositive(threatId);
        break;
    }
  };

  const renderOverview = () => {
    const criticalThreats = threats.filter(t => t.severity === 'critical').length;
    const openVulnerabilities = vulnerabilities.filter(v => v.status === 'open').length;
    const activeIncidents = incidents.filter(i => i.status !== 'closed').length;
    const complianceScore = analytics.compliance.overallScore;

    return (
      <View style={styles.overviewContainer}>
        {/* Security Score Card */}
        <Card style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>🛡️ Security Score</Text>
          <Text style={styles.scoreValue}>{complianceScore}%</Text>
          <ProgressBar progress={complianceScore} color="#27AE60" />
          <Text style={styles.scoreDescription}>Overall security health</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{criticalThreats}</Text>
            <Text style={styles.statLabel}>Critical Threats</Text>
            <Badge text={criticalThreats > 0 ? 'Action Required' : 'Clear'} variant={criticalThreats > 0 ? 'danger' : 'success'} />
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{openVulnerabilities}</Text>
            <Text style={styles.statLabel}>Open Vulnerabilities</Text>
            <Badge text={openVulnerabilities > 5 ? 'High' : 'Normal'} variant={openVulnerabilities > 5 ? 'warning' : 'success'} />
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{activeIncidents}</Text>
            <Text style={styles.statLabel}>Active Incidents</Text>
            <Badge text={activeIncidents > 0 ? 'Investigating' : 'None'} variant={activeIncidents > 0 ? 'warning' : 'success'} />
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{analytics.response.averageDetectionTime.toFixed(1)}s</Text>
            <Text style={styles.statLabel}>Avg Detection Time</Text>
            <Badge text="Good" variant="success" />
          </Card>
        </View>

        {/* Recent Activity */}
        <Card style={styles.activityCard}>
          <Text style={styles.activityTitle}>📊 Recent Security Activity</Text>
          <View style={styles.activityList}>
            {threats.slice(0, 3).map((threat) => (
              <View key={threat.id} style={styles.activityItem}>
                <Text style={styles.activityType}>{threat.type}</Text>
                <Text style={styles.activityDescription}>{threat.title}</Text>
                <Text style={styles.activityTime}>{threat.timestamp.toLocaleTimeString()}</Text>
                <Badge text={threat.severity} variant={threat.severity === 'critical' ? 'danger' : threat.severity === 'high' ? 'warning' : 'secondary'} />
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Button
              title="Scan Threats"
              onPress={detectThreats}
              variant="primary"
              style={styles.actionButton}
            />
            <Button
              title="Scan Vulnerabilities"
              onPress={scanVulnerabilities}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Start Monitoring"
              onPress={startMonitoring}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Export Report"
              onPress={() => exportSecurityData('pdf')}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </View>
    );
  };

  const renderThreats = () => {
    const activeThreats = threats.filter(t => t.status !== 'resolved' && t.status !== 'false_positive');

    if (activeThreats.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>No Active Threats</Text>
          <Text style={styles.emptyDescription}>All threats have been resolved or marked as false positives</Text>
          <Button
            title="Scan for Threats"
            onPress={detectThreats}
            variant="primary"
            style={styles.scanButton}
          />
        </Card>
      );
    }

    return (
      <View style={styles.threatsContainer}>
        {activeThreats.map((threat) => (
          <Card key={threat.id} style={styles.threatCard}>
            <View style={styles.threatHeader}>
              <Text style={styles.threatType}>{threat.type}</Text>
              <Badge text={threat.severity} variant={threat.severity === 'critical' ? 'danger' : threat.severity === 'high' ? 'warning' : 'secondary'} />
            </View>
            
            <Text style={styles.threatTitle}>{threat.title}</Text>
            <Text style={styles.threatDescription}>{threat.description}</Text>
            
            <View style={styles.threatDetails}>
              <Text style={styles.threatDetail}>Source: {threat.source}</Text>
              <Text style={styles.threatDetail}>Target: {threat.target}</Text>
              <Text style={styles.threatDetail}>Time: {threat.timestamp.toLocaleString()}</Text>
            </View>

            <View style={styles.threatActions}>
              {threat.status === 'detected' && (
                <Button
                  title="Acknowledge"
                  onPress={() => handleThreatAction(threat.id, 'acknowledge')}
                  variant="secondary"
                  style={styles.threatButton}
                />
              )}
              {threat.status === 'investigating' && (
                <Button
                  title="Mitigate"
                  onPress={() => handleThreatAction(threat.id, 'mitigate')}
                  variant="primary"
                  style={styles.threatButton}
                />
              )}
              {threat.status === 'mitigating' && (
                <Button
                  title="Resolve"
                  onPress={() => handleThreatAction(threat.id, 'resolve')}
                  variant="primary"
                  style={styles.threatButton}
                />
              )}
              <Button
                title="Details"
                onPress={() => onThreatDetails && onThreatDetails(threat.id)}
                variant="secondary"
                style={styles.threatButton}
              />
              <Button
                title="False Positive"
                onPress={() => handleThreatAction(threat.id, 'false_positive')}
                variant="secondary"
                style={styles.threatButton}
              />
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderVulnerabilities = () => {
    const openVulns = vulnerabilities.filter(v => v.status === 'open' || v.status === 'in_progress');

    if (openVulns.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>No Open Vulnerabilities</Text>
          <Text style={styles.emptyDescription}>All vulnerabilities have been patched or mitigated</Text>
          <Button
            title="Scan for Vulnerabilities"
            onPress={scanVulnerabilities}
            variant="primary"
            style={styles.scanButton}
          />
        </Card>
      );
    }

    return (
      <View style={styles.vulnerabilitiesContainer}>
        {openVulns.map((vulnerability) => (
          <Card key={vulnerability.id} style={styles.vulnerabilityCard}>
            <View style={styles.vulnerabilityHeader}>
              <Text style={styles.vulnerabilityType}>{vulnerability.type}</Text>
              <Badge text={vulnerability.severity} variant={vulnerability.severity === 'critical' ? 'danger' : vulnerability.severity === 'high' ? 'warning' : 'secondary'} />
            </View>
            
            <Text style={styles.vulnerabilityTitle}>{vulnerability.title}</Text>
            <Text style={styles.vulnerabilityDescription}>{vulnerability.description}</Text>
            
            <View style={styles.vulnerabilityDetails}>
              <Text style={styles.vulnerabilityDetail}>CVSS Score: {vulnerability.cvssScore}</Text>
              <Text style={styles.vulnerabilityDetail}>Systems: {vulnerability.affectedSystems.length}</Text>
              <Text style={styles.vulnerabilityDetail}>Discovered: {vulnerability.discoveredDate.toLocaleDateString()}</Text>
            </View>

            <View style={styles.vulnerabilityActions}>
              {vulnerability.status === 'open' && (
                <Button
                  title="Assess"
                  onPress={() => assessVulnerability(vulnerability.id)}
                  variant="secondary"
                  style={styles.vulnerabilityButton}
                />
              )}
              <Button
                title="Remediate"
                onPress={() => remediateVulnerability(vulnerability.id, ['Apply patches'])}
                variant="primary"
                style={styles.vulnerabilityButton}
              />
              <Button
                title="Details"
                onPress={() => onVulnerabilityDetails && onVulnerabilityDetails(vulnerability.id)}
                variant="secondary"
                style={styles.vulnerabilityButton}
              />
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderIncidents = () => {
    const activeIncidents = incidents.filter(i => i.status !== 'closed');

    if (activeIncidents.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Active Incidents</Text>
          <Text style={styles.emptyDescription}>All incidents have been resolved</Text>
          <Button
            title="Create Incident"
            onPress={() => createIncident({
              type: 'security_breach',
              severity: 'medium',
              title: 'New Security Incident',
              description: 'Manual incident creation',
              status: 'open',
              timeline: [],
              impact: {
                systemsAffected: 0,
                dataCompromised: false,
                usersAffected: 0,
                downtime: 0,
                financialCost: 0,
              },
              response: {
                team: [],
                actions: [],
                containment: [],
                eradication: [],
                recovery: [],
              },
              lessons: [],
              metadata: {
                category: 'manual',
                rootCause: 'unknown',
                prevention: [],
                tags: [],
              },
            })}
            variant="primary"
            style={styles.scanButton}
          />
        </Card>
      );
    }

    return (
      <View style={styles.incidentsContainer}>
        {activeIncidents.map((incident) => (
          <Card key={incident.id} style={styles.incidentCard}>
            <View style={styles.incidentHeader}>
              <Text style={styles.incidentType}>{incident.type}</Text>
              <Badge text={incident.severity} variant={incident.severity === 'critical' ? 'danger' : incident.severity === 'high' ? 'warning' : 'secondary'} />
            </View>
            
            <Text style={styles.incidentTitle}>{incident.title}</Text>
            <Text style={styles.incidentDescription}>{incident.description}</Text>
            
            <View style={styles.incidentDetails}>
              <Text style={styles.incidentDetail}>Detected: {incident.detectedDate.toLocaleString()}</Text>
              <Text style={styles.incidentDetail}>Status: {incident.status}</Text>
              <Text style={styles.incidentDetail}>Systems Affected: {incident.impact.systemsAffected}</Text>
            </View>

            <View style={styles.incidentActions}>
              <Button
                title="Update"
                onPress={() => updateIncident(incident.id, { status: 'investigating' })}
                variant="secondary"
                style={styles.incidentButton}
              />
              <Button
                title="Details"
                onPress={() => onIncidentDetails && onIncidentDetails(incident.id)}
                variant="primary"
                style={styles.incidentButton}
              />
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderCompliance = () => {
    const complianceItems = compliance.filter(c => c.status !== 'compliant');

    return (
      <View style={styles.complianceContainer}>
        <Card style={styles.complianceOverviewCard}>
          <Text style={styles.complianceOverviewTitle}>📊 Overall Compliance Score</Text>
          <Text style={styles.complianceScore}>{analytics.compliance.overallScore}%</Text>
          <ProgressBar progress={analytics.compliance.overallScore} color="#3498DB" />
          
          <View style={styles.frameworkScores}>
            {Object.entries(analytics.compliance.byFramework).map(([framework, score]) => (
              <View key={framework} style={styles.frameworkScore}>
                <Text style={styles.frameworkName}>{framework}</Text>
                <Text style={styles.frameworkValue}>{score}%</Text>
                <ProgressBar progress={score} color="#27AE60" />
              </View>
            ))}
          </View>
        </Card>

        {complianceItems.map((item) => (
          <Card key={item.id} style={styles.complianceCard}>
            <View style={styles.complianceHeader}>
              <Text style={styles.complianceFramework}>{item.framework}</Text>
              <Badge text={item.status} variant={item.status === 'compliant' ? 'success' : item.status === 'non_compliant' ? 'danger' : 'warning'} />
            </View>
            
            <Text style={styles.complianceRequirement}>{item.requirement}</Text>
            <Text style={styles.complianceCategory}>{item.category}</Text>
            
            <View style={styles.complianceDetails}>
              <Text style={styles.complianceDetail}>Score: {item.score}%</Text>
              <Text style={styles.complianceDetail}>Last Assessed: {item.lastAssessed.toLocaleDateString()}</Text>
              <Text style={styles.complianceDetail}>Next Assessment: {item.nextAssessment.toLocaleDateString()}</Text>
            </View>

            <View style={styles.complianceActions}>
              <Button
                title="Update"
                onPress={() => updateCompliance(item.id, { score: Math.min(100, item.score + 5) })}
                variant="secondary"
                style={styles.complianceButton}
              />
              <Button
                title="Remediate"
                onPress={() => remediateCompliance(item.id, ['Apply controls'])}
                variant="primary"
                style={styles.complianceButton}
              />
              <Button
                title="Report"
                onPress={() => generateComplianceReport(item.framework)}
                variant="secondary"
                style={styles.complianceButton}
              />
            </View>
          </Card>
        ))}
      </View>
    );
  };

  const renderAnalytics = () => {
    return (
      <View style={styles.analyticsContainer}>
        {/* Threat Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>🎯 Threat Analytics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.threats.total}</Text>
              <Text style={styles.analyticsLabel}>Total Threats</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.threats.bySeverity.critical}</Text>
              <Text style={styles.analyticsLabel}>Critical</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.threats.bySeverity.high}</Text>
              <Text style={styles.analyticsLabel}>High</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.response.averageDetectionTime.toFixed(1)}s</Text>
              <Text style={styles.analyticsLabel}>Avg Detection</Text>
            </View>
          </View>
        </Card>

        {/* Vulnerability Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>🔍 Vulnerability Analytics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.vulnerabilities.total}</Text>
              <Text style={styles.analyticsLabel}>Total</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.vulnerabilities.open}</Text>
              <Text style={styles.analyticsLabel}>Open</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.vulnerabilities.averageResolutionTime.toFixed(1)}d</Text>
              <Text style={styles.analyticsLabel}>Avg Resolution</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.vulnerabilities.bySeverity.critical}</Text>
              <Text style={styles.analyticsLabel}>Critical</Text>
            </View>
          </View>
        </Card>

        {/* Incident Analytics */}
        <Card style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>📋 Incident Analytics</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.incidents.total}</Text>
              <Text style={styles.analyticsLabel}>Total</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.incidents.open}</Text>
              <Text style={styles.analyticsLabel}>Open</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{analytics.incidents.mttr.toFixed(1)}h</Text>
              <Text style={styles.analyticsLabel}>MTTR</Text>
            </View>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{(analytics.response.containmentRate * 100).toFixed(0)}%</Text>
              <Text style={styles.analyticsLabel}>Containment Rate</Text>
            </View>
          </View>
        </Card>

        {/* Export Options */}
        <Card style={styles.exportCard}>
          <Text style={styles.exportTitle}>📤 Export Security Data</Text>
          <View style={styles.exportOptions}>
            <Button
              title="Export JSON"
              onPress={() => exportSecurityData('json')}
              variant="secondary"
              style={styles.exportButton}
            />
            <Button
              title="Export CSV"
              onPress={() => exportSecurityData('csv')}
              variant="secondary"
              style={styles.exportButton}
            />
            <Button
              title="Export PDF Report"
              onPress={() => exportSecurityData('pdf')}
              variant="primary"
              style={styles.exportButton}
            />
          </View>
        </Card>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderOverview()}
          </Animated.View>
        );
      case 'threats':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderThreats()}
          </Animated.View>
        );
      case 'vulnerabilities':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderVulnerabilities()}
          </Animated.View>
        );
      case 'incidents':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderIncidents()}
          </Animated.View>
        );
      case 'compliance':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderCompliance()}
          </Animated.View>
        );
      case 'analytics':
        return (
          <Animated.View style={[styles.tabContent, { opacity: fadeAnim }]}>
            {renderAnalytics()}
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Advanced Security...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={refreshAnalytics} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['overview', 'threats', 'vulnerabilities', 'incidents', 'compliance', 'analytics'].map((tab) => (
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
  overviewContainer: {
    gap: 16,
  },
  scoreCard: {
    padding: 20,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#27AE60',
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 8,
  },
  activityCard: {
    padding: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  activityList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityType: {
    fontSize: 12,
    color: '#7F8C8D',
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#7F8C8D',
    flex: 1,
  },
  actionsCard: {
    padding: 16,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    // Additional styling handled by Button component
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
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
  },
  scanButton: {
    paddingHorizontal: 24,
  },
  threatsContainer: {
    gap: 12,
  },
  threatCard: {
    padding: 16,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  threatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  threatDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  threatDetails: {
    gap: 2,
    marginBottom: 12,
  },
  threatDetail: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  threatActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  threatButton: {
    paddingHorizontal: 12,
  },
  vulnerabilitiesContainer: {
    gap: 12,
  },
  vulnerabilityCard: {
    padding: 16,
  },
  vulnerabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vulnerabilityType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  vulnerabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  vulnerabilityDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  vulnerabilityDetails: {
    gap: 2,
    marginBottom: 12,
  },
  vulnerabilityDetail: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  vulnerabilityActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  vulnerabilityButton: {
    paddingHorizontal: 12,
  },
  incidentsContainer: {
    gap: 12,
  },
  incidentCard: {
    padding: 16,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  incidentDetails: {
    gap: 2,
    marginBottom: 12,
  },
  incidentDetail: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  incidentActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  incidentButton: {
    paddingHorizontal: 12,
  },
  complianceContainer: {
    gap: 12,
  },
  complianceOverviewCard: {
    padding: 20,
  },
  complianceOverviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  complianceScore: {
    fontSize: 36,
    fontWeight: '700',
    color: '#3498DB',
    marginBottom: 12,
  },
  frameworkScores: {
    gap: 12,
    marginTop: 20,
  },
  frameworkScore: {
    gap: 4,
  },
  frameworkName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  frameworkValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60',
  },
  complianceCard: {
    padding: 16,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complianceFramework: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  complianceRequirement: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  complianceCategory: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  complianceDetails: {
    gap: 2,
    marginBottom: 12,
  },
  complianceDetail: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  complianceActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  complianceButton: {
    paddingHorizontal: 12,
  },
  analyticsContainer: {
    gap: 12,
  },
  analyticsCard: {
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  analyticsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3498DB',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  exportCard: {
    padding: 16,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  exportOptions: {
    gap: 12,
  },
  exportButton: {
    // Additional styling handled by Button component
  },
});
