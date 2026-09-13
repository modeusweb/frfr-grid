"use client";

import { useState } from "react";
import type { GridArea } from "@/types/grid";
import { useBackdropClose } from "@/hooks/useBackdropClose";
import { isValidAreaName } from "@/lib/validate-grid";

type Props = {
  area: GridArea;
  onRename: (newName: string) => void;
  onClose: () => void;
};

export default function RenameAreaModal({ area, onRename, onClose }: Props) {
  const [name, setName] = useState(area.name);
  const [error, setError] = useState<string | null>(null);
  const backdropClose = useBackdropClose(onClose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Имя не может быть пустым");
      return;
    }
    if (!isValidAreaName(trimmed)) {
      setError("Некорректное имя. Используйте латинские буквы, цифры, - и _");
      return;
    }
    onRename(trimmed);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      {...backdropClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-surface-900 shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Переименовать область"
      >
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
          Переименовать область
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
          Текущее имя: <span className="font-mono">{area.name}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="area-name"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          >
            Новое имя
          </label>
          <input
            id="area-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
            autoFocus
            className={`w-full px-3 py-2 border bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 transition-colors font-mono ${
              error
                ? "border-red-400 focus:ring-red-400"
                : "border-surface-200 dark:border-surface-600 focus:ring-accent-500"
            }`}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-accent-500 hover:bg-accent-600 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
