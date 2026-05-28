import type { SessionTheme } from "../../../features/themes/session-themes";
import type { SessionMode } from "../../../session/modes";
import type {
  PresetWithIcon,
  SmartSuggestion,
} from "../utils/session-setup";

type Challenge = NonNullable<
  import("../../../features/mastery/types").MasteryState["activeChallenges"]
>[number];

export type SessionSetupCustomizationProps = {
  activeChallenges: Challenge[];
  filteredPresets: PresetWithIcon[];
  hasActiveStudyPlan: boolean;
  onPressTheme: (theme: SessionTheme) => void;
  onSelectPreset: (preset: PresetWithIcon) => void;
  onSelectSessionMode: (mode: SessionMode) => void;
  onSelectSmartSuggestion: () => void;
  onToggleAdvanced: () => void;
  onUpdateCategory: (category: string) => void;
  routeSuggestedDifficulty?: "EASY" | "NORMAL" | "CHALLENGING" | "PUSH";
  selectedCategory: string;
  selectedDurationSeconds: number;
  selectedPreset: PresetWithIcon;
  selectedSessionMode: SessionMode;
  selectedTheme: SessionTheme;
  selectedThemeId: string;
  showAdvanced: boolean;
  smartSuggestion: SmartSuggestion | null;
  themeQueryError: boolean;
  themeQueryLoading: boolean;
  themeQueryRetry: () => void;
  themes: SessionTheme[];
};

export type { Challenge };
