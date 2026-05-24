import type { AvatarTheme, BadgeTheme, ButtonStateColors, CardTheme, FormTheme, InputBase, InputSize, InputState, InputVariant, ListTheme, ModalTheme, NavigationTheme, ProgressTheme, TableTheme, TextTransform, TooltipTheme } from './types';

export interface CardPadding {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface CardMargin {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface CardGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ModalSpacing {
  padding: ModalPadding;
  margin: ModalMargin;
  gap: ModalGap;
}

export interface ModalPadding {
  container: string;
  content: string;
  header: string;
  footer: string;
}

export interface ModalMargin {
  container: string;
  overlay: string;
}

export interface ModalGap {
  header: string;
  content: string;
  footer: string;
}

export interface NavigationSpacing {
  padding: NavigationPadding;
  margin: NavigationMargin;
  gap: NavigationGap;
}

export interface NavigationPadding {
  container: string;
  item: string;
  submenu: string;
}

export interface NavigationMargin {
  container: string;
  item: string;
  submenu: string;
}

export interface NavigationGap {
  container: string;
  item: string;
  submenu: string;
}

export interface FormSpacing {
  padding: FormPadding;
  margin: FormMargin;
  gap: FormGap;
}

export interface FormPadding {
  container: string;
  field: string;
  group: string;
}

export interface FormMargin {
  container: string;
  field: string;
  group: string;
}

export interface FormGap {
  field: string;
  group: string;
  section: string;
}

export interface ComponentTheme {
  buttons: ButtonTheme;
  inputs: InputTheme;
  cards: CardTheme;
  modals: ModalTheme;
  navigation: NavigationTheme;
  forms: FormTheme;
  tables: TableTheme;
  lists: ListTheme;
  badges: BadgeTheme;
  avatars: AvatarTheme;
  progress: ProgressTheme;
  tooltips: TooltipTheme;
}

export interface ButtonTheme {
  base: ButtonBase;
  variants: ButtonVariant[];
  sizes: ButtonSize[];
  states: ButtonState[];
}

export interface ButtonBase {
  border_radius: string;
  border_width: string;
  font_weight: number;
  text_transform: TextTransform;
  transition: string;
}

export interface ButtonVariant {
  name: string;
  background: string;
  color: string;
  border_color: string;
  hover: ButtonStateColors;
  active: ButtonStateColors;
  disabled: ButtonStateColors;
}

export interface ButtonSize {
  name: string;
  padding: string;
  font_size: string;
  min_height: string;
  border_radius: string;
}

export interface ButtonState {
  name: string;
  background: string;
  color: string;
  border_color: string;
  shadow: string;
  transform: string;
}

export interface InputTheme {
  base: InputBase;
  variants: InputVariant[];
  sizes: InputSize[];
  states: InputState[];
}

