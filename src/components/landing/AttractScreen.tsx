"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import PizzaHeroDisc, { type PizzaHeroDiscHandle } from "./PizzaHeroDisc";
import IngredientOrbitRing from "./IngredientOrbitRing";
import ComboTopBanner from "./ComboTopBanner";
import PrimaryCTA from "./PrimaryCTA";

export default function AttractScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const discWrapRef   = useRef<HTMLDivElement>(null);
  const discHandleRef = useRef<PizzaHeroDiscHandle | null>(null);
  const idleTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdleRef     = useRef(false);

  // ── Idle detection ──────────────────────────────────────────────────────────
  useEffect(() => {
    function resetIdle() {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (isIdleRef.current) {
        isIdleRef.current = false;
        gsap.globalTimeline.timeScale(1);
      }
      idleTimerRef.current = setTimeout(() => {
        isIdleRef.current = true;
        gsap.globalTimeline.timeScale(0.5);
      }, 60_000);
    }
    resetIdle();
    window.addEventListener("mousemove",  resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove",  resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, []);

  // ── Load sequence ────────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const discWrap = discWrapRef.current;
      if (!discWrap) return;

      // Pre-hide everything
      gsap.set(discWrap, { y: 40, opacity: 0 });

      const tl = gsap.timeline();

      // 0.3s — pizza disc rises in
      tl.to(discWrap, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 0.3);

      // 0.9s — ingredient images pop in staggered
      tl.fromTo(
        ".orbit-item",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.08 },
        0.9,
      );

      // 1.2s — CTA springs in (PrimaryCTA is inside discWrap column, handled separately)
      tl.fromTo(
        ".cta-wrapper",
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
        1.2,
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-hidden bg-void relative flex items-center justify-center"
    >
      {/* Combo banner — absolute top center */}
      <ComboTopBanner />

      {/* Central stack: orbit ring (absolute) + disc + CTA (column) */}
      <div ref={discWrapRef} className="relative flex flex-col items-center">
        {/* Orbit ring sits absolutely centered on the disc */}
        <IngredientOrbitRing />

        {/* Pizza disc */}
        <PizzaHeroDisc ref={discHandleRef} />

        {/* CTA below disc */}
        <div className="cta-wrapper opacity-0">
          <PrimaryCTA discRef={discHandleRef} />
        </div>
      </div>
    </div>
  );
}
