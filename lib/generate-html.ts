import { GridConfig } from "@/types/grid";

export function generateHTML(config: GridConfig): string {
  const { areas, containerClass } = config;
  const containerName = containerClass || "grid";

  if (areas.length === 0) {
    return `<div class="${containerName}">\n  <!-- Add your grid items here -->\n</div>`;
  }

  const lines: string[] = [];
  lines.push(`<div class="${containerName}">`);

  for (const area of areas) {
    const displayName = area.name.charAt(0).toUpperCase() + area.name.slice(1);
    lines.push(`  <div class="${area.name}">${displayName}</div>`);
  }

  lines.push(`</div>`);

  return lines.join("\n");
}
