"use client";

import { useState, useMemo, useEffect } from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Highlight, themes } from "prism-react-renderer";
import { GridConfig } from "@/types/grid";
import { generateGridCSS } from "@/lib/generate-css";
import { generateHTML } from "@/lib/generate-html";
import { validateGridConfig } from "@/lib/validate-grid";

/**
 * Темы vsDark/vsLight из prism-react-renderer НЕ стилизуют токен `property`
 * (имена CSS-свойств: display, grid-template-columns, gap и т.д.) — они остаются
 * с цветом обычного текста. Расширяем темы недостающими CSS-токенами.
 *
 * class-name присутствует только в vsDark, поэтому добавляем его и в vsLight,
 * чтобы классы подсвечивались в обоих режимах.
 */
const darkTheme = {
  ...themes.vsDark,
  styles: [
    ...themes.vsDark.styles,
    {
      types: ["property"],
      style: { color: "#4FC1FF" },
    },
    {
      types: ["atrule"],
      style: { color: "#C586C0" },
    },
    {
      types: ["selector", "class-name"],
      style: { color: "#4EC9B0" },
    },
  ],
} as typeof themes.vsDark;

const lightTheme = {
  ...themes.vsLight,
  styles: [
    ...themes.vsLight.styles,
    {
      types: ["property"],
      style: { color: "#0000FF" },
    },
    {
      types: ["atrule"],
      style: { color: "#AF00DB" },
    },
    {
      types: ["selector", "class-name"],
      style: { color: "#800000" },
    },
  ],
} as typeof themes.vsLight;

type Props = {
  config: GridConfig;
};

type TabType = "css" | "html";

/** Следит за классом .dark на <html>: тема переключается без перезагрузки */
function useIsDarkTheme(): boolean {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export default function CodePanel({ config }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("css");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = useIsDarkTheme();

  // Подсветка только на клиенте: SSR отдаёт обычный код,
  // чтобы не ловить несовпадение разметки при гидратации
  useEffect(() => {
    setMounted(true);
  }, []);

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

        {mounted ? (
          <Highlight
            theme={isDark ? darkTheme : lightTheme}
            code={currentCode}
            language={activeTab === "css" ? "css" : "markup"}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={`${className} text-sm font-mono whitespace-pre-wrap break-words`}
                style={{ ...style, background: "transparent", margin: 0, padding: 0 }}
              >
                {tokens.map((line, i) => {
                  const lineProps = getLineProps({ line });
                  return (
                    <div key={i} {...lineProps} style={{ ...lineProps.style, minHeight: "1.4em" }}>
                      {line.map((token, key) =>
                        token.empty ? null : <span key={key} {...getTokenProps({ token })} />
                      )}
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        ) : (
          <pre className="text-sm font-mono text-surface-800 dark:text-surface-200 whitespace-pre-wrap break-words">
            <code>{currentCode}</code>
          </pre>
        )}
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
