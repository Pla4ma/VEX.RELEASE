import type { FormSize, FormState, FormVariant, InputStateColors } from './types';

export interface InputBase {
  border_radius: string;
  border_width: string;
  font_size: string;
  padding: string;
  transition: string;
}

export interface InputVariant {
  name: string;
  background: string;
  border_color: string;
  color: string;
  placeholder_color: string;
  focus: InputStateColors;
  error: InputStateColors;
  disabled: InputStateColors;
}

export interface InputSize {
  name: string;
  padding: string;
  font_size: string;
  min_height: string;
  border_radius: string;
}

export interface InputState {
  name: string;
  background: string;
  border_color: string;
  color: string;
  shadow: string;
}

export interface CardTheme {
  base: CardBase;
  variants: CardVariant[];
  sizes: CardSize[];
  states: CardState[];
}

export interface CardBase {
  border_radius: string;
  border_width: string;
  shadow: string;
  transition: string;
}

export interface CardVariant {
  name: string;
  background: string;
  border_color: string;
  shadow: string;
  hover: CardStateColors;
  active: CardStateColors;
}

export interface CardSize {
  name: string;
  padding: string;
  border_radius: string;
  shadow: string;
}

export interface CardState {
  name: string;
  background: string;
  border_color: string;
  shadow: string;
  transform: string;
}

export interface CardStateColors {
  background: string;
  border_color: string;
  shadow: string;
}

export interface ModalTheme {
  base: ModalBase;
  variants: ModalVariant[];
  sizes: ModalSize[];
  states: ModalState[];
}

export interface ModalBase {
  border_radius: string;
  shadow: string;
  backdrop: string;
  transition: string;
}

export interface ModalVariant {
  name: string;
  background: string;
  border_color: string;
  shadow: string;
}

export interface ModalSize {
  name: string;
  width: string;
  max_width: string;
  border_radius: string;
}

export interface ModalState {
  name: string;
  opacity: string;
  transform: string;
}

export interface NavigationTheme {
  base: NavigationBase;
  variants: NavigationVariant[];
  sizes: NavigationSize[];
  states: NavigationState[];
}

export interface NavigationBase {
  background: string;
  border_color: string;
  shadow: string;
  transition: string;
}

export interface NavigationVariant {
  name: string;
  background: string;
  border_color: string;
  item_color: string;
  item_hover: string;
  item_active: string;
}

export interface NavigationSize {
  name: string;
  height: string;
  padding: string;
  font_size: string;
}

export interface NavigationState {
  name: string;
  background: string;
  item_color: string;
  item_hover: string;
  item_active: string;
}

export interface FormTheme {
  base: FormBase;
  variants: FormVariant[];
  sizes: FormSize[];
  states: FormState[];
}

export interface FormBase {
  spacing: string;
  label_color: string;
  error_color: string;
  success_color: string;
}

