import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Nullable } from "../types/global";

export interface UIState {
  toast: Nullable<{
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    duration?: number;
  }>;
  activeModal: Nullable<string>;
  modalProps: Record<string, unknown>;
  showToast: (toast: Omit<NonNullable<UIState["toast"]>, "id">) => void;
  hideToast: () => void;
  showModal: (name: string, props?: Record<string, unknown>) => void;
  hideModal: () => void;
}

export const useUIStore = create<UIState>()(
  immer((set) => ({
    toast: null,
    activeModal: null,
    modalProps: {},
    showToast: (toast) =>
      set((state) => {
        state.toast = { ...toast, id: `${Date.now()}-${Math.random()}` };
      }),
    hideToast: () =>
      set((state) => {
        state.toast = null;
      }),
    showModal: (name, props = {}) =>
      set((state) => {
        state.activeModal = name;
        state.modalProps = props;
      }),
    hideModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalProps = {};
      }),
  })),
);
