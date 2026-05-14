
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export { width, height };

export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const ASPECT_RATIO = width / height;

export const IS_SMALL_DEVICE = width < 375;
export const IS_LARGE_DEVICE = width >= 768;
export const IS_SHORT_DEVICE = height < 667;
