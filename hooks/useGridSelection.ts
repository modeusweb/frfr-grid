"use client";

import { useState, useCallback, useRef } from "react";
import { GridSelection } from "@/types/grid";

export function useGridSelection(
  columns: number,
  rows: number,
  onSelectionComplete: (startCol: number, startRow: number, endCol: number, endRow: number) => void
) {
  const [selection, setSelection] = useState<GridSelection>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const startCellRef = useRef<{ col: number; row: number } | null>(null);

  const normalizeSelection = useCallback(
    (startCol: number, startRow: number, endCol: number, endRow: number) => {
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);

      return {
        startColumn: Math.max(1, minCol),
        endColumn: Math.min(columns, maxCol),
        startRow: Math.max(1, minRow),
        endRow: Math.min(rows, maxRow),
      };
    },
    [columns, rows]
  );

  const startSelection = useCallback(
    (column: number, row: number) => {
      startCellRef.current = { col: column, row };
      setIsSelecting(true);
      setSelection({
        startColumn: column,
        endColumn: column,
        startRow: row,
        endRow: row,
      });
    },
    []
  );

  const updateSelection = useCallback(
    (column: number, row: number) => {
      if (!isSelecting || !startCellRef.current) return;

      const normalized = normalizeSelection(
        startCellRef.current.col,
        startCellRef.current.row,
        column,
        row
      );

      setSelection(normalized);
    },
    [isSelecting, normalizeSelection]
  );

  const endSelection = useCallback(() => {
    if (selection && isSelecting) {
      onSelectionComplete(
        selection.startColumn,
        selection.startRow,
        selection.endColumn,
        selection.endRow
      );
    }
    setIsSelecting(false);
    startCellRef.current = null;
  }, [selection, isSelecting, onSelectionComplete]);

  const cancelSelection = useCallback(() => {
    setSelection(null);
    setIsSelecting(false);
    startCellRef.current = null;
  }, []);

  return {
    selection,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
  };
}
