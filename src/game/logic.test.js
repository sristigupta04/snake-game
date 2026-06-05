import assert from "node:assert/strict";
import { getTickMs, MIN_TICK_MS, START_TICK_MS } from "./constants.js";
import {
  createInitialState,
  getAvailableCells,
  placeFood,
  queueDirection,
  stepGame,
} from "./logic.js";

function runTest(name, callback) {
  try {
    callback();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runTest("queueDirection ignores reversing direction", () => {
  assert.equal(queueDirection("RIGHT", "LEFT"), "RIGHT");
  assert.equal(queueDirection("UP", "RIGHT"), "RIGHT");
});

runTest("getTickMs starts medium and ramps down with score", () => {
  assert.equal(getTickMs(0), START_TICK_MS);
  assert.ok(getTickMs(3) < START_TICK_MS);
  assert.equal(getTickMs(99), MIN_TICK_MS);
});

runTest("stepGame moves snake forward without changing score when no food is eaten", () => {
  const initial = createInitialState({
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ],
    direction: "RIGHT",
    queuedDirection: "RIGHT",
    food: { x: 8, y: 8 },
    status: "running",
  });

  const next = stepGame(initial);

  assert.deepEqual(next.snake, [
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.status, "running");
});

runTest("stepGame grows snake and increments score when food is eaten", () => {
  const initial = createInitialState({
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ],
    direction: "RIGHT",
    queuedDirection: "RIGHT",
    food: { x: 4, y: 3 },
    status: "running",
  });

  const next = stepGame(initial, { pickIndex: 0 });

  assert.deepEqual(next.snake, [
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 },
    { x: 1, y: 3 },
  ]);
  assert.equal(next.score, 1);
});

runTest("stepGame ends the game on wall collision", () => {
  const initial = createInitialState({
    snake: [
      { x: 13, y: 4 },
      { x: 12, y: 4 },
      { x: 11, y: 4 },
    ],
    direction: "RIGHT",
    queuedDirection: "RIGHT",
    food: { x: 1, y: 1 },
    status: "running",
  });

  const next = stepGame(initial);

  assert.equal(next.status, "gameOver");
});

runTest("placeFood chooses from unoccupied cells only", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ];

  const available = getAvailableCells(snake, 2);

  assert.deepEqual(available, [
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ]);
  assert.deepEqual(placeFood(snake, 2, 1), { x: 1, y: 1 });
});
