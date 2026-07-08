/* ═══ SHARED TYPES FOR THE AI DEBUG OVERLAY ═══ */

export interface ElementStyles {
  display: string;
  position: string;
  width: string;
  height: string;
  padding: string;
  margin: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  boxShadow: string;
  zIndex: string;
  opacity: string;
}

export interface ConsoleLog {
  type: "error" | "warn";
  message: string;
  timestamp: string;
}

export interface Annotation {
  id: string;
  index?: number;
  priority?: "low" | "medium" | "high";
  comment: string;
  selector: string;
  route: string;
  elementTag: string;
  outerHTML: string;
  parentHTML: string;
  timestamp: string;

  // Sync metadata: last-write-wins merge across localStorage / file / gist.
  // `deleted` is a tombstone — the entry must stay in the registry so the
  // deletion propagates to the other storage layers before being purged.
  updatedAt?: number;
  deleted?: boolean;
  resolved?: boolean;

  // Rich context details
  viewport: {
    width: number;
    height: number;
  };
  elementRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  computedStyles: ElementStyles;
  recipeStateAtClick?: any;
  consoleLogsAtClick?: ConsoleLog[];

  // Sketch drawing properties
  drawingDataURL?: string;
  scrollTop?: number;
  scrollLeft?: number;

  // Simple pin absolute coordinates
  pageX?: number;
  pageY?: number;
}

export type ToolType = "pointer" | "simple-pin" | "freehand" | "rect" | "circle";

export type PinPosition = { top: number; left: number; visible: boolean };
