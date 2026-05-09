"use client";

import { useMemo, useState } from "react";

type Cell = "X" | "O" | null;

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function detectWinner(board: Cell[]): { winner: Cell; line: number[] | null } {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(() => Array(9).fill(null));
  const [turn, setTurn] = useState<"X" | "O">("X");

  const { winner, line } = useMemo(() => detectWinner(board), [board]);
  const draw = !winner && board.every((c) => c !== null);
  const finished = !!winner || draw;

  function place(idx: number) {
    if (board[idx] || finished) return;
    const next = board.slice();
    next[idx] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  }

  function reset() {
    setBoard(Array(9).fill(null));
    setTurn("X");
  }

  const status = winner
    ? `${winner} wins! 🎉`
    : draw
      ? "Draw — try again."
      : `${turn}'s turn`;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-mono text-cream">{status}</p>

      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWinningCell = line?.includes(i);
          return (
            <button
              key={i}
              onClick={() => place(i)}
              disabled={!!cell || finished}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ", empty"}`}
              className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center text-3xl font-bold transition-all
                ${isWinningCell
                  ? "bg-ember/25 border-ember text-ember shadow-[0_0_20px_rgba(255,107,53,0.5)]"
                  : cell
                    ? "bg-void/60 border-ash text-cream"
                    : "bg-void/40 border-ash hover:border-ember/60 text-cream/40 cursor-pointer"
                }
                ${finished && !cell ? "opacity-50" : ""}
                disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ember/40`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <button
        onClick={reset}
        className="px-4 py-2 rounded-full border border-ash text-smoke text-xs font-mono hover:border-ember hover:text-ember transition-colors"
      >
        Reset Board
      </button>
    </div>
  );
}
