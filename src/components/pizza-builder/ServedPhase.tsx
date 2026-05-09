"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import FeedbackForm from "./FeedbackForm";

interface Props {
  orderId: number;
  tableNum: number;
}

export default function ServedPhase({ orderId, tableNum }: Props) {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !scope.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        scope.current!.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power3.out" },
      );
    }, scope);
    return () => ctx.revert();
  }, []);

  function returnHome() {
    router.push("/");
  }

  return (
    <div
      ref={scope}
      className="w-full max-w-xl mx-auto flex flex-col gap-6"
    >
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-3">
          Pizza3.14 — Table {tableNum}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/40 text-green-400 text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
          Order #{orderId} — Served
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-cream mt-4">
          Enjoy your pizza! 🍕
        </h2>
      </div>

      <div className="bg-glass border border-ash rounded-2xl p-6">
        <FeedbackForm
          orderId={orderId}
          onSubmitted={returnHome}
          onSkip={returnHome}
        />
      </div>
    </div>
  );
}
