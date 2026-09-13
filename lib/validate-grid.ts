import { GridConfig, GridArea } from "@/types/grid";

export type ValidationError = {
  type: "error" | "warning";
  message: string;
};

export function isValidAreaName(name: string): boolean {
  if (!name || name.trim() === "") return false;
  return /^[a-zA-Z][a-zA-Z0-9-_]*$/.test(name);
}

function validateAreaShape(area: GridArea): ValidationError | null {
  // Координаты включительные (inclusive): startColumn <= endColumn, startRow <= endRow
  if (area.startColumn > area.endColumn || area.startRow > area.endRow) {
    return {
      type: "error",
      message: `Область "${area.name}": некорректные координаты (начало не может быть больше конца).`,
    };
  }

  if (area.startColumn < 1 || area.startRow < 1) {
    return {
      type: "error",
      message: `Область "${area.name}": координаты должны начинаться с 1.`,
    };
  }

  // Проверка, что область не пустая (хотя бы 1x1)
  if (area.startColumn === area.endColumn && area.startRow === area.endRow) {
    return null; // Область 1x1 допустима
  }

  return null;
}

function validateAreaBounds(area: GridArea, columns: number, rows: number): ValidationError | null {
  // endColumn и endRow — включительные (1-indexed)
  if (area.endColumn > columns || area.endRow > rows) {
    return {
      type: "warning",
      message: `Область "${area.name}" выходит за пределы сетки.`,
    };
  }

  if (area.startColumn > columns || area.startRow > rows) {
    return {
      type: "warning",
      message: `Область "${area.name}" полностью за пределами сетки.`,
    };
  }

  return null;
}

function validateAreaName(name: string): ValidationError | null {
  if (!isValidAreaName(name)) {
    return {
      type: "error",
      message: `Имя "${name}" некорректно. Используйте латинские буквы, цифры, дефис и подчёркивание. Имя должно начинаться с буквы.`,
    };
  }
  return null;
}

function validateDuplicateNames(areas: GridArea[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const nameCount = new Map<string, number>();

  for (const area of areas) {
    nameCount.set(area.name, (nameCount.get(area.name) || 0) + 1);
  }

  for (const [name, count] of nameCount) {
    if (count > 1) {
      errors.push({
        type: "error",
        message: `Найдено ${count} областей с именем "${name}". Имена должны быть уникальными.`,
      });
    }
  }

  return errors;
}

function validateOverlappingAreas(areas: GridArea[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (let i = 0; i < areas.length; i++) {
    for (let j = i + 1; j < areas.length; j++) {
      const a = areas[i];
      const b = areas[j];

      if (
        a.startColumn < b.endColumn &&
        a.endColumn > b.startColumn &&
        a.startRow < b.endRow &&
        a.endRow > b.startRow
      ) {
        errors.push({
          type: "error",
          message: `Области "${a.name}" и "${b.name}" перекрываются.`,
        });
      }
    }
  }

  return errors;
}

function validateGridAreaRectangles(areas: GridArea[], rows: number, columns: number): ValidationError[] {
  const errors: ValidationError[] = [];
  if (areas.length === 0) return errors;

  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => null)
  );

  const reportedOverlaps = new Set<string>();

  for (const area of areas) {
    // endRow и endColumn — включительные (1-indexed)
    for (let row = area.startRow - 1; row <= area.endRow - 1; row++) {
      for (let col = area.startColumn - 1; col <= area.endColumn - 1; col++) {
        if (row >= 0 && row < rows && col >= 0 && col < columns) {
          if (grid[row][col] !== null && grid[row][col] !== area.name) {
            const otherArea = grid[row][col];
            const overlapKey = [area.name, otherArea].sort().join("|");
            if (!reportedOverlaps.has(overlapKey)) {
              reportedOverlaps.add(overlapKey);
              errors.push({
                type: "error",
                message: `Области "${area.name}" и "${otherArea}" перекрываются.`,
              });
            }
          }
          grid[row][col] = area.name;
        }
      }
    }
  }

  return errors;
}

export function validateGridConfig(config: GridConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  if (config.columns < 1 || config.rows < 1) {
    errors.push({
      type: "error",
      message: "Сетка должна иметь хотя бы 1 колонку и 1 строку.",
    });
    return errors;
  }

  if (config.columns > 24 || config.rows > 24) {
    errors.push({
      type: "warning",
      message: "Слишком большая сетка может работать медленно.",
    });
  }

  // Validate each area
  for (const area of config.areas) {
    const shapeError = validateAreaShape(area);
    if (shapeError) errors.push(shapeError);

    const boundsError = validateAreaBounds(area, config.columns, config.rows);
    if (boundsError) errors.push(boundsError);

    const nameError = validateAreaName(area.name);
    if (nameError) errors.push(nameError);
  }

  // Validate duplicate names
  errors.push(...validateDuplicateNames(config.areas));

  return errors;
}

export function isValidConfig(config: GridConfig): boolean {
  const errors = validateGridConfig(config);
  return errors.filter((e) => e.type === "error").length === 0;
}
