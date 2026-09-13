"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon, DocumentDuplicateIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { GridArea } from "@/types/grid";

type Props = {
  area: GridArea;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClose: () => void;
};

export default function AreaEditor({ area, onRename, onDelete, onDuplicate, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(area.name);

  const handleSave = () => {
    if (newName.trim() && newName !== area.name) {
      onRename(area.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setNewName(area.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-surface-800 shadow-lg border border-surface-200 dark:border-surface-700 p-2 min-w-[160px]">
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
          Область
        </span>
        <button
          onClick={onClose}
          className="p-1 text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>

      <div className="px-2 py-1 mb-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm border border-accent-500 bg-white dark:bg-surface-900 focus:outline-none focus:ring-1 focus:ring-accent-500"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 "
              style={{ backgroundColor: area.color }}
            />
            <span className="text-sm font-medium text-surface-900 dark:text-white">
              {area.name}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-surface-100 dark:border-surface-700 pt-1">
        <button
          onClick={() => setIsEditing(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <PencilIcon className="w-4 h-4" />
          Переименовать
        </button>
        <button
          onClick={() => onDuplicate(area.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
          Дублировать
        </button>
        <button
          onClick={() => onDelete(area.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
          Удалить
        </button>
      </div>

      <div className="border-t border-surface-100 dark:border-surface-700 mt-1 pt-1 px-2 py-1">
        <span className="text-xs text-surface-400">
          {area.endColumn - area.startColumn}×{area.endRow - area.startRow} ячеек
        </span>
      </div>
    </div>
  );
}
