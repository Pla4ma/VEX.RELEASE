import { captureSilentFailure } from '../../../utils/silent-failure';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Text } from '../../../components/primitives/Text';
import {
  ExtractionProgress,
  InputTypeSelector,
  PdfUploader,
  TextPasteInput,
  YouTubeInput,
} from '../components';
import { UI_TEXT } from '../constants';
import { useContentInput } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';
import type {
  ContentSourceType,
  ContentStudyStackParamList,
  InputTab,
} from '../types';

type ContentInputRouteProp = RouteProp<ContentStudyStackParamList, 'ContentInput'>;
type ContentInputNavigationProp = NativeStackNavigationProp<
  ContentStudyStackParamList,
  'ContentInput'
>;

const TAB_TO_CONTENT_TYPE: Record<InputTab, ContentSourceType> = {
  paste: 'PASTE',
  pdf: 'PDF',
  youtube: 'YOUTUBE',
};

export function ContentInputScreen(): JSX.Element {
  const navigation = useNavigation<ContentInputNavigationProp>();
  const route = useRoute<ContentInputRouteProp>();
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
    [state.pastedText, state.selectedFile, state.youtubeUrl]
  );

  const handleSubmit = useCallback(async () => {
    setShowExtractionProgress(state.activeTab !== 'paste');

    try {
      const result = await submit();
      navigation.navigate('ContentReview', { contentId: result.contentId });
    } catch (error) {
      captureSilentFailure(error, { feature: 'content-study', operation: 'ui-fallback', type: 'ui' });
      setShowExtractionProgress(false);
    }
  }, [navigation, state.activeTab, submit]);

  const renderActiveInput = () => {
    if (showExtractionProgress) {
      return (
        <ExtractionProgress
          stage={state.activeTab === 'pdf' ? 'uploading' : 'processing'}
          progress={state.activeTab === 'pdf' ? Math.max(uploadProgress, 15) : 30}
          contentType={TAB_TO_CONTENT_TYPE[state.activeTab]}
        />
      );
    }

    if (state.activeTab === 'pdf') {
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

    if (state.activeTab === 'youtube') {
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{UI_TEXT.INPUT_TITLE}</Text>
            <Text style={styles.subtitle}>{UI_TEXT.INPUT_SUBTITLE}</Text>
          </View>

          <InputTypeSelector
            activeTab={state.activeTab}
            onTabChange={setTab}
            disabled={isSubmitting}
            hasDrafts={hasDrafts}
          />

          <View style={styles.inputShell}>{renderActiveInput()}</View>

          {error && !showExtractionProgress ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError}
                accessibilityLabel="Dismiss button"
                accessibilityRole="button"
                accessibilityHint="Activates this control">
                <Text style={styles.dismissText}>Dismiss</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.submitButton, isSubmitting && styles.submitButtonDisabled, pressed && { opacity: 0.8 }]}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>{UI_TEXT.SUBMIT_BUTTON}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  inputShell: {
    minHeight: 220,
  },
  errorContainer: {
    backgroundColor: '#451A1A',
    borderColor: '#7F1D1D',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 14,
  },
  dismissText: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
