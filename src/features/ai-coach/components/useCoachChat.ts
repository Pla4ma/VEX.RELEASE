import { useState, useEffect, useCallback, useRef } from 'react';
import { type FlashListRef } from '@shopify/flash-list';
import { useAnalytics } from '@/shared/analytics';
import { CoachEvents } from '@/shared/analytics/analytics-events';
import { getCurrentRecommendation } from '../service/coach-screen-service';
import { useAskCoachQuestionMutation, useCoachScreenState } from '../hooks';
import type { ChatMessage } from './coach-chat-types';
import { CoachMessageInputSchema } from './coach-chat-types';
import { getWelcomeMessage } from './coach-helpers';

const MIN_COACH_RESPONSE_MS = 3000;

export function useCoachChat() {
  const { track } = useAnalytics();
  const flashListRef = useRef<FlashListRef<ChatMessage> | null>(null);
  const requestStartedAtRef = useRef(0);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { coachState, coachHistory, stateLoading, historyLoading } =
    useCoachScreenState();

  const askMutation = useAskCoachQuestionMutation({
    onMutate: () => {
      requestStartedAtRef.current = Date.now();
      setIsTyping(true);
      setError(null);
    },
    onSuccess: (response) => {
      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        type: 'coach',
        content: cleanCoachContent('coach', response.message),
        timestamp: Date.now(),
        metadata: {
          hasAction: response.hasAction,
          actionLabel: response.actionLabel,
          actionData: response.actionData,
        },
      };
      const elapsedMs = Date.now() - requestStartedAtRef.current;
      const delayMs = Math.max(MIN_COACH_RESPONSE_MS - elapsedMs, 0);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [...prev, coachMsg]);
        track(CoachEvents.COACH_QUESTION_ANSWERED, {
          has_action: response.hasAction,
        });
      }, delayMs);
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
        .map((msg): ChatMessage => {
          const parsed = CoachMessageInputSchema.parse(msg);
          const sender = parsed.sender === 'user' ? 'user' : 'coach';
          return {
            id: parsed.id,
            type: sender,
            content: cleanCoachContent(sender, parsed.content),
            timestamp: parsed.createdAt,
            // Validated Zod parse boundary — metadata shape matches ChatMessage
            metadata: parsed.metadata as ChatMessage['metadata'],
          };
        })
        .filter((message) => !isCoachPromptEcho(message));
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
      const timer = setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
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

function isCoachPromptEcho(message: ChatMessage): boolean {
  if (message.type !== 'coach') {return false;}
  const lower = message.content.toLowerCase();
  return lower.includes('analyze the request') ||
    lower.includes('analyze the user') ||
    lower.includes('user context:') ||
    lower.includes('allowed actions') ||
    lower.includes('constraints:') ||
    lower.includes('persona:') ||
    lower.includes('valid json only') ||
    lower.includes('user said:');
}

function cleanCoachContent(sender: string, content: string): string {
  if (sender === 'user') {return content;}
  return stripWrappingQuotes(content)
    .replace(/let'?s get back to the game ?plan[.!]?/gi, 'Pick one small next move.')
    .replace(/let'?s get started on our first match[.!]?/gi, 'Start with one clear target.')
    .replace(/welcome to the team,?\s*/gi, '')
    .replace(/\b(sensors?|motors?|robots?|robotics|competition|tournament)\b/gi, 'focus')
    .trim();
}

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length < 2) {return trimmed;}
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === '"' && last === '"') || (first === '“' && last === '”')) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}
