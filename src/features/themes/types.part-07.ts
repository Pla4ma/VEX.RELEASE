import type { AvatarState, TextTransform } from './types';

export interface FormVariant {
  name: string;
  layout: FormLayout;
  label_position: LabelPosition;
  field_style: string;
}

export type FormLayout =
  | 'vertical'
  | 'horizontal'
  | 'inline'
  | 'grid';

export type LabelPosition =
  | 'top'
  | 'left'
  | 'right'
  | 'hidden';

export interface FormSize {
  name: string;
  field_spacing: string;
  label_spacing: string;
}

export interface FormState {
  name: string;
  field_style: string;
  label_style: string;
}

export interface TableTheme {
  base: TableBase;
  variants: TableVariant[];
  sizes: TableSize[];
  states: TableState[];
}

export interface TableBase {
  border_width: string;
  border_color: string;
  cell_padding: string;
  header_background: string;
  striped_background: string;
}

export interface TableVariant {
  name: string;
  border_style: string;
  header_style: string;
  row_style: string;
}

export interface TableSize {
  name: string;
  cell_padding: string;
  font_size: string;
  border_width: string;
}

export interface TableState {
  name: string;
  row_background: string;
  row_border: string;
}

export interface ListTheme {
  base: ListBase;
  variants: ListVariant[];
  sizes: ListSize[];
  states: ListState[];
}

export interface ListBase {
  spacing: string;
  padding: string;
  marker_color: string;
}

export interface ListVariant {
  name: string;
  marker_style: string;
  item_padding: string;
  item_border: string;
}

export interface ListSize {
  name: string;
  item_spacing: string;
  font_size: string;
}

export interface ListState {
  name: string;
  item_background: string;
  item_color: string;
}

export interface BadgeTheme {
  base: BadgeBase;
  variants: BadgeVariant[];
  sizes: BadgeSize[];
  states: BadgeState[];
}

export interface BadgeBase {
  border_radius: string;
  font_weight: number;
  text_transform: TextTransform;
  padding: string;
}

export interface BadgeVariant {
  name: string;
  background: string;
  color: string;
  border_color: string;
}

export interface BadgeSize {
  name: string;
  padding: string;
  font_size: string;
  border_radius: string;
}

export interface BadgeState {
  name: string;
  background: string;
  color: string;
  border_color: string;
}

export interface AvatarTheme {
  base: AvatarBase;
  variants: AvatarVariant[];
  sizes: AvatarSize[];
  states: AvatarState[];
}

export interface AvatarBase {
  border_radius: string;
  border_width: string;
  font_weight: number;
  background: string;
  color: string;
}

export interface AvatarVariant {
  name: string;
  border_color: string;
  background: string;
  color: string;
}

export interface AvatarSize {
  name: string;
  size: string;
  font_size: string;
  border_radius: string;
}

