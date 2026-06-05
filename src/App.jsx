import React, { useEffect, useMemo, useState } from "react";
import { getTickMs, GRID_SIZE } from "./game/constants.js";
import { createInitialState, queueDirection, stepGame } from "./game/logic.js";

const KEY_TO_DIRECTION = {
  ArrowUp: "UP",
  w: "UP",
  W: "UP",
  ArrowDown: "DOWN",
  s: "DOWN",
  S: "DOWN",
  ArrowLeft: "LEFT",
  a: "LEFT",
  A: "LEFT",
  ArrowRight: "RIGHT",
  d: "RIGHT",
  D: "RIGHT",
};

function App() {
  const [game, setGame] = useState(() => createInitialState());
  const tickMs = getTickMs(game.score);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === " ") {
        event.preventDefault();
        setGame((current) => ({
          ...current,
          status:
            current.status === "running"
              ? "paused"
              : current.status === "paused" || current.status === "idle"
                ? "running"
                : current.status,
        }));
        return;
      }

      const nextDirection = KEY_TO_DIRECTION[event.key];

      if (!nextDirection) {
        return;
      }

      event.preventDefault();

      setGame((current) => {
        const status = current.status === "idle" ? "running" : current.status;

        return {
          ...current,
          status,
          queuedDirection: queueDirection(current.direction, nextDirection),
        };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (game.status !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGame((current) => stepGame(current));
    }, tickMs);

    return () => window.clearInterval(intervalId);
  }, [game.status, tickMs]);

  const snakeCells = useMemo(
    () => new Set(game.snake.map((segment) => `${segment.x},${segment.y}`)),
    [game.snake],
  );

  const statusLabel =
    game.status === "gameOver"
      ? "Game over"
      : game.status === "won"
        ? "You win"
        : game.status === "paused"
          ? "Paused"
        : game.status === "running"
          ? "Running"
          : "Ready";

  const handleRestart = () => {
    setGame(createInitialState());
  };

  const handlePauseToggle = () => {
    setGame((current) => ({
      ...current,
      status:
        current.status === "running"
          ? "paused"
          : current.status === "paused" || current.status === "idle"
            ? "running"
            : current.status,
    }));
  };

  const handleDirectionPress = (direction) => {
    setGame((current) => ({
      ...current,
      status: current.status === "idle" ? "running" : current.status,
      queuedDirection: queueDirection(current.direction, direction),
    }));
  };

  const primaryActionLabel =
    game.status === "gameOver" || game.status === "won"
      ? "Play again"
      : game.status === "running"
        ? "Pause"
        : "Start";

  const handlePrimaryAction = () => {
    if (game.status === "gameOver" || game.status === "won") {
      handleRestart();
      return;
    }

    handlePauseToggle();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Classic Mode</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Snake</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Use the arrow keys or WASD to move, eat food to grow, and avoid walls or your
                own tail.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="block text-slate-500">Score</span>
                <strong className="text-2xl text-white">{game.score}</strong>
              </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="block text-slate-500">Status</span>
                <strong className="text-2xl text-white">{statusLabel}</strong>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="block text-slate-500">Speed</span>
                <strong className="text-2xl text-white">{tickMs} ms</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/30">
            <div
              aria-label="Snake game board"
              className="relative mx-auto grid aspect-square w-full max-w-140 gap-1 rounded-2xl border border-slate-800 bg-slate-950 p-3"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const key = `${x},${y}`;
                const isSnake = snakeCells.has(key);
                const isHead = game.snake[0].x === x && game.snake[0].y === y;
                const isFood = game.food?.x === x && game.food?.y === y;

                let cellClassName = "rounded-[5px] bg-slate-800";

                if (isSnake) {
                  cellClassName = isHead ? "rounded-[5px] bg-emerald-300" : "rounded-[5px] bg-emerald-500";
                }

                if (isFood) {
                  cellClassName = "rounded-full bg-amber-400";
                }

                return <div key={key} className={cellClassName} />;
              })}

              {game.status !== "running" ? (
                <div className="absolute inset-3 flex items-center justify-center rounded-2xl bg-slate-950/75">
                  <div className="flex max-w-xs flex-col items-center gap-3 text-center">
                    <p className="text-2xl font-semibold text-white">{statusLabel}</p>
                    <p className="text-sm leading-6 text-slate-300">
                      {game.status === "gameOver"
                        ? "You hit a wall or your own tail."
                        : game.status === "won"
                          ? "The board is full. Nice run."
                          : "Start when you are ready."}
                    </p>
                    <button
                      type="button"
                      onClick={handlePrimaryAction}
                      className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-emerald-400"
                    >
                      {primaryActionLabel}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/30">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={handlePrimaryAction}
                className="rounded-xl bg-emerald-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                {primaryActionLabel}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 font-medium text-slate-100 transition hover:border-emerald-400 hover:text-white"
              >
                Restart game
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Controls</p>
              <p className="mt-2">Move with arrow keys or WASD.</p>
              <p className="mt-1">Pause with Space or the action button.</p>
              <p className="mt-1">Tap the on-screen controls on mobile.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm font-medium text-white">Touch controls</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div />
                <button
                  type="button"
                  onClick={() => handleDirectionPress("UP")}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400"
                >
                  Up
                </button>
                <div />
                <button
                  type="button"
                  onClick={() => handleDirectionPress("LEFT")}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400"
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectionPress("DOWN")}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectionPress("RIGHT")}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-emerald-400"
                >
                  Right
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Manual checks</p>
              <p className="mt-2">Start the game and confirm the snake begins moving.</p>
              <p className="mt-1">Eat food and confirm score plus snake length increase.</p>
              <p className="mt-1">Pause and resume without changing the board state.</p>
              <p className="mt-1">Crash into a wall and confirm the overlay appears.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default App;
