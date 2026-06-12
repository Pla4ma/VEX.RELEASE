import { withErrorToast, createMutationErrorHandler } from '../mutation-defaults';

describe('mutation-defaults', () => {
  describe('withErrorToast', () => {
    it('returns feature and errorToast', () => {
      const result = withErrorToast('session', 'Session failed');
      expect(result).toEqual({ feature: 'session', errorToast: 'Session failed' });
    });
  });

  describe('createMutationErrorHandler', () => {
    it('returns a function', () => {
      const handler = createMutationErrorHandler(jest.fn(), { feature: 'test' });
      expect(typeof handler).toBe('function');
    });

    it('calls showToast with errorToast when provided', () => {
      const showToast = jest.fn();
      const handler = createMutationErrorHandler(showToast, {
        feature: 'test',
        errorToast: 'Something went wrong',
      });
      handler(new Error('test error'), {}, undefined);
      expect(showToast).toHaveBeenCalledWith({
        message: 'Something went wrong',
        type: 'error',
        duration: 4000,
      });
    });

    it('does not call showToast when no errorToast', () => {
      const showToast = jest.fn();
      const handler = createMutationErrorHandler(showToast, { feature: 'test' });
      handler(new Error('test error'), {}, undefined);
      expect(showToast).not.toHaveBeenCalled();
    });

    it('calls onError callback when provided', () => {
      const onError = jest.fn();
      const handler = createMutationErrorHandler(jest.fn(), {
        feature: 'test',
        onError,
      });
      const error = new Error('test error');
      const variables = { id: '123' };
      const context = { previousData: null };
      handler(error, variables, context);
      expect(onError).toHaveBeenCalledWith(error, variables, context);
    });
  });
});
