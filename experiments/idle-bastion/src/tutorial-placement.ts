import type { GridCell } from './layout';

/** Recommendations for new games only; owned towers retain their saved cells. */
export const TUTORIAL_STARTER_CELL: Readonly<GridCell> = Object.freeze({ x: 10, y: 5 });
export const LEGACY_TUTORIAL_STARTER_CELL: Readonly<GridCell> = Object.freeze({ x: 6, y: 6 });
export function isLegacyStarterCell(cell: GridCell): boolean {
  return cell.x >= 3 && cell.x <= 7 && [4, 6].includes(cell.y);
}
export function isShiftedStarterCell(cell: GridCell): boolean {
  return cell.x >= 9 && cell.x <= 11 && [5, 6].includes(cell.y);
}
/** Current saves accept both bounded families. Historical schemas stay frozen. */
export function isPreparingStarterCell(cell: GridCell, allowShifted = false): boolean {
  return isLegacyStarterCell(cell) || allowShifted && isShiftedStarterCell(cell);
}
