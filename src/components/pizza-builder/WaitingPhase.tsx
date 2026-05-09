"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import OrderStatusTracker from "./OrderStatusTracker";
import WaitingGames from "@/components/waiting/WaitingGames";
import type { OrderStatus } from "@/types";

interface Props {
  orderId: number;
  tableNum: number;
  status: OrderStatus;
}

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  NEW: "Order received — chef is up next.",
  PREPARING: "Chef is prepping your ingredients.",
  BAKING: "Your pizza is in the oven 🔥",
  READY: "Almost there — coming to your table!",
  SERVED: "Enjoy!",
};

export default function WaitingPhase({ orderId, tableNum, status }: Props) {
  const [gamesVisible, setGamesVisible] = useState(true);
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !scope.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        scope.current!.querySelectorAll("[data-wait-section]"),
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.12,
          ease: "power3.out",
        },
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={scope} className="w-full max-w-3xl mx-auto flex flex-col gap-5">
      <div data-wait-section className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Pizza3.14 — Table {tableNum}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-cream">
          {STATUS_MESSAGE[status]}
        </h2>
      </div>

      <div data-wait-section>
        <OrderStatusTracker status={status} orderId={orderId} />
      </div>

      <div data-wait-section>
        {gamesVisible ? (
          <div className="relative">
            <button
              onClick={() => setGamesVisible(false)}
              aria-label="Hide games"
              className="absolute right-4 top-4 z-10 text-[10px] font-mono px-3 py-1 rounded-full bg-void/60 border border-ash text-smoke hover:text-cream hover:border-cream/40 transition-colors"
            >
              Hide games ↓
            </button>
            <WaitingGames />
          </div>
        ) : (
          <button
            onClick={() => setGamesVisible(true)}
            className="w-full py-3 rounded-2xl bg-glass border border-ash text-xs font-mono uppercase tracking-widest text-smoke hover:text-ember hover:border-ember/40 transition-colors"
          >
            🎮 Show games while you wait ↑
          </button>
        )}
      </div>
    </div>
  );
}
