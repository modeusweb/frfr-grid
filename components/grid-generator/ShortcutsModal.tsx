"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ShortcutsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl/ Cmd + Z", description: "Отменить" },
    { key: "Ctrl/ Cmd + Shift + Z", description: "Повторить" },
    { key: "Ctrl/ Cmd + Y", description: "Повторить" },
    { key: "Delete / Backspace", description: "Удалить выбранную область" },
    { key: "Стрелки", description: "Переместить выбранную область" },
    { key: "Escape", description: "Отменить выделение" },
    { key: "?", description: "Показать горячие клавиши" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md max-h-[85vh] flex flex-col bg-white dark:bg-surface-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
            Горячие клавиши
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-mono bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
