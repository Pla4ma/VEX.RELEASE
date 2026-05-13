import { capture } from "../../shared/analytics/analytics-service";


export function trackThemesError(
  userId: string,
  errorType: 'loading_error' | 'rendering_error' | 'customization_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    themeId?: string;
    component?: string;
  }
): void {
  capture('themes_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

export function trackThemesFunnel(
  userId: string,
  step: 'theme_applied' | 'first_customization' | 'accessibility_enabled' | 'auto_switch_configured' | 'theme_shared' | 'expert_user'
): void {
  capture('themes_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}