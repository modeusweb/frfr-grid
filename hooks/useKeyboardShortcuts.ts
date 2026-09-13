"use client";

import { useEffect, useCallback } from "react";

type ShortcutMap = {
  [key: string]: () => void;
};

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? event.metaKey : event.ctrlKey;

      if (!cmdKey && !event.shiftKey && !event.altKey) {
        // Single key shortcuts
        if (event.key === "Escape") {
          shortcuts["Escape"]?.();
          return;
        }
        if (event.key === "?") {
          shortcuts["?"]?.();
          return;
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          if (document.activeElement === document.body) {
            event.preventDefault();
            shortcuts["Delete"]?.();
          }
          return;
        }
        // Перемещение выбранной области стрелками
        if (
          event.key === "ArrowUp" ||
          event.key === "ArrowDown" ||
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight"
        ) {
          if (document.activeElement === document.body) {
            event.preventDefault();
            shortcuts[event.key]?.();
          }
          return;
        }
        return;
      }

      if (cmdKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        shortcuts["Ctrl+Z"]?.();
        return;
      }

      if (cmdKey && event.key === "z" && event.shiftKey) {
        event.preventDefault();
        shortcuts["Ctrl+Shift+Z"]?.();
        return;
      }

      if (cmdKey && event.key === "y") {
        event.preventDefault();
        shortcuts["Ctrl+Y"]?.();
        return;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
