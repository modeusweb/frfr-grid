"use client";

import {
  Cog6ToothIcon,
  Squares2X2Icon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import {
  Cog6ToothIcon as CogSolid,
  Squares2X2Icon as SquaresSolid,
  CodeBracketIcon as CodeSolid,
} from "@heroicons/react/24/solid";

export type MobileTab = "settings" | "grid" | "code";

const TABS: {
  id: MobileTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  ActiveIcon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "settings", label: "Настройки", Icon: Cog6ToothIcon, ActiveIcon: CogSolid },
  { id: "grid", label: "Сетка", Icon: Squares2X2Icon, ActiveIcon: SquaresSolid },
  { id: "code", label: "Код", Icon: CodeBracketIcon, ActiveIcon: CodeSolid },
];

type Props = {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
};

export default function MobileNav({ activeTab, onChange }: Props) {
  return (
    <nav
      aria-label="Разделы"
      className="flex shrink-0 border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 lg:hidden"
    >
      {TABS.map(({ id, label, Icon, ActiveIcon }) => {
        const isActive = activeTab === id;
        const Comp = isActive ? ActiveIcon : Icon;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
              isActive
                ? "text-accent-500"
                : "text-surface-500 dark:text-surface-400"
            }`}
          >
            <Comp className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
