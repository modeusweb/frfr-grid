"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { GridConfig, GridArea, GridTrack } from "@/types/grid";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGridHistory } from "@/hooks/useGridHistory";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { configFromURL, configToURL } from "@/lib/serialize-grid";
import { isValidAreaName } from "@/lib/validate-grid";
import GridToolbar from "./GridToolbar";
import GridSettings from "./GridSettings";
import GridEditor from "./GridEditor";
import CodePanel from "./CodePanel";
import TemplatePicker from "./TemplatePicker";
import ShortcutsModal from "./ShortcutsModal";
import InstructionsModal from "./InstructionsModal";
import RenameAreaModal from "./RenameAreaModal";
import MobileNav, { type MobileTab } from "./MobileNav";

const AREA_COLORS = [
  "rgba(59, 130, 246, 0.3)",
  "rgba(16, 185, 129, 0.3)",
  "rgba(245, 158, 11, 0.3)",
  "rgba(239, 68, 68, 0.3)",
  "rgba(139, 92, 246, 0.3)",
  "rgba(236, 72, 153, 0.3)",
];

const defaultConfig: GridConfig = {
  columns: 3,
  rows: 3,
  columnSizes: [
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
  ],
  rowSizes: [
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
    { value: 1, unit: "fr" },
  ],
  columnGap: "16px",
  rowGap: "16px",
  areas: [
    {
      id: "area-header",
      name: "header",
      startColumn: 1,
      endColumn: 3,
      startRow: 1,
      endRow: 1,
      color: AREA_COLORS[0],
    },
    {
      id: "area-main",
      name: "main",
      startColumn: 1,
      endColumn: 2,
      startRow: 2,
      endRow: 2,
      color: AREA_COLORS[1],
    },
    {
      id: "area-sidebar",
      name: "sidebar",
      startColumn: 3,
      endColumn: 3,
      startRow: 2,
      endRow: 2,
      color: AREA_COLORS[2],
    },
    {
      id: "area-footer",
      name: "footer",
      startColumn: 1,
      endColumn: 3,
      startRow: 3,
      endRow: 3,
      color: AREA_COLORS[3],
    },
  ],
  containerClass: "grid",
};

type Toast = { message: string; type: "success" | "error" };

function generateId(): string {
  return `area-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getUniqueAreaName(areas: GridArea[]): string {
  const names = new Set(areas.map((a) => a.name.toLowerCase()));
  let index = 1;
  while (names.has(`area-${index}`)) index += 1;
  return `area-${index}`;
}

function getUniqueCopyName(areas: GridArea[], base: string): string {
  const names = new Set(areas.map((a) => a.name.toLowerCase()));
  let name = `${base}-copy`;
  let counter = 2;
  while (names.has(name)) {
    name = `${base}-copy-${counter}`;
    counter += 1;
  }
  return name;
}

function adjustSizes(sizes: GridTrack[], count: number): GridTrack[] {
  if (sizes.length > count) return sizes.slice(0, count);
  const result = [...sizes];
  while (result.length < count) result.push({ value: 1, unit: "fr" });
  return result;
}

function findFreePlacement(
  areas: GridArea[],
  width: number,
  height: number,
  columns: number,
  rows: number,
  excludeId: string
): { startColumn: number; startRow: number } | null {
  const isOccupied = (col: number, row: number): boolean =>
    areas.some(
      (a) =>
        a.id !== excludeId &&
        col >= a.startColumn &&
        col <= a.endColumn &&
        row >= a.startRow &&
        row <= a.endRow
    );

  for (let row = 1; row + height - 1 <= rows; row += 1) {
    for (let col = 1; col + width - 1 <= columns; col += 1) {
      let free = true;
      for (let dr = 0; dr < height && free; dr += 1) {
        for (let dc = 0; dc < width; dc += 1) {
          if (isOccupied(col + dc, row + dr)) {
            free = false;
            break;
          }
        }
      }
      if (free) return { startColumn: col, startRow: row };
    }
  }
  return null;
}

export default function GridGenerator() {
  const [storedConfig, setStoredConfig, isHydrated] = useLocalStorage<GridConfig | null>(
    "grid-config",
    null
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("grid");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [renameArea, setRenameArea] = useState<GridArea | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const { config, pushState, undo, redo, canUndo, canRedo, reset } = useGridHistory(defaultConfig);

  // --- Восстановление состояния: URL > localStorage > дефолт ---
  const initRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (initRef.current || !isHydrated) return;
    initRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const urlConfig = configFromURL(params);
    if (urlConfig) {
      reset(urlConfig);
    } else if (storedConfig) {
      reset(storedConfig);
    }
    setIsReady(true);
  }, [isHydrated, storedConfig, reset]);

  // --- Автосохранение текущей конфигурации в localStorage ---
  useEffect(() => {
    if (!isReady) return;
    setStoredConfig(config);
  }, [config, isReady, setStoredConfig]);

  const hasOverlap = useCallback(
    (startCol: number, startRow: number, endCol: number, endRow: number): boolean =>
      config.areas.some(
        (area) =>
          startCol <= area.endColumn &&
          endCol >= area.startColumn &&
          startRow <= area.endRow &&
          endRow >= area.startRow
      ),
    [config.areas]
  );

  const handleSelectionComplete = useCallback(
    (startCol: number, startRow: number, endCol: number, endRow: number) => {
      if (hasOverlap(startCol, startRow, endCol, endRow)) {
        showToast("Здесь уже есть область — выберите свободные ячейки", "error");
        return;
      }
      const newArea: GridArea = {
        id: generateId(),
        name: getUniqueAreaName(config.areas),
        startColumn: startCol,
        endColumn: endCol,
        startRow: startRow,
        endRow: endRow,
        color: AREA_COLORS[config.areas.length % AREA_COLORS.length],
      };
      pushState({ ...config, areas: [...config.areas, newArea] });
      setSelectedAreaId(newArea.id);
    },
    [config, pushState, hasOverlap, showToast]
  );

  const handleConfigChange = useCallback(
    (changes: Partial<GridConfig>) => {
      const next: GridConfig = { ...config, ...changes };

      // При изменении размеров сетки приводим треки и области к новым границам
      const needsAdjust =
        next.columnSizes.length !== next.columns ||
        next.rowSizes.length !== next.rows ||
        next.areas.some((a) => a.endColumn > next.columns || a.endRow > next.rows);

      if (needsAdjust) {
        next.columnSizes = adjustSizes(next.columnSizes, next.columns);
        next.rowSizes = adjustSizes(next.rowSizes, next.rows);
        // Области, полностью вышедшие за пределы сетки, удаляем,
        // остальные аккуратно обрезаем по новым границам
        next.areas = next.areas
          .filter((a) => a.startColumn <= next.columns && a.startRow <= next.rows)
          .map((a) => ({
            ...a,
            startColumn: Math.min(a.startColumn, next.columns),
            endColumn: Math.min(a.endColumn, next.columns),
            startRow: Math.min(a.startRow, next.rows),
            endRow: Math.min(a.endRow, next.rows),
          }));
      }

      pushState(next);
    },
    [config, pushState]
  );

  const handleSelectArea = useCallback((areaId: string | null) => {
    setSelectedAreaId(areaId);
  }, []);

  const handleRenameArea = useCallback(
    (areaId: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) {
        showToast("Имя не может быть пустым", "error");
        return;
      }
      if (!isValidAreaName(trimmed)) {
        showToast(
          "Некорректное имя: используйте латинские буквы, цифры, дефис и подчёркивание",
          "error"
        );
        return;
      }
      const isDuplicate = config.areas.some(
        (a) => a.name.toLowerCase() === trimmed.toLowerCase() && a.id !== areaId
      );
      if (isDuplicate) {
        showToast(`Область с именем "${trimmed}" уже существует`, "error");
        return;
      }
      pushState({
        ...config,
        areas: config.areas.map((a) => (a.id === areaId ? { ...a, name: trimmed } : a)),
      });
    },
    [config, pushState, showToast]
  );

  const handleDeleteArea = useCallback(
    (areaId: string) => {
      pushState({
        ...config,
        areas: config.areas.filter((a) => a.id !== areaId),
      });
      if (selectedAreaId === areaId) {
        setSelectedAreaId(null);
      }
    },
    [config, pushState, selectedAreaId]
  );

  const handleDuplicateArea = useCallback(
    (areaId: string) => {
      const area = config.areas.find((a) => a.id === areaId);
      if (!area) return;
      const width = area.endColumn - area.startColumn + 1;
      const height = area.endRow - area.startRow + 1;
      const placement = findFreePlacement(
        config.areas,
        width,
        height,
        config.columns,
        config.rows,
        area.id
      );
      if (!placement) {
        showToast("Не удалось продублировать: нет свободного места такого размера", "error");
        return;
      }
      const newArea: GridArea = {
        ...area,
        id: generateId(),
        name: getUniqueCopyName(config.areas, area.name),
        startColumn: placement.startColumn,
        endColumn: placement.startColumn + width - 1,
        startRow: placement.startRow,
        endRow: placement.startRow + height - 1,
      };
      pushState({ ...config, areas: [...config.areas, newArea] });
      setSelectedAreaId(newArea.id);
    },
    [config, pushState, showToast]
  );

  const handleResizeArea = useCallback(
    (areaId: string, endColumn: number, endRow: number) => {
      pushState({
        ...config,
        areas: config.areas.map((a) =>
          a.id === areaId
            ? {
                ...a,
                endColumn: Math.max(a.startColumn, Math.min(endColumn, config.columns)),
                endRow: Math.max(a.startRow, Math.min(endRow, config.rows)),
              }
            : a
        ),
      });
    },
    [config, pushState]
  );

  const handleMoveArea = useCallback(
    (areaId: string, startColumn: number, startRow: number) => {
      const area = config.areas.find((a) => a.id === areaId);
      if (!area) return;
      const dCol = startColumn - area.startColumn;
      const dRow = startRow - area.startRow;
      if (dCol === 0 && dRow === 0) return;
      pushState({
        ...config,
        areas: config.areas.map((a) =>
          a.id === areaId
            ? {
                ...a,
                startColumn: startColumn,
                endColumn: a.endColumn + dCol,
                startRow: startRow,
                endRow: a.endRow + dRow,
              }
            : a
        ),
      });
      setSelectedAreaId(areaId);
    },
    [config, pushState]
  );

  const handleClearAreas = useCallback(() => {
    if (config.areas.length === 0) return;
    pushState({ ...config, areas: [] });
    setSelectedAreaId(null);
    showToast("Все области удалены");
  }, [config, pushState, showToast]);

  const handleReset = useCallback(() => {
    reset(defaultConfig);
    setSelectedAreaId(null);
    setShowResetConfirm(false);
    showToast("Сетка сброшена");
  }, [reset, showToast]);

  const handleSelectTemplate = useCallback(
    (templateConfig: GridConfig) => {
      reset(templateConfig);
      setSelectedAreaId(null);
    },
    [reset]
  );

  const handleShare = useCallback(() => {
    const url = configToURL(config, window.location.origin + window.location.pathname);
    navigator.clipboard
      .writeText(url)
      .then(() => showToast("Ссылка скопирована в буфер обмена"))
      .catch(() => showToast("Не удалось скопировать ссылку", "error"));
  }, [config, showToast]);

  const selectedArea = useMemo(
    () => (selectedAreaId ? config.areas.find((a) => a.id === selectedAreaId) ?? null : null),
    [config.areas, selectedAreaId]
  );

  const handleOpenRename = useCallback(() => {
    if (selectedArea) setRenameArea(selectedArea);
  }, [selectedArea]);

  const handleOpenRenameById = useCallback(
    (areaId: string) => {
      const area = config.areas.find((a) => a.id === areaId);
      if (area) setRenameArea(area);
    },
    [config.areas]
  );

  // Перемещение выбранной области стрелками клавиатуры
  const moveSelectedArea = useCallback(
    (dCol: number, dRow: number) => {
      if (!selectedAreaId) return;
      const area = config.areas.find((a) => a.id === selectedAreaId);
      if (!area) return;
      const width = area.endColumn - area.startColumn + 1;
      const height = area.endRow - area.startRow + 1;
      const nextCol = area.startColumn + dCol;
      const nextRow = area.startRow + dRow;
      if (
        nextCol < 1 ||
        nextRow < 1 ||
        nextCol + width - 1 > config.columns ||
        nextRow + height - 1 > config.rows
      ) {
        return;
      }
      const blocked = config.areas.some(
        (a) =>
          a.id !== area.id &&
          nextCol <= a.endColumn &&
          nextCol + width - 1 >= a.startColumn &&
          nextRow <= a.endRow &&
          nextRow + height - 1 >= a.startRow
      );
      if (blocked) return;
      handleMoveArea(area.id, nextCol, nextRow);
    },
    [config, selectedAreaId, handleMoveArea]
  );

  useKeyboardShortcuts({
    "Ctrl+Z": undo,
    "Ctrl+Shift+Z": redo,
    "Ctrl+Y": redo,
    Escape: () => setSelectedAreaId(null),
    Delete: () => {
      if (selectedAreaId) handleDeleteArea(selectedAreaId);
    },
    ArrowUp: () => moveSelectedArea(0, -1),
    ArrowDown: () => moveSelectedArea(0, 1),
    ArrowLeft: () => moveSelectedArea(-1, 0),
    ArrowRight: () => moveSelectedArea(1, 0),
    "?": () => setShowShortcuts(true),
  });

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-surface-900">
      <GridToolbar
        canUndo={canUndo}
        canRedo={canRedo}
        isPreviewMode={isPreviewMode}
        onUndo={undo}
        onRedo={redo}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        onShare={handleShare}
        onReset={() => setShowResetConfirm(true)}
        onClearAreas={handleClearAreas}
        canClearAreas={config.areas.length > 0}
        onShowTemplates={() => setShowTemplates(true)}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowHelp={() => setShowHelp(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <aside
          id="nastrojki"
          className={`border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden ${
            mobileTab === "settings" ? "flex-1" : "hidden"
          } lg:block lg:flex-none lg:w-72 lg:border-r`}
        >
          <GridSettings config={config} onChange={handleConfigChange} />
        </aside>

        <main id="setka"
              className={`relative overflow-hidden ${
                mobileTab === "grid" ? "flex-1" : "hidden"
              } lg:flex-1`}>
          <GridEditor
            config={config}
            isPreviewMode={isPreviewMode}
            selectedAreaId={selectedAreaId}
            onSelectionComplete={handleSelectionComplete}
            onSelectArea={handleSelectArea}
            onRenameArea={handleOpenRenameById}
            onResizeArea={handleResizeArea}
            onMoveArea={handleMoveArea}
          />

          {selectedArea && !isPreviewMode && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
              <div className="bg-white dark:bg-surface-800 shadow-lg border border-surface-200 dark:border-surface-700 px-4 py-3 flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 "
                    style={{ backgroundColor: selectedArea.color }}
                  />
                  <span className="text-sm font-medium text-surface-900 dark:text-white">
                    {selectedArea.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenRename}
                    className="px-2 py-1 text-xs text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700 transition-colors"
                  >
                    Переименовать
                  </button>
                  <button
                    onClick={() => handleDuplicateArea(selectedArea.id)}
                    className="px-2 py-1 text-xs text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-700 transition-colors"
                  >
                    Дублировать
                  </button>
                  <button
                    onClick={() => handleDeleteArea(selectedArea.id)}
                    className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <aside
          id="kod"
          className={`border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 overflow-hidden ${
            mobileTab === "code" ? "flex-1" : "hidden"
          } lg:block lg:flex-none lg:w-96 lg:border-l`}
        >
          <CodePanel config={config} />
        </aside>
      </div>

      <MobileNav activeTab={mobileTab} onChange={setMobileTab} />

      <TemplatePicker
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      <InstructionsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {renameArea && (
        <RenameAreaModal
          area={renameArea}
          onRename={(newName) => handleRenameArea(renameArea.id, newName)}
          onClose={() => setRenameArea(null)}
        />
      )}

      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-surface-900 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Сбросить сетку?
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Все текущие изменения будут удалены.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 text-sm shadow-lg ${
            toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-surface-900 dark:bg-surface-700 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
<footer className="hidden lg:flex shrink-0 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 px-4 py-1.5 items-center justify-center gap-1.5">
          <a
            href="https://github.com/modeusweb/frfr-grid"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white transition-colors"
            aria-label="Исходный код FrFr на GitHub"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Исходный код на GitHub
          </a>
        </footer>
    </div>
  );
}
