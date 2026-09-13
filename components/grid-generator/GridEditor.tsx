"use client";

import { useRef, useCallback, useState } from "react";
import { GridConfig, GridArea } from "@/types/grid";

type Props = {
  config: GridConfig;
  isPreviewMode: boolean;
  selectedAreaId: string | null;
  onSelectionComplete: (startCol: number, startRow: number, endCol: number, endRow: number) => void;
  onSelectArea: (areaId: string | null) => void;
  onRenameArea: (areaId: string) => void;
  onResizeArea: (areaId: string, endColumn: number, endRow: number) => void;
  onMoveArea: (areaId: string, startColumn: number, startRow: number) => void;
};

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export default function GridEditor({
  config,
  isPreviewMode,
  selectedAreaId,
  onSelectionComplete,
  onSelectArea,
  onRenameArea,
  onResizeArea,
  onMoveArea,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ col: number; row: number } | null>(null);
  const [currentCell, setCurrentCell] = useState<{ col: number; row: number } | null>(null);
  const [resizeState, setResizeState] = useState<{
    areaId: string;
    endColumn: number;
    endRow: number;
  } | null>(null);
  // --- Перетаскивание области на свободное место ---
  const [moveState, setMoveState] = useState<{
    areaId: string;
    targetStartColumn: number;
    targetStartRow: number;
    valid: boolean;
  } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const lastClickRef = useRef<{ areaId: string; time: number } | null>(null);

    const moveOriginRef = useRef<{
    areaId: string;
    offsetCol: number;
    offsetRow: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  const getCellFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return null;
      // Точный hit-test по реальным границам клеток в DOM.
      // Корректно работает при произвольных размерах треков (например, 1fr 3fr 1fr),
      // когда клетки не равны между собой.
      for (const child of Array.from(container.children)) {
        const el = child as HTMLElement;
        const colRaw = el.dataset.col;
        const rowRaw = el.dataset.row;
        if (!colRaw || !rowRaw) continue; // служебные оверлеи пропускаем
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX < rect.right &&
          clientY >= rect.top &&
          clientY < rect.bottom
        ) {
          return { col: Number(colRaw), row: Number(rowRaw) };
        }
      }
      return null;
    },
    []
  );
  const getAreaAtCell = useCallback(
    (col: number, row: number): GridArea | null => {
      // endColumn и endRow — включительные координаты
      for (const area of config.areas) {
        if (col >= area.startColumn && col <= area.endColumn && row >= area.startRow && row <= area.endRow) {
          return area;
        }
      }
      return null;
    },
    [config.areas]
  );

  // Может ли область размера area поместиться в позицию (startColumn, startRow)
  const canPlaceArea = useCallback(
    (area: GridArea, startColumn: number, startRow: number): boolean => {
      const width = area.endColumn - area.startColumn + 1;
      const height = area.endRow - area.startRow + 1;
      if (startColumn < 1 || startRow < 1) return false;
      if (startColumn + width - 1 > config.columns || startRow + height - 1 > config.rows) {
        return false;
      }
      return !config.areas.some(
        (a) =>
          a.id !== area.id &&
          startColumn <= a.endColumn &&
          startColumn + width - 1 >= a.startColumn &&
          startRow <= a.endRow &&
          startRow + height - 1 >= a.startRow
      );
    },
    [config]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isPreviewMode) return;
      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      const area = getAreaAtCell(cell.col, cell.row);
      if (area) {
        // Потенциальное перетаскивание области:
        // без движения указателя это обычный клик (выбор области)
        e.preventDefault();
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        moveOriginRef.current = {
          areaId: area.id,
          offsetCol: cell.col - area.startColumn,
          offsetRow: cell.row - area.startRow,
          startX: e.clientX,
          startY: e.clientY,
          moved: false,
        };
        return;
      }
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      setDragStart(cell);
      setCurrentCell(cell);
    },
    [isPreviewMode, getCellFromPoint, getAreaAtCell]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const origin = moveOriginRef.current;
      if (origin && !isPreviewMode) {
        if (!origin.moved) {
          // Порог 6px отличает перетаскивание от простого клика
          const dist = Math.hypot(e.clientX - origin.startX, e.clientY - origin.startY);
          if (dist > 6) origin.moved = true;
        }
        if (origin.moved) {
          const area = config.areas.find((a) => a.id === origin.areaId);
          if (area) {
            const cell = getCellFromPoint(e.clientX, e.clientY);
            if (cell) {
              const width = area.endColumn - area.startColumn + 1;
              const height = area.endRow - area.startRow + 1;
              // Привязка к клеткам с удержанием в границах сетки
              const targetStartColumn = Math.max(
                1,
                Math.min(config.columns - width + 1, cell.col - origin.offsetCol)
              );
              const targetStartRow = Math.max(
                1,
                Math.min(config.rows - height + 1, cell.row - origin.offsetRow)
              );
              const valid = canPlaceArea(area, targetStartColumn, targetStartRow);
              if (
                !moveState ||
                moveState.areaId !== origin.areaId ||
                moveState.targetStartColumn !== targetStartColumn ||
                moveState.targetStartRow !== targetStartRow ||
                moveState.valid !== valid
              ) {
                setMoveState({ areaId: area.id, targetStartColumn, targetStartRow, valid });
              }
              if (!isMoving) setIsMoving(true);
            }
          }
        }
        return;
      }
      if (!isDragging || !dragStart || isPreviewMode) return;
      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      setCurrentCell(cell);
    },
    [
      isPreviewMode,
      isDragging,
      dragStart,
      getCellFromPoint,
      config,
      moveState,
      isMoving,
      canPlaceArea,
    ]
  );

  const handlePointerUp = useCallback(() => {
    const origin = moveOriginRef.current;
    if (origin) {
      if (isMoving && moveState) {
        if (moveState.valid && moveState.areaId === origin.areaId) {
          onMoveArea(origin.areaId, moveState.targetStartColumn, moveState.targetStartRow);
        }
      } else if (!origin.moved) {
        // Это был клик по области — выбираем её
        onSelectArea(origin.areaId);
        // Двойной клик детектируем вручную: браузерный dblclick подавлен
        // preventDefault() на pointerdown (запрет совместимых mouse-событий)
        const now = Date.now();
        const last = lastClickRef.current;
        if (last && last.areaId === origin.areaId && now - last.time < 350) {
          lastClickRef.current = null;
          onRenameArea(origin.areaId);
        } else {
          lastClickRef.current = { areaId: origin.areaId, time: now };
        }
      }
      moveOriginRef.current = null;
      setMoveState(null);
      setIsMoving(false);
      return;
    }
    if (!isDragging || !dragStart || !currentCell || isPreviewMode) {
      setIsDragging(false);
      setDragStart(null);
      setCurrentCell(null);
      return;
    }
    const minCol = Math.min(dragStart.col, currentCell.col);
    const maxCol = Math.max(dragStart.col, currentCell.col);
    const minRow = Math.min(dragStart.row, currentCell.row);
    const maxRow = Math.max(dragStart.row, currentCell.row);
    // Координаты включительные — передаём как есть
    onSelectionComplete(minCol, minRow, maxCol, maxRow);
    setIsDragging(false);
    setDragStart(null);
    setCurrentCell(null);
  }, [
    isDragging,
    dragStart,
    currentCell,
    isPreviewMode,
    onSelectionComplete,
    isMoving,
    moveState,
    onMoveArea,
    onSelectArea,
    onRenameArea,
  ]);

  const handlePointerLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setCurrentCell(null);
    }
  }, [isDragging]);

  // --- Изменение размера области за правый нижний угол ---
  // Расширение разрешено только по свободным клеткам: расширение
  // автоматически останавливается перед занятыми клетками
  const computeValidResize = useCallback(
    (area: GridArea, targetCol: number, targetRow: number) => {
      const others = config.areas.filter((a) => a.id !== area.id);
      let ec = Math.max(area.startColumn, Math.min(targetCol, config.columns));
      let er = Math.max(area.startRow, Math.min(targetRow, config.rows));
      if (ec > area.endColumn) {
        for (let c = area.endColumn + 1; c <= ec; c += 1) {
          const blocked = others.some(
            (a) =>
              c >= a.startColumn &&
              c <= a.endColumn &&
              a.startRow <= area.endRow &&
              a.endRow >= area.startRow
          );
          if (blocked) {
            ec = c - 1;
            break;
          }
        }
      }
      if (er > area.endRow) {
        for (let r = area.endRow + 1; r <= er; r += 1) {
          const blocked = others.some(
            (a) =>
              r >= a.startRow &&
              r <= a.endRow &&
              a.startColumn <= area.endColumn &&
              a.endColumn >= area.startColumn
          );
          if (blocked) {
            er = r - 1;
            break;
          }
        }
      }
      return { endColumn: ec, endRow: er };
    },
    [config.areas, config.columns, config.rows]
  );

  const startResize = useCallback(
    (areaId: string) => {
      const area = config.areas.find((a) => a.id === areaId);
      if (!area) return;
      setResizeState({ areaId, endColumn: area.endColumn, endRow: area.endRow });
    },
    [config.areas]
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeState) return;
      const cell = getCellFromPoint(e.clientX, e.clientY);
      if (!cell) return;
      const area = config.areas.find((a) => a.id === resizeState.areaId);
      if (!area) return;
      const bounds = computeValidResize(area, cell.col, cell.row);
      if (bounds.endColumn !== resizeState.endColumn || bounds.endRow !== resizeState.endRow) {
        setResizeState({ ...resizeState, ...bounds });
      }
    },
    [resizeState, getCellFromPoint, config.areas, computeValidResize]
  );

  const finishResize = useCallback(() => {
    if (resizeState) {
      const area = config.areas.find((a) => a.id === resizeState.areaId);
      if (
        area &&
        (area.endColumn !== resizeState.endColumn || area.endRow !== resizeState.endRow)
      ) {
        onResizeArea(resizeState.areaId, resizeState.endColumn, resizeState.endRow);
      }
    }
    setResizeState(null);
  }, [resizeState, config.areas, onResizeArea]);

  const getSelectionBounds = useCallback(() => {
    if (!isDragging || !dragStart || !currentCell) return null;
    const minCol = Math.min(dragStart.col, currentCell.col);
    const maxCol = Math.max(dragStart.col, currentCell.col);
    const minRow = Math.min(dragStart.row, currentCell.row);
    const maxRow = Math.max(dragStart.row, currentCell.row);
    // Координаты включительные — возвращаем как есть
    return { startColumn: minCol, startRow: minRow, endColumn: maxCol, endRow: maxRow };
  }, [isDragging, dragStart, currentCell]);

  const dragSelection = getSelectionBounds();

  const isInSelection = useCallback(
    (
      col: number,
      row: number,
      sel: { startColumn: number; endColumn: number; startRow: number; endRow: number } | null
    ) => {
      if (!sel) return false;
      return col >= sel.startColumn && col <= sel.endColumn && row >= sel.startRow && row <= sel.endRow;
    },
    []
  );

  const resizeArea = resizeState
    ? (config.areas.find((a) => a.id === resizeState.areaId) ?? null)
    : null;
  const resizePreview =
    resizeArea && resizeState
      ? {
          startColumn: resizeArea.startColumn,
          endColumn: resizeState.endColumn,
          startRow: resizeArea.startRow,
          endRow: resizeState.endRow,
        }
      : null;

  const isResizing = resizePreview !== null && resizeArea !== null;

  // --- Превью переноса области ---
  const movingArea =
    moveState ? (config.areas.find((a) => a.id === moveState.areaId) ?? null) : null;
  const movePreview =
    movingArea && moveState
      ? {
          startColumn: moveState.targetStartColumn,
          startRow: moveState.targetStartRow,
          endColumn: moveState.targetStartColumn + (movingArea.endColumn - movingArea.startColumn),
          endRow: moveState.targetStartRow + (movingArea.endRow - movingArea.startRow),
          valid: moveState.valid,
        }
      : null;
  const isMovingArea = movePreview !== null && movingArea !== null;


  const trackValue = (t: GridConfig["columnSizes"][number]) => {
    if (t === "auto") return "auto";
    if (t === "min-content") return "min-content";
    if (t === "max-content") return "max-content";
    if (t.unit === "fr") return `${t.value}fr`;
    return `${t.value}${t.unit}`;
  };

  const gridStyle = {
    display: "grid" as const,
    gridTemplateColumns: config.columnSizes.map(trackValue).join(" "),
    gridTemplateRows: config.rowSizes.map(trackValue).join(" "),
    gap:
      config.columnGap === config.rowGap
        ? config.columnGap
        : `${config.rowGap} ${config.columnGap}`,
  };

  return (
    <div className="h-full overflow-auto px-6 py-12 bg-surface-50 dark:bg-surface-950">
      <div className="relative w-full max-w-4xl min-w-[560px] m-auto">
        {!isPreviewMode && config.areas.length === 0 && (
          <div className="mb-4 text-center text-sm text-surface-500 dark:text-surface-400">
            Выделите клетки, чтобы создать первую область
          </div>
        )}
        <div
          ref={containerRef}
          className={`relative bg-white dark:bg-surface-900 touch-none ${
            isMovingArea ? "cursor-grabbing" : ""
          }`}
          style={gridStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
        >
          {Array.from({ length: config.rows }, (_, rowIdx) =>
            Array.from({ length: config.columns }, (_, colIdx) => {
              const col = colIdx + 1;
              const row = rowIdx + 1;
              const area = getAreaAtCell(col, row);
              const inDragSelection = isInSelection(col, row, dragSelection);
              // Клетки, которые войдут в область при растягивании
              const inResizePreview =
                resizePreview !== null &&
                !area &&
                col >= resizePreview.startColumn &&
                col <= resizePreview.endColumn &&
                row >= resizePreview.startRow &&
                row <= resizePreview.endRow;
              // Клетки, которые покинут область при уменьшении
              const willBeRemoved =
                resizeArea !== null &&
                resizePreview !== null &&
                area?.id === resizeArea.id &&
                (col > resizePreview.endColumn || row > resizePreview.endRow);
              // Клетки целевой позиции при переносе области
              const inMoveTargetBounds =
                movePreview !== null &&
                col >= movePreview.startColumn &&
                col <= movePreview.endColumn &&
                row >= movePreview.startRow &&
                row <= movePreview.endRow;
              const inMoveTarget = inMoveTargetBounds === true && movePreview !== null && movePreview.valid && !area;
              const inMoveBlocked = inMoveTargetBounds === true && movePreview !== null && !movePreview.valid;
              return (
                <div
                  key={`${row}-${col}`}
                      data-col={col}
                      data-row={row}
                  className={`relative min-h-[60px] transition-colors duration-75 ${
                    !isPreviewMode && !area
                      ? "hover:bg-accent-50 dark:hover:bg-accent-900/20 cursor-crosshair border border-dashed border-surface-200 dark:border-surface-700"
                      : ""
                  } ${
                    inResizePreview
                      ? "bg-accent-200/70 dark:bg-accent-800/60 border border-dashed border-accent-400"
                      : ""
                  } ${willBeRemoved ? "cell-remove-preview" : ""} ${
                    inMoveTarget
                      ? "bg-emerald-200/70 dark:bg-emerald-800/50 border border-dashed border-emerald-500"
                      : ""
                  } ${inMoveBlocked ? "bg-red-200/70 dark:bg-red-900/50" : ""} ${
                    inDragSelection && !area
                      ? "bg-accent-100/60 dark:bg-accent-900/40"
                      : ""
                  } ${area ? "cursor-pointer" : ""}`}
                  style={{
                    backgroundColor:
                      area && !inDragSelection && !willBeRemoved ? area.color : undefined,
                  }}
                  onClick={() => {
                    if (area && !isPreviewMode) onSelectArea(area.id);
                  }}
                  onDoubleClick={() => {
                    if (area && !isPreviewMode) onRenameArea(area.id);
                  }}
                />
              );
            })
          )}

          {/* Подписи областей поверх сетки — центрированы по всей площади области */}
          <div className="absolute inset-0 pointer-events-none" style={gridStyle}>
            {/* Призрак прежних границ области при изменении размера */}
            {isResizing && resizeArea && (
              <div
                className="relative border border-dashed border-surface-400 dark:border-surface-500"
                style={{
                  gridColumn: `${resizeArea.startColumn} / ${resizeArea.endColumn + 1}`,
                  gridRow: `${resizeArea.startRow} / ${resizeArea.endRow + 1}`,
                }}
              />
            )}
            {/* Призрак области на целевой позиции при переносе */}
            {isMovingArea && movePreview && movingArea && (
              <div
                className={`relative z-20 border-2 border-dashed ${
                  movePreview.valid
                    ? "border-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/30"
                    : "border-red-500 bg-red-100/50 dark:bg-red-900/30"
                }`}
                style={{
                  gridColumn: `${movePreview.startColumn} / ${movePreview.endColumn + 1}`,
                  gridRow: `${movePreview.startRow} / ${movePreview.endRow + 1}`,
                }}
              >
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-medium select-none ${
                    movePreview.valid
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-600 dark:text-red-300"
                  }`}
                >
                  {movingArea.name}
                </span>
                {!movePreview.valid && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-red-500 text-white shadow">
                    Занято
                  </span>
                )}
              </div>
            )}
            {config.areas.map((area) => {
              const isResizingThis = isResizing && resizeArea?.id === area.id;
              const isMovingThis = isMovingArea && movingArea?.id === area.id;
              const bounds = isResizingThis && resizePreview ? resizePreview : area;
              const isSelected = !isPreviewMode && area.id === selectedAreaId && !isMovingThis;
              return (
                <div
                  key={area.id}
                  className={`relative ${
                    isResizingThis
                      ? "z-10 border-2 border-dashed border-accent-500"
                      : isMovingThis
                        ? "z-10 opacity-40 border-2 border-dashed border-surface-400 dark:border-surface-500"
                        : isSelected
                          ? "ring-2 ring-accent-500 ring-inset z-10"
                          : ""
                  }`}
                  style={{
                    gridColumn: `${bounds.startColumn} / ${bounds.endColumn + 1}`,
                    gridRow: `${bounds.startRow} / ${bounds.endRow + 1}`,
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center px-1.5 select-none">
                        <span className="max-w-full px-2.5 py-1 text-xs font-medium text-white bg-surface-900/55 dark:bg-surface-950/60 border border-white/20 truncate">
                          {area.name}
                        </span>
                      </span>
                  {isResizingThis && resizePreview && (
                    <span className="absolute bottom-1 right-1 z-10 px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-accent-500 text-white shadow">
                      {resizePreview.endColumn - resizePreview.startColumn + 1} ×{" "}
                      {resizePreview.endRow - resizePreview.startRow + 1}
                    </span>
                  )}
                  {isSelected && (
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-accent-500 rounded-full border-2 border-white dark:border-surface-900 shadow cursor-nwse-resize pointer-events-auto touch-none"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        (e.target as HTMLElement).setPointerCapture(e.pointerId);
                        startResize(area.id);
                      }}
                      onPointerMove={handleResizeMove}
                      onPointerUp={finishResize}
                      onPointerCancel={finishResize}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {!isPreviewMode && (
          <div className="mt-6 flex justify-center gap-4 text-xs text-surface-500 dark:text-surface-400">
            <span>
              {config.columns} {plural(config.columns, "колонка", "колонки", "колонок")} ×{" "}
              {config.rows} {plural(config.rows, "строка", "строки", "строк")}
            </span>
            {config.areas.length > 0 && (
              <span>
                {config.areas.length}{" "}
                {plural(config.areas.length, "область", "области", "областей")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
