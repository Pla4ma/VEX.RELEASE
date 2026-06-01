import {
  contentStudyEvents,
  useContentStudyEvent,
  useContentStudyEvents,
  composeEventHandlers,
  initializeContentStudyEventIntegration,
  emitDraftSaved,
  emitContentSubmitted,
  emitExtractionStarted,
  emitGenerationComplete,
  emitSessionStarted,
  emitFeedbackSubmitted,
} from '../events';
import type { ContentStudyEventMap } from '../types';
describe('Event Emitter', () => {
  beforeEach(() => {
    contentStudyEvents.clearAll();
  });
  it('should subscribe and emit events', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:draft-saved', handler);
    contentStudyEvents.emit('content-study:draft-saved', {
      draftId: '123',
      timestamp: Date.now(),
    });
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ draftId: '123' }),
    );
  });
  it('should unsubscribe from events', () => {
    const handler = jest.fn();
    const unsubscribe = contentStudyEvents.subscribe(
      'content-study:draft-saved',
      handler,
    );
    unsubscribe();
    contentStudyEvents.emit('content-study:draft-saved', {
      draftId: '123',
      timestamp: Date.now(),
    });
    expect(handler).not.toHaveBeenCalled();
  });
  it('should handle multiple subscribers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    contentStudyEvents.subscribe('content-study:content-submitted', handler1);
    contentStudyEvents.subscribe('content-study:content-submitted', handler2);
    contentStudyEvents.emit('content-study:content-submitted', {
      contentId: '123',
      type: 'PASTE',
    });
    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });
  it('should handle once subscription', () => {
    const handler = jest.fn();
    contentStudyEvents.once('content-study:generation-complete', handler);
    contentStudyEvents.emit('content-study:generation-complete', {
      generationId: '123',
      taskCount: 5,
      quizCount: 3,
    });
    contentStudyEvents.emit('content-study:generation-complete', {
      generationId: '456',
      taskCount: 3,
      quizCount: 2,
    });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ generationId: '123' }),
    );
  });
});
describe('Predefined Emitters', () => {
  beforeEach(() => {
    contentStudyEvents.clearAll();
  });
  it('should emit draft saved event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:draft-saved', handler);
    emitDraftSaved('draft-123');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: 'draft-123',
        timestamp: expect.any(Number),
      }),
    );
  });
  it('should emit content submitted event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:content-submitted', handler);
    emitContentSubmitted('content-123', 'YOUTUBE');
    expect(handler).toHaveBeenCalledWith({
      contentId: 'content-123',
      type: 'YOUTUBE',
    });
  });
  it('should emit extraction started event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:extraction-started', handler);
    emitExtractionStarted('content-123', 'processing');
    expect(handler).toHaveBeenCalledWith({
      contentId: 'content-123',
      stage: 'processing',
    });
  });
  it('should emit generation complete event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:generation-complete', handler);
    emitGenerationComplete('gen-123', 5, 3);
    expect(handler).toHaveBeenCalledWith({
      generationId: 'gen-123',
      taskCount: 5,
      quizCount: 3,
    });
  });
  it('should emit session started event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:session-started', handler);
    const sessionConfig = {
      duration: 25,
      difficulty: 'medium',
      focusAreas: ['focus'],
    };
    emitSessionStarted('gen-123', sessionConfig);
    expect(handler).toHaveBeenCalledWith({
      generationId: 'gen-123',
      sessionConfig,
    });
  });
  it('should emit feedback submitted event', () => {
    const handler = jest.fn();
    contentStudyEvents.subscribe('content-study:feedback-submitted', handler);
    emitFeedbackSubmitted('gen-123', 4);
    expect(handler).toHaveBeenCalledWith({
      generationId: 'gen-123',
      rating: 4,
    });
  });
});
describe('Utility Functions', () => {
  it('should compose multiple handlers', () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const handler3 = jest.fn();
    const composed = composeEventHandlers(handler1, handler2, handler3);
    composed({ test: 'data' });
    expect(handler1).toHaveBeenCalledWith({ test: 'data' });
    expect(handler2).toHaveBeenCalledWith({ test: 'data' });
    expect(handler3).toHaveBeenCalledWith({ test: 'data' });
  });
  it('should handle async handlers in compose', () => {
    const asyncHandler = jest.fn().mockResolvedValue(undefined);
    const syncHandler = jest.fn();
    const composed = composeEventHandlers(asyncHandler, syncHandler);
    composed({ test: 'data' });
    expect(asyncHandler).toHaveBeenCalledWith({ test: 'data' });
    expect(syncHandler).toHaveBeenCalledWith({ test: 'data' });
  });
  it('should handle errors in composed handlers gracefully', () => {
    const errorHandler = jest.fn(() => {
      throw new Error('Handler error');
    });
    const nextHandler = jest.fn();
    const composed = composeEventHandlers(errorHandler, nextHandler);
    expect(() => composed({ test: 'data' })).not.toThrow();
    expect(errorHandler).toHaveBeenCalled();
    expect(nextHandler).toHaveBeenCalled();
  });
});
describe('Integration', () => {
  it('should forward events to app event bus', () => {
    const appBusHandler = jest.fn();
    const mockAppEventBus = { subscribe: jest.fn(), emit: appBusHandler };
    initializeContentStudyEventIntegration(mockAppEventBus);
    contentStudyEvents.emit('content-study:session-started', {
      generationId: 'gen-123',
      sessionConfig: { duration: 25, difficulty: 'medium', focusAreas: [] },
    });
    expect(appBusHandler).toHaveBeenCalledWith(
      'content-study:session-started',
      expect.any(Object),
    );
  });
  it('should handle missing app event bus gracefully', () => {
    expect(() => initializeContentStudyEventIntegration()).not.toThrow();
    expect(() =>
      initializeContentStudyEventIntegration(undefined),
    ).not.toThrow();
  });
});
