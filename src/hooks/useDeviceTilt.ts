/**
 * useDeviceTilt — returns a shared value pair (tiltX, tiltY) driven
 * by the device accelerometer via Reanimated's useAnimatedSensor.
 * Used to drive parallax across the Ethereal Sky visual layer.
 *
 * Values are normalized to roughly [-1, 1] and clamped.
 */
import {
  useAnimatedSensor,
  useDerivedValue,
  type SensorType,
  type SharedValue,
} from 'react-native-reanimated';

const TILT_SENSITIVITY = 4;

export type DeviceTilt = {
  tiltX: SharedValue<number>;
  tiltY: SharedValue<number>;
};

export function useDeviceTilt(): DeviceTilt {
  const sensor = useAnimatedSensor(SensorType.ACCELEROMETER);

  const tiltX = useDerivedValue<number>(() => {
    'worklet';
    const v = sensor.sensor.value;
    return Math.max(-1, Math.min(1, v.x / TILT_SENSITIVITY));
  }, [sensor]);

  const tiltY = useDerivedValue<number>(() => {
    'worklet';
    const v = sensor.sensor.value;
    return Math.max(-1, Math.min(1, v.y / TILT_SENSITIVITY));
  }, [sensor]);

  return { tiltX, tiltY };
}
