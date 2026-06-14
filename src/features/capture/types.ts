export type CaptureType = 'voice' | 'photo' | 'link' | 'braindump';

export interface CaptureItem {
  id: string;
  type: CaptureType;
  content: string;
  metadata?: Record<string, string>;
  createdAt: string;
  userId: string;
}

export interface CaptureFormState {
  type: CaptureType;
  content: string;
  isSubmitting: boolean;
  error: string | null;
}
