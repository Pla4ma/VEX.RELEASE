/**
 * Trigger.dev Jobs Index
 * 
 * Export all job definitions for Trigger.dev deployment.
 */

// Challenge Jobs
export { challengeDailyRefresh } from './challenges/daily-refresh';

// Notification Jobs  
export { notificationBatchSend } from './notifications/batch-send';
export { reEngagementCheck } from './notifications/re-engagement-check';

// Maintenance Jobs
export { maintenanceHealthCheck } from './maintenance/health-check';

// Season Jobs
export { finalizeSeasonTask } from './seasons/finalize-season';

// Squad War Jobs
export { squadWarWeeklyReset } from './squad-wars/weekly-reset';
