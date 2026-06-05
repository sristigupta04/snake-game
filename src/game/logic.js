import { GRID_SIZE, INITIAL_DIRECTION } from "./constants.js";

const DIRECTION_VECTORS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const OPPOSITES = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

function createStartingSnake() {
  return [
    { x: 4, y: 7 },
    { x: 3, y: 7 },
    { x: 2, y: 7 },
  ];
}

function isSameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function getAvailableCells(snake, gridSize = GRID_SIZE) {
  const available = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const occupied = snake.some((segment) => segment.x === x && segment.y === y);

      if (!occupied) {
        available.push({ x, y });
      }
    }
  }

  return available;
}

export function placeFood(snake, gridSize = GRID_SIZE, pickIndex = 0) {
  const available = getAvailableCells(snake, gridSize);

  if (available.length === 0) {
    return null;
  }

  const normalizedIndex = ((pickIndex % available.length) + available.length) % available.length;
  return available[normalizedIndex];
}

export function createInitialState(options = {}) {
  const snake = options.snake ?? createStartingSnake();
  const direction = options.direction ?? INITIAL_DIRECTION;
  const queuedDirection = options.queuedDirection ?? direction;
  const pickIndex = options.pickIndex ?? 0;
  const score = options.score ?? 0;
  const status = options.status ?? "idle";
  const food = options.food ?? placeFood(snake, GRID_SIZE, pickIndex);

  return {
    snake,
    direction,
    queuedDirection,
    food,
    score,
    status,
  };
}

export function queueDirection(currentDirection, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return currentDirection;
  }

  if (OPPOSITES[currentDirection] === nextDirection) {
    return currentDirection;
  }

  return nextDirection;
}

export function getNextHead(head, direction) {
  const vector = DIRECTION_VECTORS[direction];

  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
}

export function hasWallCollision(cell, gridSize = GRID_SIZE) {
  return cell.x < 0 || cell.y < 0 || cell.x >= gridSize || cell.y >= gridSize;
}

export function hasSelfCollision(head, snake) {
  return snake.some((segment) => isSameCell(segment, head));
}

export function stepGame(state, options = {}) {
  if (state.status === "gameOver") {
    return state;
  }

  const nextDirection = state.queuedDirection ?? state.direction;
  const nextHead = getNextHead(state.snake[0], nextDirection);
  const eatsFood = state.food && isSameCell(nextHead, state.food);
  const bodyToCheck = eatsFood ? state.snake : state.snake.slice(0, -1);

  if (hasWallCollision(nextHead) || hasSelfCollision(nextHead, bodyToCheck)) {
    return {
      ...state,
      direction: nextDirection,
      queuedDirection: nextDirection,
      status: "gameOver",
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!eatsFood) {
    nextSnake.pop();
  }

  const nextScore = eatsFood ? state.score + 1 : state.score;
  const nextFood = eatsFood
    ? placeFood(nextSnake, GRID_SIZE, options.pickIndex ?? nextScore)
    : state.food;

  return {
    snake: nextSnake,
    direction: nextDirection,
    queuedDirection: nextDirection,
    food: nextFood,
    score: nextScore,
    status: nextFood === null ? "won" : "running",
  };
}
