import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SessionStackParams } from '../../../navigation/types';
import type { SessionMode } from '../../../session/modes';
import type { PresetWithIcon } from '../utils/session-setup';

export type SessionNavigationProp = NativeStackNavigationProp<SessionStackParams>;
export type SessionSetupParams = SessionStackParams['SessionSetup'];

export type UseStartSessionFlowParams = {
  draftGoal: string | undefined;
  focusContractText: string | null;
  navigation: SessionNavigationProp;
  params: SessionSetupParams | undefined;
  selectedDurationSeconds: number;
  selectedPreset: PresetWithIcon;
  selectedSessionMode: SessionMode;
  selectedThemeId: string;
  selectedThemeOwned: boolean;
  userId: string;
};

export type SessionContextResult = {
  sessionTags: string[];
  notesPayload: Record<string, unknown>;
};
