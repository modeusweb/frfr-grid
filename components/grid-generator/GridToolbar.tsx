"use client";

import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  EyeIcon,
  ShareIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  isPreviewMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onShare: () => void;
  onReset: () => void;
  onClearAreas: () => void;
  canClearAreas: boolean;
  onShowTemplates: () => void;
  onShowShortcuts: () => void;
  onShowHelp: () => void;
};

export default function GridToolbar({
  canUndo,
  canRedo,
  isPreviewMode,
  onUndo,
  onRedo,
  onTogglePreview,
  onShare,
  onReset,
  onClearAreas,
  canClearAreas,
  onShowTemplates,
  onShowShortcuts,
  onShowHelp,
}: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
      <div className="header-in flex items-center gap-3 select-none">
        <div
          className="grid w-8 h-8 grid-cols-2 gap-[3px] p-[5px] bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700"
          aria-hidden="true"
        >
          <span className="logo-cell bg-accent-500" style={{ animationDelay: "0s" }} />
          <span className="logo-cell bg-accent-500" style={{ animationDelay: "0.3s" }} />
          <span className="logo-cell bg-accent-500" style={{ animationDelay: "0.6s" }} />
          <span className="logo-cell bg-accent-500" style={{ animationDelay: "0.9s" }} />
        </div>
        <div className="flex flex-col leading-none">
          <h1 className="font-mono text-lg font-semibold tracking-tight text-surface-900 dark:text-white">
            Fr<span className="text-accent-500">Fr</span>
          </h1>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-surface-400 dark:text-surface-500">
            CSS Grid Генератор
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Отменить"
          title="Отменить (Ctrl+Z)"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Повторить"
          title="Повторить (Ctrl+Shift+Z)"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />

        <button
          onClick={onTogglePreview}
          className={`p-2 transition-colors ${
            isPreviewMode
              ? "bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-400"
              : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
          }`}
          aria-label="Предпросмотр"
          title="Предпросмотр"
        >
          <EyeIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onShare}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Поделиться"
          title="Поделиться ссылкой"
        >
          <ShareIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onShowTemplates}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Шаблоны"
          title="Шаблоны"
        >
          <ClipboardDocumentIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onClearAreas}
          disabled={!canClearAreas}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Удалить все области"
        >
          <XCircleIcon className="w-4 h-4" />
          Очистить
        </button>

        <button
          onClick={onReset}
          className="p-2 text-surface-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          aria-label="Сбросить"
          title="Сбросить сетку"
        >
          <TrashIcon className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />

        <button
          onClick={onShowHelp}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Инструкция"
          title="Как пользоваться"
        >
          <BookOpenIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onShowShortcuts}
          className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Горячие клавиши"
          title="Горячие клавиши (?)"
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
