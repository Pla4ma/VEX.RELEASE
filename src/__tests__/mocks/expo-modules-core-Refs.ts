export function createSnapshotFriendlyRef() {
  const ref = { current: null as unknown };

  Object.defineProperty(ref, 'toJSON', {
    value: () => '[React.ref]',
  });

  return ref;
}
