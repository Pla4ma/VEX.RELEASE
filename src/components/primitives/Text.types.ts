import {
  type TextProps as RNTextProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';
import type { ReactNode } from 'react';
import type { ColorValue, SpacingValue } from './types';

export type TextVariant =
  | 'hero'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'heading'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

export interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  fontSize?: TextStyle['fontSize'];
  fontWeight?: TextStyle['fontWeight'];
  weight?: TextStyle['fontWeight'];
  lineHeight?: TextStyle['lineHeight'];
  letterSpacing?: TextStyle['letterSpacing'];
  textAlign?: TextStyle['textAlign'];
  textTransform?: TextStyle['textTransform'];
  textDecorationLine?: TextStyle['textDecorationLine'];
  fontStyle?: TextStyle['fontStyle'];
  color?: ColorValue;
  flex?: TextStyle['flex'];
  opacity?: TextStyle['opacity'];
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  p?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
}
