"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

export interface PizzaHeroDiscHandle {
  setSpeedMultiplier: (m: number) => void;
}

const PizzaHeroDisc = forwardRef<PizzaHeroDiscHandle>((_, ref) => {
  const discRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const spinTweenRef = useRef<gsap.core.Tween | null>(null);

  useImperativeHandle(ref, () => ({
    setSpeedMultiplier(m: number) {
      spinTweenRef.current?.timeScale(m);
    },
  }));

  useEffect(() => {
    const disc = discRef.current;
    const glow = glowRef.current;
    if (!disc || !glow) return;

    // Start continuous animations after the load-sequence delay (2s)
    const delayedStart = gsap.delayedCall(2, () => {
      spinTweenRef.current = gsap.to(disc, {
        rotation: 360,
        duration: 25,
        ease: "none",
        repeat: -1,
      });
      gsap.to(glow, {
        scale: 1.15,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    return () => {
      delayedStart.kill();
      spinTweenRef.current?.kill();
      gsap.killTweensOf(glow);
    };
  }, []);

  return (
    <div className="relative w-[380px] h-[380px] shrink-0">
      {/* Ambient glow behind disc */}
      <div
        ref={glowRef}
        className="absolute -inset-8 rounded-full blur-[80px] bg-ember opacity-40 pointer-events-none"
        aria-hidden
      />
      {/* Rotating disc */}
      <div
        ref={discRef}
        className="relative w-full h-full rounded-full overflow-hidden border-2 border-ember/30"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/pizza/bases/1.jpg"
          alt="Pizza base"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
});

PizzaHeroDisc.displayName = "PizzaHeroDisc";
export default PizzaHeroDisc;
