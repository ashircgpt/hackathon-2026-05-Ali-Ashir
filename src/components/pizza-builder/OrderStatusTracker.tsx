"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = [
  "NEW",
  "PREPARING",
  "BAKING",
  "READY",
  "SERVED",
];

interface Props {
  status: OrderStatus;
  orderId: number;
}

export default function OrderStatusTracker({ status, orderId }: Props) {
  const scope = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const currentIdx = STATUS_STEPS.indexOf(status);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const pct = currentIdx >= 0
      ? (currentIdx / (STATUS_STEPS.length - 1)) * 100
      : 0;
    if (fillRef.current) {
      if (reduce) {
        fillRef.current.style.width = `${pct}%`;
      } else {
        gsap.to(fillRef.current, {
          width: `${pct}%`,
          duration: 0.8,
          ease: "power3.out",
        });
      }
    }
  }, [currentIdx]);

  return (
    <div
      ref={scope}
      className="bg-glass border border-ash rounded-2xl p-6 w-full"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-mono uppercase tracking-widest text-cheese">
          Order #{orderId} — Live Status
        </p>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-ember/15 text-ember border border-ember/30">
          {status}
        </span>
      </div>

      {/* Step dots */}
      <div className="relative flex items-start justify-between gap-1">
        {STATUS_STEPS.map((step, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center gap-2 relative z-10"
            >
              <div
                className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all
                  ${isActive ? "border-ember bg-ember/25 text-ember" : isDone ? "border-cream/40 bg-cream/10 text-cream/70" : "border-ash bg-void text-ash"}`}
              >
                {isDone ? "✓" : i + 1}
                {isActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-ember animate-ping opacity-50" />
                )}
              </div>
              <span
                className={`text-[9px] font-mono uppercase tracking-widest text-center leading-tight
                  ${isActive ? "text-ember" : isDone ? "text-cream/60" : "text-ash"}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Connector bar */}
      <div className="relative -mt-7 mb-9 h-px mx-5">
        <div className="absolute inset-0 bg-ash" />
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 bg-ember"
          style={{ width: 0 }}
        />
      </div>
    </div>
  );
}
