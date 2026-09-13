"use client";

import { useState, useCallback, useRef } from "react";
import { GridConfig } from "@/types/grid";

const MAX_HISTORY = 100;

export function useGridHistory(initialConfig: GridConfig) {
  const [history, setHistory] = useState<GridConfig[]>([initialConfig]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedo = useRef(false);

  const currentConfig = history[currentIndex] || initialConfig;

  const pushState = useCallback(
    (newConfig: GridConfig) => {
      if (isUndoRedo.current) {
        isUndoRedo.current = false;
        return;
      }

      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(newConfig);

        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }

        return newHistory;
      });
      setCurrentIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoRedo.current = true;
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoRedo.current = true;
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback(
    (newConfig: GridConfig) => {
      setHistory([newConfig]);
      setCurrentIndex(0);
    },
    []
  );

  return {
    config: currentConfig,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}
