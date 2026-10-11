import { EventEmitter } from '../EventEmitter';

describe('EventEmitter async handlers', () => {
  it('routes rejected async handlers to error subscribers without unhandled rejection', async () => {
    const emitter = new EventEmitter();
    const handlerError = new Error('handler failed');
    const errorListener = jest.fn();
    let resolveError: (() => void) | undefined;
    const errorHandled = new Promise<void>((resolve) => {
      resolveError = resolve;
    });

    emitter.on('error:handler', (payload) => {
      errorListener(payload);
      resolveError?.();
    });
    emitter.on('session:completed', async () => {
      throw handlerError;
    });

    emitter.emit('session:completed', { id: 'session-1' });
    await errorHandled;

    expect(errorListener).toHaveBeenCalledWith(
      expect.objectContaining({
        originalEvent: 'session:completed',
        error: handlerError,
      }),
    );
  });
});
