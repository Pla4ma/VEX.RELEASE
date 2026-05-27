import { captureSilentFailure } from "../../../utils/silent-failure";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppScreen, Button, Card } from "../../../components/primitives";
import { Text } from "../../../components/primitives/Text";
import {
  ExtractionProgress,
  InputTypeSelector,
  PdfUploader,
  TextPasteInput,
  YouTubeInput,
} from "../components";
import { UI_TEXT } from "../constants";
import { useContentInput } from "../hooks";
import { useTheme } from "../../../theme";
import type {
  ContentSourceType,
  ContentStudyStackParamList,
  InputTab,
} from "../types";

type ContentInputRouteProp = RouteProp<
  ContentStudyStackParamList,
  "ContentInput"
>;
type ContentInputNavigationProp = NativeStackNavigationProp<
  ContentStudyStackParamList,
  "ContentInput"
>;

const TAB_TO_CONTENT_TYPE: Record<InputTab, ContentSourceType> = {
  paste: "PASTE",
  pdf: "PDF",
  youtube: "YOUTUBE",
};

export function ContentInputScreen(): JSX.Element {
  const navigation = useNavigation<ContentInputNavigationProp>();
  const route = useRoute<ContentInputRouteProp>();
  const { theme } = useTheme();
  const {
    state,
    uploadProgress,
    isSubmitting,
    error,
    setTab,
    setPastedText,
    setYoutubeUrl,
    setSelectedFile,
    clearError,
    submit,
  } = useContentInput();
  const [showExtractionProgress, setShowExtractionProgress] = useState(false);

  useEffect(() => {
    const preferredTab = route.params?.preferredTab;
    const prefillText = route.params?.prefillData?.text;
    const prefillUrl = route.params?.prefillData?.url;

    if (preferredTab && preferredTab !== state.activeTab) {
      setTab(preferredTab);
    }

    if (prefillText && !state.pastedText) {
      setPastedText(prefillText);
    }

    if (prefillUrl && !state.youtubeUrl) {
      setYoutubeUrl(prefillUrl);
    }
  }, [
    route.params?.preferredTab,
    route.params?.prefillData?.text,
    route.params?.prefillData?.url,
    setPastedText,
    setTab,
    setYoutubeUrl,
    state.activeTab,
    state.pastedText,
    state.youtubeUrl,
  ]);

  const hasDrafts = useMemo(
    () => ({
      paste: state.pastedText.trim().length > 0,
      pdf: state.selectedFile !== null,
      youtube: state.youtubeUrl.trim().length > 0,
    }),
    [state.pastedText, state.selectedFile, state.youtubeUrl],
  );

  const handleSubmit = useCallback(async () => {
    setShowExtractionProgress(state.activeTab !== "paste");

    try {
      const result = await submit();
      navigation.navigate("ContentReview", { contentId: result.contentId });
    } catch (error) {
      captureSilentFailure(error, {
        feature: "content-study",
        operation: "ui-fallback",
        type: "ui",
      });
      setShowExtractionProgress(false);
    }
  }, [navigation, state.activeTab, submit]);

  const renderActiveInput = (): JSX.Element => {
    if (showExtractionProgress) {
      return (
        <ExtractionProgress
          stage={state.activeTab === "pdf" ? "uploading" : "processing"}
          progress={
            state.activeTab === "pdf" ? Math.max(uploadProgress, 15) : 30
          }
          contentType={TAB_TO_CONTENT_TYPE[state.activeTab]}
        />
      );
    }

    if (state.activeTab === "pdf") {
      return (
        <PdfUploader
          selectedFile={state.selectedFile}
          onFileSelect={setSelectedFile}
          disabled={isSubmitting}
          uploadProgress={uploadProgress}
          uploadError={error}
        />
      );
    }

    if (state.activeTab === "youtube") {
      return (
        <YouTubeInput
          value={state.youtubeUrl}
          onChange={setYoutubeUrl}
          disabled={isSubmitting}
          isExtracting={isSubmitting}
        />
      );
    }

    return (
      <TextPasteInput
        value={state.pastedText}
        onChange={setPastedText}
        disabled={isSubmitting}
        autoFocus
      />
    );
  };

  return (
    <AppScreen keyboardAvoiding contentStyle={{ gap: theme.spacing[5] }}>
      <View style={{ gap: theme.spacing[2] }}>
        <Text color="primary.300" variant="label">
          AI study lab
        </Text>
        <Text color="text.primary" variant="h1">
          {UI_TEXT.INPUT_TITLE}
        </Text>
        <Text color="text.secondary" variant="body">
          {UI_TEXT.INPUT_SUBTITLE}
        </Text>
      </View>

      <Card size="lg" variant="glass">
        <InputTypeSelector
          activeTab={state.activeTab}
          onTabChange={setTab}
          disabled={isSubmitting}
          hasDrafts={hasDrafts}
        />
      </Card>

      <Card
        size="lg"
        variant="elevated"
        style={{ minHeight: theme.spacing[8] * 4 }}
      >
        {renderActiveInput()}
      </Card>

      {error && !showExtractionProgress ? (
        <Card size="md" state="error" variant="glass">
          <Text color="error.DEFAULT" variant="label">
            Study processing paused
          </Text>
          <Text color="text.secondary" mt="xs" variant="bodySmall">
            {error}
          </Text>
          <Button mt="md" onPress={clearError} size="sm" variant="ghost">
            Dismiss
          </Button>
        </Card>
      ) : null}

      <Button
        accessibilityHint="Uploads or processes your selected study source"
        accessibilityLabel={UI_TEXT.SUBMIT_BUTTON}
        accessibilityRole="button"
        fullWidth
        isLoading={isSubmitting}
        onPress={() => void handleSubmit()}
        size="lg"
      >
        {UI_TEXT.SUBMIT_BUTTON}
      </Button>
    </AppScreen>
  );
}
