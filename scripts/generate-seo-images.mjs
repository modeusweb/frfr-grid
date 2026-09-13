/**
 * Генератор SEO-изображений FrFr: favicon.ico, PNG-иконки, apple-touch-icon, og-image.
 * Зависимость: sharp (devDependency). Запуск: node scripts/generate-seo-images.mjs
 * Текст на og-image рисуется пиксельным шрифтом 5x7 — не зависит от системных шрифтов.
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });

const BRAND = "#3b82f6";
const BRAND_DARK = "#1d4ed8";
const BG_DARK = "#18181b";
const GRID_LINE = "#232327";
const TEXT_LIGHT = "#fafafa";
const SUB_LIGHT = "#93c5fd";

/** Иконка FrFr: синий квадрат со скруглением, белая сетка 2x2. */
function iconSVG(size) {
  const pad = Math.round(size * 0.15625);
  const gap = Math.round(size * 0.09375);
  const cell = Math.round((size - 2 * pad - gap) / 2);
  const rx = Math.round(size * 0.1875);
  const cellR = Math.max(1, Math.round(size * 0.03));
  const cells = [
    [pad, pad],
    [pad + cell + gap, pad],
    [pad, pad + cell + gap],
    [pad + cell + gap, pad + cell + gap],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${BRAND}"/>
  ${cells
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="${cellR}" fill="#ffffff"/>`)
    .join("\n  ")}
</svg>`;
}

/* ---------- Пиксельный шрифт 5x7 ---------- */

const FONT = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

function textToRects(text, x, y, scale, fill, gapScale = 1) {
  const rects = [];
  let cursor = x;
  for (const ch of text) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if (glyph[row][col] === "1") {
          rects.push(
            `<rect x="${cursor + col * scale}" y="${y + row * scale}" width="${scale}" height="${scale}" fill="${fill}"/>`
          );
        }
      }
    }
    cursor += (5 + gapScale) * scale;
  }
  return rects.join("\n  ");
}

/** OG-картинка 1200x630: тёмный фон, сетка, логотип, пиксельный текст. */
function ogImageSVG() {
  const W = 1200;
  const H = 630;
  const lines = [];
  for (let x = 90; x < W; x += 90) lines.push(`<rect x="${x}" y="0" width="1" height="${H}" fill="${GRID_LINE}"/>`);
  for (let y = 90; y < H; y += 90) lines.push(`<rect x="0" y="${y}" width="${W}" height="1" fill="${GRID_LINE}"/>`);

  const cell = 112;
  const gap = 24;
  const logoSize = cell * 2 + gap;
  const logoX = 130;
  const logoY = Math.round((H - logoSize) / 2) + 5;
  const logoCells = [
    [logoX, logoY, BRAND],
    [logoX + cell + gap, logoY, BRAND],
    [logoX, logoY + cell + gap, BRAND],
    [logoX + cell + gap, logoY + cell + gap, BRAND_DARK],
  ];

  const textX = logoX + logoSize + 84;
  const titleScale = 20;
  const titleY = logoY + 6;
  const subScale = 5;
  const subY = titleY + 7 * titleScale + 52;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG_DARK}"/>
  ${lines.join("\n  ")}
  <rect x="0" y="0" width="${W}" height="10" fill="${BRAND}"/>
  ${logoCells
    .map(([x, y, fill]) => `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="6" fill="${fill}"/>`)
    .join("\n  ")}
  ${textToRects("FRFR", textX, titleY, titleScale, TEXT_LIGHT)}
  ${textToRects("CSS GRID GENERATOR", textX, subY, subScale, SUB_LIGHT)}
</svg>`;
}

/* ---------- ICO-контейнер (PNG внутри) ---------- */

function makeIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size % 256;
  entry[1] = size % 256;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

async function savePNG(svg, file) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.join(publicDir, file));
  const kb = Math.round(fs.statSync(path.join(publicDir, file)).size / 102.4) / 10;
  console.log(`public/${file} — ${kb} KB`);
}

const favicon32 = await sharp(Buffer.from(iconSVG(32))).png().toBuffer();
fs.writeFileSync(path.join(publicDir, "favicon.ico"), makeIco(favicon32, 32));
console.log("public/favicon.ico —", Math.round(fs.statSync(path.join(publicDir, "favicon.ico")).size / 102.4) / 10, "KB");

await savePNG(iconSVG(16), "favicon-16x16.png");
await savePNG(iconSVG(32), "favicon-32x32.png");
await savePNG(iconSVG(180), "apple-touch-icon.png");
await savePNG(iconSVG(192), "icon-192.png");
await savePNG(iconSVG(512), "icon-512.png");
await savePNG(ogImageSVG(), "og-image.png");

console.log("Готово: изображения сгенерированы в public/");
