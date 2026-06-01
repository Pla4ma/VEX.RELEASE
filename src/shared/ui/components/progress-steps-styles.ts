import { createSheet } from '@/shared/ui/create-sheet';

export function interpolateColor(
  progress: number,
  _inputRange: [number, number],
  [start, end]: [string, string],
): string {
  'worklet';
  return progress > 0.5 ? end : start;
}

export const progressStepsStyles = createSheet({
  container: { flexDirection: 'row' },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  containerVertical: { flexDirection: 'column', alignItems: 'flex-start' },
  stepContainer: { alignItems: 'center' },
  indicator: { justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  dotIndicator: { borderWidth: 0, width: 8, height: 8 },
  stepNumber: { fontWeight: '700' },
  stepTextContainer: { marginTop: 8, alignItems: 'center', maxWidth: 100 },
  stepTitle: { fontWeight: '600', textAlign: 'center' },
  stepDescription: { marginTop: 4, textAlign: 'center' },
  connector: {},
  connectorHorizontal: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginTop: 15,
  },
  connectorVertical: {
    width: 2,
    height: 24,
    marginVertical: 4,
    marginLeft: 15,
  },
});
