"use client";

import { useEffect, useState } from "react";

interface Question {
  q: string;
  options: string[];
  correct: number;
}

const QUESTIONS: Question[] = [
  {
    q: "Which Italian city is widely credited as the birthplace of pizza?",
    options: ["Rome", "Naples", "Milan", "Florence"],
    correct: 1,
  },
  {
    q: "What does 'Margherita' pizza traditionally feature?",
    options: [
      "Pepperoni and olives",
      "BBQ chicken and onions",
      "Tomato, mozzarella, and basil",
      "Anchovies and capers",
    ],
    correct: 2,
  },
  {
    q: "Roughly how many pizzas are eaten in the US every second?",
    options: ["10", "100", "350", "1,000"],
    correct: 2,
  },
  {
    q: "What is the world's largest pizza chain by store count?",
    options: ["Pizza Hut", "Papa John's", "Domino's", "Little Caesars"],
    correct: 2,
  },
  {
    q: "Which of these is NOT a traditional Neapolitan pizza topping?",
    options: ["Buffalo mozzarella", "Pineapple", "San Marzano tomatoes", "Basil"],
    correct: 1,
  },
  {
    q: "What temperature does a wood-fired pizza oven typically reach?",
    options: ["~250°F", "~450°F", "~700°F", "~900°F"],
    correct: 3,
  },
];

export default function PizzaTrivia() {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [advanceTimer, setAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  // Player 1 takes even-indexed questions (0, 2, 4); Player 2 takes odd (1, 3, 5)
  const player: 0 | 1 = idx % 2 === 0 ? 0 : 1;
  const finished = idx >= QUESTIONS.length;
  const current = QUESTIONS[idx];

  useEffect(() => {
    return () => {
      if (advanceTimer) clearTimeout(advanceTimer);
    };
  }, [advanceTimer]);

  function pick(option: number) {
    if (chosen !== null || finished) return;
    setChosen(option);
    if (option === current.correct) {
      setScores((s) => {
        const next: [number, number] = [...s];
        next[player] += 1;
        return next;
      });
    }
    const t = setTimeout(() => {
      setIdx((i) => i + 1);
      setChosen(null);
    }, 1200);
    setAdvanceTimer(t);
  }

  function reset() {
    if (advanceTimer) clearTimeout(advanceTimer);
    setIdx(0);
    setScores([0, 0]);
    setChosen(null);
  }

  if (finished) {
    const winner =
      scores[0] === scores[1]
        ? "It's a draw!"
        : scores[0] > scores[1]
          ? "Player 1 wins! 🏆"
          : "Player 2 wins! 🏆";

    return (
      <div className="flex flex-col items-center gap-5 py-2">
        <p className="text-lg font-bold text-cream">{winner}</p>
        <div className="flex gap-6 text-sm font-mono">
          <span className="text-ember">P1: {scores[0]}</span>
          <span className="text-cheese">P2: {scores[1]}</span>
        </div>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-full bg-ember text-void text-xs font-bold hover:bg-cheese transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className={player === 0 ? "text-ember font-bold" : "text-smoke"}>
          P1: {scores[0]}
        </span>
        <span className="text-smoke">
          Q {idx + 1} / {QUESTIONS.length}
        </span>
        <span className={player === 1 ? "text-cheese font-bold" : "text-smoke"}>
          P2: {scores[1]}
        </span>
      </div>

      <div className="bg-void/50 border border-ash rounded-xl p-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-2">
          Player {player + 1}&apos;s turn
        </p>
        <p className="text-sm text-cream">{current.q}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {current.options.map((opt, i) => {
          const isChosen = chosen === i;
          const isCorrect = chosen !== null && i === current.correct;
          const isWrong = isChosen && i !== current.correct;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={chosen !== null}
              className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-all
                ${isCorrect
                  ? "bg-green-500/15 border-green-500/50 text-green-300"
                  : isWrong
                    ? "bg-red-500/15 border-red-500/50 text-red-300"
                    : "bg-void/40 border-ash text-cream/85 hover:border-ember/60 disabled:opacity-50"
                }
                disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ember/40`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
