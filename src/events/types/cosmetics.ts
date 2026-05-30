/**
 * Cosmetics Events
 */

export interface CosmeticsEventDefinitions {
  "cosmetics:unlock_theme": {
    userId: string;
    themeId: string;
    source: string;
  };
}
