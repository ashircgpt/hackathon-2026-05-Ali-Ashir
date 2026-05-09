"use client";

import { useState } from "react";
import TicTacToe from "./TicTacToe";
import PizzaTrivia from "./PizzaTrivia";

type Tab = "ttt" | "trivia";

export default function WaitingGames() {
  const [tab, setTab] = useState<Tab>("ttt");

  return (
    <div className="bg-glass border border-ash rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese">
          🎮 2-Player Games — Pass &amp; Play
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-ash">
        <button
          onClick={() => setTab("ttt")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors
            ${tab === "ttt"
              ? "text-ember border-b-2 border-ember -mb-px"
              : "text-smoke hover:text-cream"}`}
        >
          Tic-Tac-Toe
        </button>
        <button
          onClick={() => setTab("trivia")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-colors
            ${tab === "trivia"
              ? "text-ember border-b-2 border-ember -mb-px"
              : "text-smoke hover:text-cream"}`}
        >
          Pizza Trivia
        </button>
      </div>

      <div>{tab === "ttt" ? <TicTacToe /> : <PizzaTrivia />}</div>
    </div>
  );
}
