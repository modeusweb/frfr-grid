"use client";

import { useState } from "react";
import { ChevronDownIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Размеры колонок
        </h3>
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
        <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          Размеры строк
        </h3>
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

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
      >
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        />
        Дополнительные настройки
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-2 border-t border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Column gap</span>
            <input
              type="text"
              value={config.columnGap}
              onChange={(e) => onChange({ columnGap: e.target.value })}
              className="w-20 px-2 py-1 text-sm border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-surface-600 dark:text-surface-400">Row gap</span>
            <input
              type="text"
              value={config.rowGap}
              onChange={(e) => onChange({ rowGap: e.target.value })}
              className="w-20 px-2 py-1 text-sm border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
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
      )}
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
  const formatTrackLabel = (track: GridTrack): string => {
    if (track === "auto") return "auto";
    if (track === "min-content") return "min";
    if (track === "max-content") return "max";
    if (track.unit === "fr") return `${track.value}fr`;
    return `${track.value}${track.unit}`;
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 text-xs border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-accent-500 transition-colors"
      >
        {formatTrackLabel(value)}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-lg p-2 min-w-[120px]">
          <div className="grid grid-cols-2 gap-1">
            {TRACK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onChange(preset.value);
                  setIsOpen(false);
                }}
                className="px-2 py-1 text-xs hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
