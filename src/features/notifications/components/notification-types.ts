export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'urgency' | 'social' | 'system';
  priority: 'low' | 'normal' | 'high' | 'critical';
  read: boolean;
  timestamp: number;
  action?: {
    type: 'start_session' | 'view_boss' | 'open_chest' | 'dismiss';
    payload?: Record<string, unknown>;
  };
}

export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onAction: (notification: NotificationItem) => void;
  onClose: () => void;
}
