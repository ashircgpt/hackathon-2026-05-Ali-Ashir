"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import type { PizzaHeroDiscHandle } from "./PizzaHeroDisc";

interface PrimaryCTAProps {
  discRef: React.RefObject<PizzaHeroDiscHandle | null>;
}

export default function PrimaryCTA({ discRef }: PrimaryCTAProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    // Continuous border glow pulse — starts after load sequence
    const pulseTween = gsap.delayedCall(2.2, () => {
      gsap.to(btn, {
        boxShadow: "0 0 32px hsl(24 95% 53% / 0.8), 0 0 0 2px hsl(24 95% 53% / 0.4)",
        duration: 1.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    return () => {
      pulseTween.kill();
      gsap.killTweensOf(btn);
    };
  }, []);

  function handleMouseEnter() {
    discRef.current?.setSpeedMultiplier(4);
  }
  function handleMouseLeave() {
    discRef.current?.setSpeedMultiplier(1);
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-8 relative z-10">
      <button
        ref={btnRef}
        onClick={() => router.push("/table/1")}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-ember text-void rounded-full px-10 py-4 text-lg font-bold hover:bg-ember-dim transition-colors focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void"
      >
        Let&apos;s Build Your Pizza →
      </button>
      <p className="text-sm text-smoke">or tap any ingredient to begin</p>
    </div>
  );
}
