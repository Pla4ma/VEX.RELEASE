export interface BaseNotificationEvent {
  id: string;
  userId: string;
  notificationId?: string;
  channelId?: "in_app" | "push" | "email" | "sms" | "webhook";
  timestamp: Date;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}
export interface EventMetadata {
  source: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  sessionId?: string;
  correlationId?: string;
}
export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "web";
  os: string;
  version: string;
  appVersion?: string;
  pushToken?: string;
}
