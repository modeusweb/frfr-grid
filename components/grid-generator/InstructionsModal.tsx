"use client";

import { XMarkIcon, BookOpenIcon } from "@heroicons/react/24/outline";

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    title: "Задайте размер сетки",
    description:
      "В левой панели выберите количество колонок и строк — например, 3 × 3.",
  },
  {
    title: "Выделите область",
    description:
      "Зажмите кнопку мыши на свободной ячейке и протяните курсор. Отпустите — область создана и автоматически названа.",
  },
  {
    title: "Настройте область",
    description:
      "Кликните по области: переименуйте её, потяните за круглую ручку в углу, чтобы растянуть, или перетащите целиком на свободное место.",
  },
  {
    title: "Уточните параметры",
    description:
      "Размеры колонок и строк, промежутки (gap) и быстрые пресеты — в левой панели. Все изменения сразу видны в коде.",
  },
  {
    title: "Заберите код",
    description:
      "Справа скопируйте готовый CSS или HTML. Кнопка «Поделиться» создаёт ссылку на текущую сетку.",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function InstructionsModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Как пользоваться FrFr"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Как пользоваться
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Закрыть"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <ol className="p-6 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-semibold text-accent-600 dark:text-accent-400 bg-accent-100 dark:bg-accent-900/40">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-medium text-surface-900 dark:text-white">
                  {step.title}
                </div>
                <div className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">
                  {step.description}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="px-6 py-4 border-t border-surface-200 dark:border-surface-700 text-xs text-surface-500 dark:text-surface-400">
          Совет: начните с готового шаблона — кнопка «Шаблоны» на верхней панели.
          Список горячих клавиш — значок «?».
        </div>
      </div>
    </div>
  );
}
