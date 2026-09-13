export type GridTrackUnit = "fr" | "px" | "%" | "rem" | "em" | "auto";

export type GridTrackValue = {
  value: number | null;
  unit: GridTrackUnit;
};

export type GridTrack = GridTrackValue | "auto" | "min-content" | "max-content";

export type GridArea = {
  id: string;
  name: string;
  startColumn: number;
  endColumn: number;
  startRow: number;
  endRow: number;
  color: string;
};

export type GridConfig = {
  columns: number;
  rows: number;
  columnSizes: GridTrack[];
  rowSizes: GridTrack[];
  columnGap: string;
  rowGap: string;
  areas: GridArea[];
  containerClass: string;
};

export type GridSelection = {
  startColumn: number;
  startRow: number;
  endColumn: number;
  endRow: number;
} | null;

export type HistoryEntry = {
  config: GridConfig;
  timestamp: number;
};
