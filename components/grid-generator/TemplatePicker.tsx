"use client";

import { useEffect, useRef } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useBackdropClose } from "@/hooks/useBackdropClose";
import { templates, templateCategories, type Template } from "@/lib/templates";
import { GridConfig, GridTrack } from "@/types/grid";

type Props = {
  isOpen: boolean;
  activeTemplateId: string | null;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
};

function trackToCSS(track: GridTrack): string {
  if (track === "auto") return "auto";
  if (track === "min-content") return "min-content";
  if (track === "max-content") return "max-content";
  if (track.unit === "fr") return `${track.value}fr`;
  return `${track.value}${track.unit}`;
}

// Собирает значение grid-template-areas из координат областей
function buildTemplateAreas(config: GridConfig): string {
  const grid: string[][] = Array.from({ length: config.rows }, () =>
    Array.from({ length: config.columns }, () => ".")
  );

  for (const area of config.areas) {
    // endRow и endColumn — включительные (1-indexed)
    for (let row = area.startRow - 1; row <= area.endRow - 1; row++) {
      for (let col = area.startColumn - 1; col <= area.endColumn - 1; col++) {
        if (row >= 0 && row < config.rows && col >= 0 && col < config.columns) {
          grid[row][col] = area.name;
        }
      }
    }
  }

  return grid.map((row) => `"${row.join(" ")}"`).join(" ");
}

function TemplatePreview({ config }: { config: GridConfig }) {
  return (
    <div
      className="h-20 mb-3 rounded-sm bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800"
      style={{
        display: "grid",
        gridTemplateColumns: config.columnSizes.map(trackToCSS).join(" "),
        gridTemplateRows: config.rowSizes.map(trackToCSS).join(" "),
        gap: "3px",
        gridTemplateAreas: buildTemplateAreas(config),
      }}
    >
      {config.areas.map((area) => (
        <div
          key={area.id}
          className="rounded-[2px]"
          style={{ gridArea: area.name, background: area.color }}
        />
      ))}
    </div>
  );
}

export default function TemplatePicker({
  isOpen,
  activeTemplateId,
  onClose,
  onSelectTemplate,
}: Props) {
  // Автоскролл к активному шаблону выполняется один раз за сессию страницы
  const hasAutoScrolledRef = useRef(false);
  const backdropClose = useBackdropClose(onClose);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // При первом открытии прокручиваем список к активному шаблону.
  // Попап не размонтируется (visibility вместо return null), поэтому
  // при последующих открытиях позиция скролла сохраняется сама.
  useEffect(() => {
    if (!isOpen || hasAutoScrolledRef.current) return;
    hasAutoScrolledRef.current = true;
    if (activeTemplateId) {
      requestAnimationFrame(() => {
        document
          .getElementById(`template-${activeTemplateId}`)
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    }
  }, [isOpen, activeTemplateId]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      {...backdropClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="templates-title"
      aria-hidden={!isOpen}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-surface-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 id="templates-title" className="text-lg font-semibold text-surface-900 dark:text-white">
            Шаблоны
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {templateCategories.map((category) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {templates
                  .filter((t) => t.category === category)
                  .map((template) => (
                    <button
                      key={template.id}
                      id={`template-${template.id}`}
                      onClick={() => onSelectTemplate(template)}
                      aria-pressed={template.id === activeTemplateId}
                      className={`p-4 text-left border transition-colors ${
                        template.id === activeTemplateId
                          ? "border-accent-500 bg-accent-50 dark:bg-accent-900/30"
                          : "border-surface-200 dark:border-surface-700 hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20"
                      }`}
                    >
                      <TemplatePreview config={template.config} />
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="text-sm font-medium text-surface-900 dark:text-white">
                          {template.name}
                        </div>
                        {template.id === activeTemplateId && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400">
                            <CheckIcon className="w-3.5 h-3.5" />
                            Активный
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-surface-500 dark:text-surface-400">
                        {template.description}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
