export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
}

export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  correlationId?: string;
}

export interface BaseSessionCompletionEvent {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}
