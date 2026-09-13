import { GridConfig, GridTrack } from "@/types/grid";

function formatTrack(track: GridTrack): string {
  if (track === "auto") return "auto";
  if (track === "min-content") return "min-content";
  if (track === "max-content") return "max-content";

  if (track.unit === "auto") return "auto";
  if (track.unit === "fr") return `${track.value}fr`;
  return `${track.value}${track.unit}`;
}

function formatTracks(tracks: GridTrack[]): string {
  return tracks.map(formatTrack).join(" ");
}

function generateAreasString(areas: GridConfig["areas"], rows: number, columns: number): string {
  if (areas.length === 0) return "";

  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ".")
  );

  for (const area of areas) {
    // endRow и endColumn — включительные (1-indexed), поэтому используем <=
    for (let row = area.startRow - 1; row <= area.endRow - 1; row++) {
      for (let col = area.startColumn - 1; col <= area.endColumn - 1; col++) {
        if (row >= 0 && row < rows && col >= 0 && col < columns) {
          grid[row][col] = area.name;
        }
      }
    }
  }

  return grid.map((row) => `"${row.join(" ")}"`).join("\n    ");
}

export function generateGridCSS(config: GridConfig): string {
  const { columns, rows, columnSizes, rowSizes, columnGap, rowGap, areas, containerClass } = config;

  const containerName = containerClass || "grid";
  const lines: string[] = [];

  // Container styles
  lines.push(`.${containerName} {`);
  lines.push(`  display: grid;`);

  // Grid template columns
  if (columnSizes.length > 0) {
    const columnsStr = formatTracks(columnSizes);
    if (columns === columnSizes.length && columnSizes.every(
      (t) => typeof t === "object" && t.value === 1 && t.unit === "fr"
    )) {
      lines.push(`  grid-template-columns: repeat(${columns}, 1fr);`);
    } else {
      lines.push(`  grid-template-columns: ${columnsStr};`);
    }
  }

  // Grid template rows
  if (rowSizes.length > 0) {
    const rowsStr = formatTracks(rowSizes);
    if (rows === rowSizes.length && rowSizes.every(
      (t) => typeof t === "object" && t.value === 1 && t.unit === "fr"
    )) {
      lines.push(`  grid-template-rows: repeat(${rows}, 1fr);`);
    } else {
      lines.push(`  grid-template-rows: ${rowsStr};`);
    }
  }

  // Gap
  if (columnGap === rowGap) {
    if (columnGap !== "0" && columnGap !== "0px") {
      lines.push(`  gap: ${columnGap};`);
    }
  } else {
    if (columnGap !== "0" && columnGap !== "0px") {
      lines.push(`  column-gap: ${columnGap};`);
    }
    if (rowGap !== "0" && rowGap !== "0px") {
      lines.push(`  row-gap: ${rowGap};`);
    }
  }

  // Grid template areas
  if (areas.length > 0) {
    const areasStr = generateAreasString(areas, rows, columns);
    if (areasStr) {
      lines.push(`  grid-template-areas:`);
      lines.push(`    ${areasStr};`);
    }
  }

  lines.push(`}`);

  // Area styles
  for (const area of areas) {
    lines.push(``);
    lines.push(`.${area.name} {`);
    lines.push(`  grid-area: ${area.name};`);
    lines.push(`}`);
  }

  return lines.join("\n");
}

export function generateMinifiedCSS(config: GridConfig): string {
  return generateGridCSS(config)
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, "{")
    .replace(/\s*}\s*/g, "}")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .trim();
}
