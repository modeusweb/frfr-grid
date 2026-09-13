import fs from "fs";
const src = fs.readFileSync("lib/generate-css.ts", "utf8");
const funcs = src.match(/function formatTrack[^}]*}[\s\S]*?function generateAreasString[\s\S]*?}/g);
// Вручную воспроизведём ключевые функции