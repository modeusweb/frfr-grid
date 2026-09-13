import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FrFr — CSS Grid Генератор",
    short_name: "FrFr",
    description:
      "Бесплатный визуальный генератор CSS Grid. Создавайте сетки мышкой и получайте готовый CSS-код.",
    start_url: "/",
    display: "standalone",
    background_color: "#18181b",
    theme_color: "#3b82f6",
    lang: "ru",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
