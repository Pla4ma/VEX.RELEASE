import React from "react";

import {
  ExtractionProgress,
  PdfUploader,
  TextPasteInput,
  YouTubeInput,
} from "../components";
import type { ContentSourceType, InputTab } from "../types";

const TAB_TO_CONTENT_TYPE: Record<InputTab, ContentSourceType> = {
  paste: "PASTE",
  pdf: "PDF",
  youtube: "YOUTUBE",
};

interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  type: string;
}

interface ContentInputActiveTabProps {
  activeTab: InputTab;
  showExtractionProgress: boolean;
  uploadProgress: number;
  pastedText: string;
  youtubeUrl: string;
  selectedFile: SelectedFile | null;
  isSubmitting: boolean;
  error: string | null;
  setPastedText: (text: string) => void;
  setYoutubeUrl: (url: string) => void;
  setSelectedFile: (file: SelectedFile | null) => void;
}

export function ContentInputActiveTab({
  activeTab,
  showExtractionProgress,
  uploadProgress,
  pastedText,
  youtubeUrl,
  selectedFile,
  isSubmitting,
  error,
  setPastedText,
  setYoutubeUrl,
  setSelectedFile,
}: ContentInputActiveTabProps): JSX.Element {
  if (showExtractionProgress) {
    return (
      <ExtractionProgress
        stage={activeTab === "pdf" ? "uploading" : "processing"}
        progress={activeTab === "pdf" ? Math.max(uploadProgress, 15) : 30}
        contentType={TAB_TO_CONTENT_TYPE[activeTab]}
      />
    );
  }

  if (activeTab === "pdf") {
    return (
      <PdfUploader
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        disabled={isSubmitting}
        uploadProgress={uploadProgress}
        uploadError={error}
      />
    );
  }

  if (activeTab === "youtube") {
    return (
      <YouTubeInput
        value={youtubeUrl}
        onChange={setYoutubeUrl}
        disabled={isSubmitting}
        isExtracting={isSubmitting}
      />
    );
  }

  return (
    <TextPasteInput
      value={pastedText}
      onChange={setPastedText}
      disabled={isSubmitting}
      autoFocus
    />
  );
}
