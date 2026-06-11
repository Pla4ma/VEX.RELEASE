/**
 * Trigger.dev Configuration
 * 
 * Main configuration file for Trigger.dev SDK v4.
 */

import { configure } from 'npm:@trigger.dev/sdk';

/**
 * Initialize Trigger.dev with environment configuration
 */
export function initTriggerDev() {
  configure({
    // API Key from environment (server-side only)
    apiKey: process.env.TRIGGER_SECRET_KEY!,
    
    // API URL (use default for cloud, override for self-hosted)
    apiUrl: process.env.TRIGGER_API_URL || 'https://api.trigger.dev',
    
    // Project reference
    project: process.env.TRIGGER_PROJECT_REF!,
    
    // Log level — valid Trigger.dev log levels
    logLevel: (process.env.TRIGGER_LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'log' | 'warn' | 'error',
  });
}
