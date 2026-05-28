import { useCallback } from "react";
import { useToast } from "./ToastProvider";
import type { ToastOptions } from "./Toast.types";

export function useToastHelpers() {
  const { show, dismiss } = useToast();

  const success = useCallback(
    (title: string, message?: string, options?: Partial<ToastOptions>) => {
      return show({ type: "success", title, message, ...options });
    },
    [show],
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<ToastOptions>) => {
      return show({
        type: "error",
        title,
        message,
        duration: 8000,
        ...options,
      });
    },
    [show],
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<ToastOptions>) => {
      return show({ type: "warning", title, message, ...options });
    },
    [show],
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<ToastOptions>) => {
      return show({ type: "info", title, message, ...options });
    },
    [show],
  );

  const promise = useCallback(
    async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      },
      options?: Partial<ToastOptions>,
    ): Promise<T> => {
      const id = show({
        type: "info",
        title: messages.loading,
        persistent: true,
        ...options,
      });
      try {
        const data = await promise;
        dismiss(id);
        show({
          type: "success",
          title:
            typeof messages.success === "function"
              ? messages.success(data)
              : messages.success,
          ...options,
        });
        return data;
      } catch (err) {
        dismiss(id);
        show({
          type: "error",
          title:
            typeof messages.error === "function"
              ? messages.error(err as Error)
              : messages.error,
          ...options,
        });
        throw err;
      }
    },
    [show, dismiss],
  );

  return { success, error, warning, info, promise };
}
