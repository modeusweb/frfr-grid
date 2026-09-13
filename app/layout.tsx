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
  metadataBase: new URL("https://frfr-grid.vercel.app"),
  title: {
    default: "FrFr — CSS Grid Генератор · создавайте сетки мышкой",
    template: "%s — FrFr",
  },
  description:
    "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код. Интуитивный интерфейс, шаблоны и экспорт кода.",
  keywords: [
    "css grid",
    "генератор css grid",
    "css grid генератор",
    "визуальный редактор сетки",
    "grid template generator",
    "grid areas",
    "grid-template-columns",
    "layout generator",
    "css генератор",
    "верстка сетки",
  ],
  authors: [{ name: "FrFr" }],
  creator: "FrFr",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FrFr — визуальный CSS Grid Генератор",
    description:
      "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код.",
    url: "https://frfr-grid.vercel.app",
    siteName: "FrFr",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FrFr — визуальный CSS Grid Генератор",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FrFr — CSS Grid Генератор",
    description: "Визуальное создание CSS Grid с готовым CSS-кодом",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "w_s1YAdGDmNMm19tV4F6fl_4o15nDgnZGLM8ledX-f8",
    yandex: "a1fe32ea207e0be6",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FrFr — CSS Grid Генератор",
  url: "https://frfr-grid.vercel.app",
  description:
    "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  inLanguage: "ru-RU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
