import { getContentStudyFunctionName } from '../content-study-api-constants';

describe('content study Edge Function routing', () => {
  it.each([
    ['submit', 'content-study/submit'],
    ['extract', 'content-study/extract'],
    ['generate', 'content-study/generate'],
    ['status/550e8400-e29b-41d4-a716-446655440000', 'content-study/status/550e8400-e29b-41d4-a716-446655440000'],
    ['feedback', 'content-study/feedback'],
    ['/functions/v1/content-study/generate', 'content-study/generate'],
  ])('resolves %s to the deployed content-study function', (path, expected) => {
    expect(getContentStudyFunctionName(path)).toBe(expected);
  });

  it('rejects an empty route instead of invoking the function root', () => {
    expect(() => getContentStudyFunctionName('  ')).toThrow(
      'Content study route is required',
    );
  });
});
