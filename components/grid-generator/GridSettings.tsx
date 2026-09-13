"use client";

import { useEffect, useRef, useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { GridConfig, GridTrack } from "@/types/grid";

type Props = {
  config: GridConfig;
  onChange: (config: Partial<GridConfig>) => void;
};

const GAP_PRESETS = [
  { label: "0", value: "0px" },
  { label: "4", value: "4px" },
  { label: "8", value: "8px" },
  { label: "12", value: "12px" },
  { label: "16", value: "16px" },
  { label: "24", value: "24px" },
  { label: "32", value: "32px" },
  { label: "48", value: "48px" },
];

const TRACK_PRESETS = [
  { label: "1fr", value: { value: 1, unit: "fr" as const } },
  { label: "2fr", value: { value: 2, unit: "fr" as const } },
  { label: "100px", value: { value: 100, unit: "px" as const } },
];

export default function GridSettings({ config, onChange }: Props) {

  const updateColumns = (delta: number) => {
    const newColumns = Math.max(1, Math.min(12, config.columns + delta));
    if (newColumns === config.columns) return;
    const newSizes = [...config.columnSizes];
    if (newColumns > config.columns) {
      while (newSizes.length < newColumns) {
        newSizes.push({ value: 1, unit: "fr" });
      }
    } else {
      newSizes.length = newColumns;
    }
    onChange({ columns: newColumns, columnSizes: newSizes });
  };

  const updateRows = (delta: number) => {
    const newRows = Math.max(1, Math.min(12, config.rows + delta));
    if (newRows === config.rows) return;
    const newSizes = [...config.rowSizes];
    if (newRows > config.rows) {
      while (newSizes.length < newRows) {
        newSizes.push({ value: 1, unit: "fr" });
      }
    } else {
      newSizes.length = newRows;
    }
    onChange({ rows: newRows, rowSizes: newSizes });
  };

  const updateColumnSize = (index: number, track: GridTrack) => {
    const newSizes = [...config.columnSizes];
    newSizes[index] = track;
    onChange({ columnSizes: newSizes });
  };

  const updateRowSize = (index: number, track: GridTrack) => {
    const newSizes = [...config.rowSizes];
    newSizes[index] = track;
    onChange({ rowSizes: newSizes });
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Размер сетки
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Колонки</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateColumns(-1)}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Уменьшить колонки"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{config.columns}</span>
              <button
                onClick={() => updateColumns(1)}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Увеличить колонки"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Строки</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateRows(-1)}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Уменьшить строки"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{config.rows}</span>
              <button
                onClick={() => updateRows(1)}
                className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Увеличить строки"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Размеры колонок
        </h3>
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-2">
          fr — доля свободного места, 100px — фиксированная ширина
        </p>
        <div className="flex flex-wrap gap-2">
          {config.columnSizes.map((track, i) => (
            <TrackSizeInput
              key={i}
              value={track}
              onChange={(t) => updateColumnSize(i, t)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          Размеры строк
        </h3>
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-2">
          fr — доля свободного места, 100px — фиксированная высота
        </p>
        <div className="flex flex-wrap gap-2">
          {config.rowSizes.map((track, i) => (
            <TrackSizeInput
              key={i}
              value={track}
              onChange={(t) => updateRowSize(i, t)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Промежуток (gap)
        </h3>
        <div className="flex flex-wrap gap-2">
          {GAP_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onChange({ columnGap: preset.value, rowGap: preset.value })}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                config.columnGap === preset.value && config.rowGap === preset.value
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 dark:border-accent-600"
                  : "border-surface-200 hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Дополнительные настройки
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Column gap</span>
            <GapInput
              value={config.columnGap}
              onChange={(v) => onChange({ columnGap: v })}
              ariaLabel="Column gap в пикселях"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Row gap</span>
            <GapInput
              value={config.rowGap}
              onChange={(v) => onChange({ rowGap: v })}
              ariaLabel="Row gap в пикселях"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Имя контейнера</span>
            <input
              type="text"
              value={config.containerClass}
              onChange={(e) => onChange({ containerClass: e.target.value })}
              className="w-24 px-2 py-1 text-sm border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Gap задаётся только в px; в конфиге значение хранится строкой, например "16px"
// 500px — разумный потолок: большие промежутки в сетке бессмысленны
const MAX_GAP = 500;

/** Число из поля ввода: пусто или некорректно — null */
function parseGapNumber(text: string): number | null {
  if (text.trim() === "") return null;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0 || n > MAX_GAP) return null;
  return n;
}

/** Первое число в значении конфига (для отображения, даже если единица не px) */
function gapConfigToText(raw: string): string {
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : "";
}

function GapInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const [text, setText] = useState(gapConfigToText(value));
  const [invalid, setInvalid] = useState(false);
  const lastEmittedRef = useRef(value);
  // Последний keydown был удалением (Backspace/Delete) — разрешаем очистку поля
  const deletingRef = useRef(false);

  // Синхронизация при внешнем изменении (пресеты, undo, share-ссылка)
  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    setText(gapConfigToText(value));
    setInvalid(false);
  }, [value]);

  const handleText = (raw: string) => {
    // type="number" отдаёт "" и при запрещённых символах (буквы, "+", "-", "e") —
    // не затираем набранное, если это не явное удаление
    if (raw === "" && text !== "" && !deletingRef.current) return;
    setText(raw);
    const n = parseGapNumber(raw);
    if (n === null) {
      setInvalid(raw.trim() !== "");
      return;
    }
    setInvalid(false);
    const str = `${n}px`;
    if (str !== value) {
      lastEmittedRef.current = str;
      onChange(str);
    }
  };

  return (
    <div className="flex items-center">
      <input
        type="number"
        min={0}
        max={MAX_GAP}
        step={1}
        value={text}
        onKeyDown={(e) => {
          deletingRef.current = e.key === "Backspace" || e.key === "Delete";
        }}
        onChange={(e) => handleText(e.target.value)}
        aria-label={ariaLabel}
        className={`w-14 px-2 py-1 text-sm border bg-white dark:bg-surface-800 font-mono outline-none focus:border-accent-500 transition-colors ${
          invalid ? "border-red-400" : "border-surface-200 dark:border-surface-700"
        }`}
      />
      <span
        className="pl-1.5 pr-1 text-xs font-mono text-surface-400 dark:text-surface-500 select-none"
        aria-hidden="true"
      >
        px
      </span>
    </div>
  );
}

function TrackSizeInput({
  value,
  onChange,
}: {
  value: GridTrack;
  onChange: (track: GridTrack) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTrackLabel = (track: GridTrack): string => {
    if (track === "auto") return "auto";
    if (track === "min-content") return "min";
    if (track === "max-content") return "max";
    if (track.unit === "fr") return `${track.value}fr`;
    return `${track.value}${track.unit}`;
  };

  const currentLabel = formatTrackLabel(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="px-3 py-1.5 text-xs border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-accent-500 transition-colors"
        title={`Размер трека: ${currentLabel}`}
      >
        {currentLabel}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 bg-transparent"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            role="listbox"
            aria-label="Выберите размер трека"
            className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-lg p-1.5 min-w-[120px]"
          >
            {TRACK_PRESETS.map((preset) => {
              const isSelected = currentLabel === preset.label;
              return (
                <button
                  key={preset.label}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    if (!isSelected) onChange(preset.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-2 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-400"
                      : "hover:bg-surface-100 dark:hover:bg-surface-700"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
