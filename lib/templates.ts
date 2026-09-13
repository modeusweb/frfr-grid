import { GridConfig, GridArea } from "@/types/grid";

const AREA_COLORS = [
  "rgba(59, 130, 246, 0.3)",
  "rgba(16, 185, 129, 0.3)",
  "rgba(245, 158, 11, 0.3)",
  "rgba(239, 68, 68, 0.3)",
  "rgba(139, 92, 246, 0.3)",
  "rgba(236, 72, 153, 0.3)",
];

function createArea(
  id: string,
  name: string,
  startCol: number,
  endCol: number,
  startRow: number,
  endRow: number,
  colorIndex: number
): GridArea {
  return {
    id,
    name,
    startColumn: startCol,
    endColumn: endCol,
    startRow: startRow,
    endRow: endRow,
    color: AREA_COLORS[colorIndex % AREA_COLORS.length],
  };
}

function createDefaultColumns(count: number): GridConfig["columnSizes"] {
  return Array.from({ length: count }, () => ({ value: 1, unit: "fr" as const }));
}

function createDefaultRows(count: number): GridConfig["rowSizes"] {
  return Array.from({ length: count }, () => ({ value: 1, unit: "fr" as const }));
}

export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  config: GridConfig;
};

export const templates: Template[] = [
  {
    id: "header-main-footer",
    name: "Header / Main / Footer",
    description: "Классический layout",
    category: "Классические",
    config: {
      columns: 1,
      rows: 3,
      columnSizes: createDefaultColumns(1),
      rowSizes: ["auto", { value: 1, unit: "fr" }, "auto"],
      columnGap: "0px",
      rowGap: "0px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "header", 1, 1, 1, 1, 0),
        createArea("area-2", "main", 1, 1, 2, 2, 1),
        createArea("area-3", "footer", 1, 1, 3, 3, 2),
      ],
    },
  },
  {
    id: "sidebar-content",
    name: "Sidebar + Content",
    description: "Боковая панель слева",
    category: "Классические",
    config: {
      columns: 2,
      rows: 1,
      columnSizes: [{ value: 1, unit: "fr" }, { value: 3, unit: "fr" }],
      rowSizes: [{ value: 1, unit: "fr" }],
      columnGap: "16px",
      rowGap: "16px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "sidebar", 1, 1, 1, 1, 0),
        createArea("area-2", "main", 2, 2, 1, 1, 1),
      ],
    },
  },
  {
    id: "content-sidebar",
    name: "Content + Sidebar",
    description: "Основное содержимое слева",
    category: "Классические",
    config: {
      columns: 2,
      rows: 1,
      columnSizes: [{ value: 3, unit: "fr" }, { value: 1, unit: "fr" }],
      rowSizes: [{ value: 1, unit: "fr" }],
      columnGap: "16px",
      rowGap: "16px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "main", 1, 1, 1, 1, 1),
        createArea("area-2", "sidebar", 2, 2, 1, 1, 0),
      ],
    },
  },
  {
    id: "three-columns",
    name: "3 колонки",
    description: "Три равные колонки",
    category: "Классические",
    config: {
      columns: 3,
      rows: 1,
      columnSizes: createDefaultColumns(3),
      rowSizes: [{ value: 1, unit: "fr" }],
      columnGap: "16px",
      rowGap: "16px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "left", 1, 1, 1, 1, 0),
        createArea("area-2", "center", 2, 2, 1, 1, 1),
        createArea("area-3", "right", 3, 3, 1, 1, 2),
      ],
    },
  },
  {
    id: "holy-grail",
    name: "Holy Grail",
    description: "Классический Holy Grail",
    category: "Сайты",
    config: {
      columns: 3,
      rows: 3,
      columnSizes: [{ value: 1, unit: "fr" }, { value: 3, unit: "fr" }, { value: 1, unit: "fr" }],
      rowSizes: ["auto", { value: 1, unit: "fr" }, "auto"],
      columnGap: "16px",
      rowGap: "16px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "header", 1, 3, 1, 1, 0),
        createArea("area-2", "left-sidebar", 1, 1, 2, 2, 1),
        createArea("area-3", "main", 2, 2, 2, 2, 2),
        createArea("area-4", "right-sidebar", 3, 3, 2, 2, 3),
        createArea("area-5", "footer", 1, 3, 3, 3, 4),
      ],
    },
  },
  {
    id: "blog",
    name: "Blog",
    description: "Layout для блога",
    category: "Сайты",
    config: {
      columns: 3,
      rows: 3,
      columnSizes: [{ value: 1, unit: "fr" }, { value: 2, unit: "fr" }, { value: 1, unit: "fr" }],
      rowSizes: ["auto", { value: 1, unit: "fr" }, "auto"],
      columnGap: "24px",
      rowGap: "24px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "header", 1, 3, 1, 1, 0),
        createArea("area-2", "post", 1, 2, 2, 2, 1),
        createArea("area-3", "sidebar", 3, 3, 2, 2, 2),
        createArea("area-4", "footer", 1, 3, 3, 3, 3),
      ],
    },
  },
  {
    id: "cards-3",
    name: "3 карточки",
    description: "Три карточки в ряд",
    category: "Карточки",
    config: {
      columns: 3,
      rows: 1,
      columnSizes: createDefaultColumns(3),
      rowSizes: [{ value: 1, unit: "fr" }],
      columnGap: "24px",
      rowGap: "24px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "card-1", 1, 1, 1, 1, 0),
        createArea("area-2", "card-2", 2, 2, 1, 1, 1),
        createArea("area-3", "card-3", 3, 3, 1, 1, 2),
      ],
    },
  },
  {
    id: "cards-4",
    name: "4 карточки",
    description: "Четыре карточки в ряд",
    category: "Карточки",
    config: {
      columns: 4,
      rows: 1,
      columnSizes: createDefaultColumns(4),
      rowSizes: [{ value: 1, unit: "fr" }],
      columnGap: "20px",
      rowGap: "20px",
      containerClass: "grid",
      areas: [
        createArea("area-1", "card-1", 1, 1, 1, 1, 0),
        createArea("area-2", "card-2", 2, 2, 1, 1, 1),
        createArea("area-3", "card-3", 3, 3, 1, 1, 2),
        createArea("area-4", "card-4", 4, 4, 1, 1, 3),
      ],
    },
  },
];

export const templateCategories = [...new Set(templates.map((t) => t.category))];

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

