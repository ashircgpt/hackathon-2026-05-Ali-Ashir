"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function FinalCTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cta-reveal", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
      gsap.fromTo(
        ".cta-pizza-wrap",
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
      gsap.to(".cta-pizza-img", {
        rotation: 360,
        duration: 50,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".cta-glow", {
        scale: 1.2,
        opacity: 0.7,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".cta-button", {
        boxShadow: "0 0 40px hsl(24 95% 53% / 0.85)",
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 py-32 overflow-hidden"
    >
      {/* Massive pizza disc behind text */}
      <div className="cta-pizza-wrap absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] md:w-[680px] md:h-[680px] pointer-events-none">
        <div className="cta-glow absolute inset-0 rounded-full bg-ember/50 blur-3xl opacity-50" />
        <div className="cta-pizza-img relative w-full h-full rounded-full overflow-hidden border-2 border-ember/40 opacity-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/pizza/bases/1.jpg"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden
          />
        </div>
      </div>

      {/* Foreground text + CTA */}
      <div className="relative z-10 text-center max-w-3xl">
        <p className="cta-reveal text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
          06 — YOUR TURN
        </p>
        <h2 className="cta-reveal text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Your table is set.
          <br />
          <span className="text-gradient-pizza">Your pizza awaits.</span>
        </h2>
        <p className="cta-reveal text-lg md:text-xl text-cream/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Step into the future of dining. One tap, and the experience begins.
        </p>
        <button
          onClick={() => router.push("/table/1")}
          className="cta-reveal cta-button group inline-flex items-center gap-3 bg-ember text-void rounded-full px-10 py-5 text-lg md:text-xl font-bold hover:bg-cheese hover:scale-105 transition-all shadow-2xl focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void"
        >
          Let&apos;s Build Your Pizza
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            aria-hidden
          >
            <path
              d="M5 12h14M13 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <p className="cta-reveal text-xs md:text-sm text-cream/40 mt-6 font-mono">
          Tap to begin your Pizza3.14 experience
        </p>
      </div>
    </section>
  );
}
