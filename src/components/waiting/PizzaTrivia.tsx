"use client";

import { useEffect, useState } from "react";

interface Question {
  q: string;
  options: string[];
  correct: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ALL_QUESTIONS: Question[] = [
  {
    q: "Which Italian city is widely credited as the birthplace of pizza?",
    options: ["Rome", "Naples", "Milan", "Florence"],
    correct: 1,
  },
  {
    q: "What does 'Margherita' pizza traditionally feature?",
    options: ["Pepperoni and olives", "BBQ chicken and onions", "Tomato, mozzarella, and basil", "Anchovies and capers"],
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
  {
    q: "What year was pizza Margherita reportedly created for Queen Margherita of Savoy?",
    options: ["1799", "1830", "1889", "1912"],
    correct: 2,
  },
  {
    q: "Which US state consumes the most pizza per capita?",
    options: ["New York", "New Jersey", "Connecticut", "Illinois"],
    correct: 1,
  },
  {
    q: "What is a 'calzone'?",
    options: ["A thin-crust Sicilian pizza", "A folded pizza turnover", "A type of pizza sauce", "A wood-fired oven style"],
    correct: 1,
  },
  {
    q: "The Associazione Verace Pizza Napoletana (AVPN) was founded in which city?",
    options: ["Rome", "Naples", "Venice", "Bologna"],
    correct: 1,
  },
  {
    q: "What is 'pizza bianca'?",
    options: ["Pizza with white truffle oil", "Pizza with no tomato sauce", "Pizza with bechamel base", "Pizza from northern Italy only"],
    correct: 1,
  },
  {
    q: "Which US president is famously associated with a pizza delivery story at the White House?",
    options: ["Bill Clinton", "Barack Obama", "George W. Bush", "Ronald Reagan"],
    correct: 0,
  },
  {
    q: "What type of flour is traditionally used for authentic Neapolitan pizza dough?",
    options: ["Whole wheat flour", "Rye flour", "Type '00' flour", "Semolina flour"],
    correct: 2,
  },
  {
    q: "The world record for the longest pizza was set in which country?",
    options: ["USA", "Italy", "China", "Brazil"],
    correct: 0,
  },
  {
    q: "What is the most popular pizza topping in the United States?",
    options: ["Mushrooms", "Pepperoni", "Sausage", "Extra cheese"],
    correct: 1,
  },
  {
    q: "A Sicilian pizza is typically characterized by which feature?",
    options: ["Ultra-thin, crispy crust", "Thick, rectangular shape", "No cheese at all", "Only anchovies as topping"],
    correct: 1,
  },
  {
    q: "What does 'al taglio' mean in Italian pizza culture?",
    options: ["Baked in a stone oven", "By the slice / cut to order", "With fresh-cut herbs", "Double-baked crust"],
    correct: 1,
  },
  {
    q: "Which country consumes the most pizza in the world by total volume?",
    options: ["Italy", "Brazil", "United States", "France"],
    correct: 2,
  },
  {
    q: "New York-style pizza is known for which characteristic?",
    options: ["Cracker-thin crust with no foldability", "Thick deep-dish base", "Large foldable slices with hand-tossed crust", "Sourdough base"],
    correct: 2,
  },
  {
    q: "Detroit-style pizza is baked in what kind of pan?",
    options: ["Cast iron skillet", "Rectangular steel pan", "Clay pot", "Round ceramic dish"],
    correct: 1,
  },
  {
    q: "What is the primary cheese used in authentic Neapolitan pizza?",
    options: ["Parmesan", "Provolone", "Buffalo mozzarella (fior di latte)", "Pecorino Romano"],
    correct: 2,
  },
  {
    q: "Which pizza style is native to Chicago?",
    options: ["Thin crust tavern style", "Deep-dish / stuffed pizza", "Coal-fired Neapolitan", "Roman flatbread"],
    correct: 1,
  },
  {
    q: "What is 'stromboli'?",
    options: ["A rolled pizza sandwich", "A Sicilian deep-dish", "An Italian pizza oven type", "A cheese-free pizza"],
    correct: 0,
  },
  {
    q: "How long should authentic Neapolitan pizza dough ferment?",
    options: ["30 minutes", "2–4 hours", "8–24 hours", "3–5 days"],
    correct: 2,
  },
  {
    q: "The famous Di Fara Pizza in NYC uses which special finishing touch?",
    options: ["Truffle shavings", "Fresh basil torn by hand and extra olive oil", "Gold leaf flakes", "Aged balsamic drizzle"],
    correct: 1,
  },
  {
    q: "What is the official maximum diameter of a Neapolitan pizza according to AVPN rules?",
    options: ["22 cm", "28 cm", "35 cm", "40 cm"],
    correct: 2,
  },
  {
    q: "Which pizza topping is most controversial worldwide?",
    options: ["Anchovies", "Pineapple", "Blue cheese", "Jalapeños"],
    correct: 1,
  },
  {
    q: "In what decade did frozen pizza become widely available in US supermarkets?",
    options: ["1940s", "1950s", "1960s", "1970s"],
    correct: 1,
  },
  {
    q: "What makes a St. Louis–style pizza distinctive?",
    options: ["Extra thick focaccia base", "Provel cheese blend on a cracker-thin crust", "Only three toppings allowed by tradition", "Cornmeal-dusted base"],
    correct: 1,
  },
  {
    q: "The word 'pizza' first appeared in a written document in which century?",
    options: ["8th century", "10th century", "13th century", "16th century"],
    correct: 1,
  },
  {
    q: "Which country invented the 'Hawaiian' pizza (ham and pineapple)?",
    options: ["Hawaii, USA", "Canada", "Australia", "Italy"],
    correct: 1,
  },
  {
    q: "Sam Panopoulos, credited with inventing Hawaiian pizza, was originally from?",
    options: ["Greece", "Canada", "Italy", "Cyprus"],
    correct: 0,
  },
  {
    q: "What is a 'focaccia'?",
    options: ["A fried pizza dough ball", "A flatbread that is a pizza precursor", "A type of pizza sauce", "A double-crust pizza"],
    correct: 1,
  },
  {
    q: "Domino's Pizza was founded in which US state?",
    options: ["Michigan", "Ohio", "Illinois", "New York"],
    correct: 0,
  },
  {
    q: "Pizza Hut opened its first restaurant in which decade?",
    options: ["1940s", "1950s", "1960s", "1970s"],
    correct: 1,
  },
  {
    q: "What is 'lahmacun'?",
    options: ["A Turkish flatbread topped with minced meat — sometimes called 'Turkish pizza'", "A Lebanese cheese flatbread", "A Greek thin-crust pizza", "A Persian naan pizza"],
    correct: 0,
  },
  {
    q: "Which gas makes pizza dough rise?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    correct: 2,
  },
  {
    q: "What is the Maillard reaction important for in pizza making?",
    options: ["Keeping the dough soft", "Browning the crust and developing flavor", "Preventing cheese from burning", "Activating yeast"],
    correct: 1,
  },
  {
    q: "Which herb is most commonly used as a finishing garnish on Neapolitan pizza?",
    options: ["Oregano", "Thyme", "Fresh basil", "Rosemary"],
    correct: 2,
  },
  {
    q: "What percentage of Americans eat pizza at least once a month (approx.)?",
    options: ["40%", "60%", "75%", "93%"],
    correct: 3,
  },
  {
    q: "The Guinness World Record for the most expensive pizza sold commercially is approximately?",
    options: ["$100", "$500", "$2,000", "$12,000"],
    correct: 3,
  },
  {
    q: "Roman-style pizza (pizza al taglio) is typically cooked in what type of oven?",
    options: ["Wood-fired dome oven", "Electric deck oven", "Convection oven", "Stone hearth oven"],
    correct: 1,
  },
  {
    q: "Which of these cheeses is traditional in a classic four-cheese (quattro formaggi) pizza?",
    options: ["Cheddar", "Gorgonzola", "Brie", "Gruyère"],
    correct: 1,
  },
  {
    q: "What is 'nduja'?",
    options: ["A Calabrian spicy spreadable salami used as pizza topping", "A type of pizza dough with chili", "A spicy Sicilian tomato sauce", "An aged hard cheese"],
    correct: 0,
  },
  {
    q: "How many slices does an average large pizza have?",
    options: ["6", "8", "10", "12"],
    correct: 1,
  },
  {
    q: "What does 'DOC' mean on Italian food labels, including pizza ingredients?",
    options: ["Denominazione di Origine Controllata — protected regional origin", "Direct from Organic Cultivation", "Daily Origin Certificate", "Denominazione Officiale Culinaria"],
    correct: 0,
  },
  {
    q: "Which NASA mission famously included pizza as an approved food?",
    options: ["Apollo 11", "Space Shuttle Columbia", "No NASA mission — pizza is not approved space food", "ISS resupply missions"],
    correct: 3,
  },
  {
    q: "What is 'porchetta' when used as a pizza topping?",
    options: ["Cured pork loin with herbs", "Crispy pork belly bacon", "Spicy pork meatballs", "Pork rind crumbles"],
    correct: 0,
  },
  {
    q: "Which of these is a hallmark of New Haven–style (apizza) pizza?",
    options: ["Thick Sicilian base", "Coal-fired, oblong shape, slightly charred crust", "Deep-dish with chunky sauce", "No cheese option called 'tomato pie'"],
    correct: 1,
  },
  {
    q: "Pizza3.14 is named after which mathematical constant?",
    options: ["The golden ratio (φ ≈ 1.618)", "Pi (π ≈ 3.14159)", "Euler's number (e ≈ 2.718)", "The square root of 2 (≈ 1.414)"],
    correct: 1,
  },
  {
    q: "In pizza making, 'autolyse' refers to?",
    options: ["Adding yeast to warm water first", "Letting flour and water rest before adding salt/yeast to develop gluten", "Baking the crust without toppings first", "Brushing crust with olive oil before baking"],
    correct: 1,
  },
];

function getGameQuestions(): Question[] {
  return shuffle(ALL_QUESTIONS).slice(0, 10);
}

export default function PizzaTrivia() {
  const [questions, setQuestions] = useState<Question[]>(() => getGameQuestions());
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [chosen, setChosen] = useState<number | null>(null);
  const [advanceTimer, setAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  // Player 1 takes even-indexed questions (0, 2, 4, ...); Player 2 takes odd (1, 3, 5, ...)
  const player: 0 | 1 = idx % 2 === 0 ? 0 : 1;
  const finished = idx >= questions.length;
  const current = questions[idx];

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
    setQuestions(getGameQuestions());
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
          Q {idx + 1} / {questions.length}
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
