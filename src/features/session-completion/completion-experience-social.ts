export type CompletionSocialShare = {
  body: string;
  title: string;
};

export function buildCompletionSocialShare(): CompletionSocialShare {
  return {
    body: 'Session complete in VEX.',
    title: 'Focus locked in',
  };
}
