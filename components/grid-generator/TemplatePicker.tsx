"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { templates, templateCategories } from "@/lib/templates";
import { GridConfig } from "@/types/grid";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (config: GridConfig) => void;
};

export default function TemplatePicker({ isOpen, onClose, onSelectTemplate }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-surface-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
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
                      onClick={() => {
                        onSelectTemplate(template.config);
                        onClose();
                      }}
                      className="p-4 text-left border border-surface-200 dark:border-surface-700 hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors"
                    >
                      <div className="text-sm font-medium text-surface-900 dark:text-white mb-1">
                        {template.name}
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
