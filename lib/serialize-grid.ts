import { GridConfig, GridTrack, GridArea, GridTrackUnit } from "@/types/grid";

type GridTrackObject = {
  value: number | null;
  unit: GridTrackUnit;
};

type SerializedTrack =
  | { t: "s"; v: string }
  | { t: "o"; v: number | null; u: string };

type SerializedArea = {
  i: string;
  n: string;
  sc: number;
  ec: number;
  sr: number;
  er: number;
  c: string;
};

type SerializedConfig = {
  v: number;
  c: number;
  r: number;
  cs: SerializedTrack[];
  rs: SerializedTrack[];
  cg: string;
  rg: string;
  a: SerializedArea[];
  cn: string;
};

function isGridTrackObject(track: GridTrack): track is GridTrackObject {
  return typeof track === "object" && track !== null;
}

function serializeTrack(track: GridTrack): SerializedTrack {
  if (track === "auto") return { t: "s", v: "auto" };
  if (track === "min-content") return { t: "s", v: "min-content" };
  if (track === "max-content") return { t: "s", v: "max-content" };
  return { t: "o", v: track.value, u: track.unit };
}

function deserializeTrack(track: SerializedTrack): GridTrack {
  if (track.t === "s") {
    if (track.v === "auto") return "auto";
    if (track.v === "min-content") return "min-content";
    if (track.v === "max-content") return "max-content";
    return "auto";
  }
  return { value: track.v, unit: track.u as GridTrackUnit };
}

function serializeArea(area: GridArea): SerializedArea {
  return {
    i: area.id,
    n: area.name,
    sc: area.startColumn,
    ec: area.endColumn,
    sr: area.startRow,
    er: area.endRow,
    c: area.color,
  };
}

function deserializeArea(area: SerializedArea): GridArea {
  return {
    id: area.i,
    name: area.n,
    startColumn: area.sc,
    endColumn: area.ec,
    startRow: area.sr,
    endRow: area.er,
    color: area.c,
  };
}

export function serializeConfig(config: GridConfig): string {
  const serialized: SerializedConfig = {
    v: 1,
    c: config.columns,
    r: config.rows,
    cs: config.columnSizes.map(serializeTrack),
    rs: config.rowSizes.map(serializeTrack),
    cg: config.columnGap,
    rg: config.rowGap,
    a: config.areas.map(serializeArea),
    cn: config.containerClass,
  };

  const json = JSON.stringify(serialized);
  return btoa(encodeURIComponent(json));
}

export function deserializeConfig(encoded: string): GridConfig | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data: SerializedConfig = JSON.parse(json);

    return {
      columns: data.c,
      rows: data.r,
      columnSizes: data.cs.map(deserializeTrack),
      rowSizes: data.rs.map(deserializeTrack),
      columnGap: data.cg,
      rowGap: data.rg,
      areas: data.a.map(deserializeArea),
      containerClass: data.cn || "grid",
    };
  } catch {
    return null;
  }
}

export function configToURL(config: GridConfig, baseUrl: string): string {
  const encoded = serializeConfig(config);
  return `${baseUrl}?config=${encoded}`;
}

export function configFromURL(searchParams: URLSearchParams): GridConfig | null {
  const configParam = searchParams.get("config");
  if (!configParam) return null;
  return deserializeConfig(configParam);
}
