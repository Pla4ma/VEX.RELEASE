export interface NotificationRouteResult {
    success: boolean;
    screen?: string;
    params?: Record<string, unknown>;
    error?: string;
}

export interface NotificationAction {
    type: NotificationActionType;
    payload?: Record<string, unknown>;
}

export type NotificationActionType = | 'start_session'
      | 'view_boss'
      | 'open_chest'
      | 'view_squad'
      | 'join_duel'
      | 'view_streak'
      | 'open_shop'
      | 'view_profile'
      | 'open_coach'
      | 'accept_invite'
      | 'view_progress'
      | 'custom';
