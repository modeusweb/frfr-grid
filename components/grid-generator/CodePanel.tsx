"use client";

import { useState, useMemo } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { GridConfig } from "@/types/grid";
import { generateGridCSS } from "@/lib/generate-css";
import { generateHTML } from "@/lib/generate-html";
import { validateGridConfig } from "@/lib/validate-grid";

type Props = {
  config: GridConfig;
};

type TabType = "css" | "html";

export default function CodePanel({ config }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("css");
  const [copied, setCopied] = useState(false);

  const cssCode = useMemo(() => generateGridCSS(config), [config]);
  const htmlCode = useMemo(() => generateHTML(config), [config]);
  const validationErrors = useMemo(() => validateGridConfig(config), [config]);

  const currentCode = activeTab === "css" ? cssCode : htmlCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-surface-900">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-200 dark:border-surface-700">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("css")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              activeTab === "css"
                ? "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400"
                : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setActiveTab("html")}
            className={`px-3 py-1.5 text-sm transition-colors ${
              activeTab === "html"
                ? "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400"
                : "text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
            }`}
          >
            HTML
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Скопировано</span>
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              <span>Скопировать</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {validationErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            {validationErrors.map((error, i) => (
              <p key={i} className={`text-sm ${error.type === "error" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                {error.message}
              </p>
            ))}
          </div>
        )}

        <pre className="text-sm font-mono text-surface-800 dark:text-surface-200 whitespace-pre-wrap break-words">
          <code>{currentCode}</code>
        </pre>
      </div>

      {config.areas.length > 0 && (
        <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700">
          <h4 className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">
            Созданные области
          </h4>
          <div className="flex flex-wrap gap-2">
            {config.areas.map((area) => (
              <span
                key={area.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 max-w-[160px] truncate"
              >
                <span
                  className="w-2 h-2 "
                  style={{ backgroundColor: area.color }}
                />
                {area.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
