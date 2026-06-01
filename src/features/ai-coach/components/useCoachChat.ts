import { useState, useEffect, useCallback, useRef } from 'react';
import { type FlashListRef } from '@shopify/flash-list';
import { useAnalytics } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { getCurrentRecommendation } from '../services/coach-screen-service';
import { useAskCoachQuestionMutation, useCoachScreenState } from '../hooks';
import type { ChatMessage } from './coach-chat-types';
import { CoachMessageInputSchema } from './coach-chat-types';
import { getWelcomeMessage } from './coach-helpers';

export function useCoachChat() {
  const { track } = useAnalytics();
  const flashListRef = useRef<FlashListRef<ChatMessage> | null>(null);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coachState, coachHistory, stateLoading, historyLoading } =
    useCoachScreenState();

  const askMutation = useAskCoachQuestionMutation({
    onMutate: () => {
      setIsTyping(true);
      setError(null);
    },
    onSuccess: (response) => {
      setIsTyping(false);
      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        type: 'coach',
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          hasAction: response.hasAction,
          actionLabel: response.actionLabel,
          actionData: response.actionData,
        },
      };
      setChatMessages((prev) => [...prev, coachMsg]);
      track(CoachEvents.COACH_QUESTION_ANSWERED, {
        has_action: response.hasAction,
      });
    },
    onError: (message) => {
      setIsTyping(false);
      setError(message);
    },
  });

  useEffect(() => {
    if (coachHistory?.messages && chatMessages.length === 0) {
      const initialMessages: ChatMessage[] = coachHistory.messages
        .slice(-20)
        .map((msg) => {
          const parsed = CoachMessageInputSchema.parse(msg);
          return {
            id: parsed.id,
            type: parsed.sender === 'user' ? 'user' : 'coach',
            content: parsed.content,
            timestamp: parsed.createdAt,
            // Validated Zod parse boundary — metadata shape matches ChatMessage
            metadata: parsed.metadata as ChatMessage['metadata'],
          };
        });
      if (initialMessages.length === 0) {
        initialMessages.push({
          id: 'welcome',
          type: 'coach',
          content: getWelcomeMessage(coachState),
          timestamp: Date.now(),
          metadata: { state: coachState?.currentState },
        });
      }
      setChatMessages(initialMessages);
    }
  }, [chatMessages.length, coachHistory, coachState]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) {return;}
    const question = inputText.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: question,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');
    track(CoachEvents.COACH_QUESTION_ASKED, {
      question: question.substring(0, 50),
    });
    askMutation.mutate(question);
  }, [inputText, askMutation, track]);

  const handleActionPress = useCallback(
    (message: ChatMessage) => {
      if (!message.metadata?.actionData) {return;}
      const action = message.metadata.actionData;
      switch (action.type) {
        case 'START_SESSION':
          track(CoachEvents.COACH_CTA_CLICKED, {
            cta_type: 'start_session',
            session_duration:
              typeof action.duration === 'number' ? action.duration : 0,
          });
          break;
        case 'VIEW_STREAK':
          track(CoachEvents.COACH_CTA_CLICKED, { cta_type: 'view_streak' });
          break;
        case 'VIEW_PROGRESS':
          track(CoachEvents.COACH_CTA_CLICKED, { cta_type: 'view_progress' });
          break;
        default:
          break;
      }
    },
    [track],
  );

  const recommendation = coachState
    ? getCurrentRecommendation(coachState)
    : null;

  return {
    flashListRef,
    inputText,
    setInputText,
    chatMessages,
    isTyping,
    error,
    setError,
    handleSend,
    handleActionPress,
    coachState,
    stateLoading,
    historyLoading,
    recommendation,
  };
}
