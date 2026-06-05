export const GRID_SIZE = 14;
export const INITIAL_DIRECTION = "RIGHT";
export const START_TICK_MS = 220;
export const MIN_TICK_MS = 95;
export const SPEED_STEP_MS = 12;

export function getTickMs(score = 0) {
  return Math.max(MIN_TICK_MS, START_TICK_MS - score * SPEED_STEP_MS);
}
