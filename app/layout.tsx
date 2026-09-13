import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export const metadata: Metadata = {
  title: "FrFr — CSS Grid Генератор · создавайте сетки мышкой",
  description:
    "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код. Интуитивный интерфейс, шаблоны и экспорт кода.",
  keywords: [
    "css grid",
    "генератор",
    "визуальный редактор",
    "layout",
    "css",
    "grid template",
    "grid areas",
  ],
  authors: [{ name: "FrFr" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "FrFr — визуальный CSS Grid Генератор",
    description:
      "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "FrFr — CSS Grid Генератор",
    description: "Визуальное создание CSS Grid с готовым CSS-кодом",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 antialiased">
        {children}
      </body>
    </html>
  );
}
