"use client";

import { useEffect, useRef, useState } from "react";
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
  EllipsisVerticalIcon,
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

type OverflowItem = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Закрытие меню по клику вне и по Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Второстепенные действия: на десктопе видны в панели, на мобильных — в меню «…»
  const overflowItems: OverflowItem[] = [
    { label: "Поделиться ссылкой", Icon: ShareIcon, onClick: onShare },
    {
      label: "Очистить области",
      Icon: XCircleIcon,
      onClick: onClearAreas,
      disabled: !canClearAreas,
    },
    { label: "Сбросить сетку", Icon: TrashIcon, onClick: onReset, danger: true },
    { label: "Инструкция", Icon: BookOpenIcon, onClick: onShowHelp },
    { label: "Горячие клавиши", Icon: QuestionMarkCircleIcon, onClick: onShowShortcuts },
  ];

  return (
    <header className="flex items-center justify-between px-3 sm:px-4 py-3 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
      <div className="header-in flex items-center gap-2 sm:gap-3 select-none shrink-0">
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
          <span className="hidden sm:block text-[10px] font-medium uppercase tracking-[0.14em] text-surface-400 dark:text-surface-500">
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

        <div className="hidden lg:block w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />

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
          className="hidden lg:block p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
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
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Удалить все области"
        >
          <XCircleIcon className="w-4 h-4" />
          <span>Очистить</span>
        </button>

        <button
          onClick={onReset}
          className="hidden lg:block p-2 text-surface-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
          aria-label="Сбросить"
          title="Сбросить сетку"
        >
          <TrashIcon className="w-5 h-5" />
        </button>

        <div className="hidden lg:block w-px h-6 bg-surface-200 dark:bg-surface-700 mx-1" />

        <button
          onClick={onShowHelp}
          className="hidden lg:block p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Инструкция"
          title="Как пользоваться"
        >
          <BookOpenIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onShowShortcuts}
          className="hidden lg:block p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Горячие клавиши"
          title="Горячие клавиши (?)"
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>

        {/* На мобильных второстепенные действия собраны в меню «…» */}
        <div ref={menuRef} className="relative lg:hidden">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className={`p-2 transition-colors ${
              menuOpen
                ? "bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-400"
                : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
            }`}
            aria-label="Ещё действия"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="Ещё действия"
          >
            <EllipsisVerticalIcon className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              aria-label="Дополнительные действия"
              className="absolute right-0 top-full mt-2 w-56 py-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-lg z-50"
            >
              {overflowItems.map(({ label, Icon, onClick, danger, disabled }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={() => {
                    if (disabled) return;
                    setMenuOpen(false);
                    onClick();
                  }}
                  disabled={disabled}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    danger
                      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-surface-600 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
