import type { CardGap, CardMargin, CardPadding, FormSpacing, ModalSpacing, NavigationSpacing } from './types';

export interface ContainerPadding {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ContainerMargin {
  auto: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ContainerGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface SectionSpacing {
  padding: SectionPadding;
  margin: SectionMargin;
}

export interface SectionPadding {
  top: string;
  bottom: string;
  left: string;
  right: string;
  x: string;
  y: string;
}

export interface SectionMargin {
  top: string;
  bottom: string;
  left: string;
  right: string;
  x: string;
  y: string;
}

export interface GridSpacing {
  gap: GridGap;
  padding: GridPadding;
}

export interface GridGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface GridPadding {
  cell: string;
  container: string;
}

export interface FlexSpacing {
  gap: FlexGap;
  padding: FlexPadding;
}

export interface FlexGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface FlexPadding {
  container: string;
  item: string;
}

export interface ComponentSpacing {
  button: ButtonSpacing;
  input: InputSpacing;
  card: CardSpacing;
  modal: ModalSpacing;
  navigation: NavigationSpacing;
  form: FormSpacing;
}

export interface ButtonSpacing {
  padding: ButtonPadding;
  margin: ButtonMargin;
  gap: ButtonGap;
}

export interface ButtonPadding {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ButtonMargin {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ButtonGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface InputSpacing {
  padding: InputPadding;
  margin: InputMargin;
  gap: InputGap;
}

export interface InputPadding {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface InputMargin {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface InputGap {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface CardSpacing {
  padding: CardPadding;
  margin: CardMargin;
  gap: CardGap;
}

