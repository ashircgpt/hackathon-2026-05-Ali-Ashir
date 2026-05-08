"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Hand, ChefHat, Settings2 } from "lucide-react";

const PILLARS = [
  {
    icon: Hand,
    label: "TABLE",
    title: "Customer Interface",
    desc: "Interactive tabletop for visual pizza building, live nutrition, real-time order tracking, and verified feedback after the meal.",
    accent: "ember",
  },
  {
    icon: ChefHat,
    label: "KITCHEN",
    title: "Real-time Operations",
    desc: "Socket.io-powered Kanban board. Drag-to-advance through NEW → PREPARING → BAKING → READY without paper tickets or shouting.",
    accent: "cheese",
  },
  {
    icon: Settings2,
    label: "ADMIN",
    title: "Control & Insight",
    desc: "Menu management, ingredient availability, pricing, hourly analytics, and a tamper-evident SHA-256 feedback ledger.",
    accent: "tomato",
  },
];

export default function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".solution-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
      gsap.from(".pillar-card", {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
      });
      gsap.fromTo(
        ".pillar-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="solution"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 bg-pizza-radial"
    >
      <div className="max-w-6xl mx-auto">
        <p className="solution-heading text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
          03 — THE PIZZA3.14 WAY
        </p>
        <h2 className="solution-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-4xl">
          One platform. <span className="text-cream/40">Three surfaces.</span>
          <br />
          <span className="text-gradient-pizza">Zero friction.</span>
        </h2>
        <p className="solution-heading text-base md:text-lg text-cream/70 max-w-2xl mb-20 leading-relaxed">
          A unified ecosystem connects every part of the dining experience —
          from the customer&apos;s seat to the kitchen line to the admin
          office. Real-time. Tamper-evident. Beautiful.
        </p>

        <div className="relative grid md:grid-cols-3 gap-6">
          {/* Connecting line behind cards (desktop only) */}
          <div className="pillar-line absolute top-[58px] left-12 right-12 h-px bg-gradient-to-r from-ember via-cheese to-tomato origin-left hidden md:block" />

          {PILLARS.map(({ icon: Icon, label, title, desc, accent }) => (
            <div
              key={label}
              className="pillar-card relative bg-glass border border-ash rounded-2xl p-8 hover:border-ember/50 hover:-translate-y-1 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 ${
                  accent === "ember"
                    ? "bg-ember/15 text-ember"
                    : accent === "cheese"
                    ? "bg-cheese/15 text-cheese"
                    : "bg-tomato/15 text-tomato"
                }`}
              >
                <Icon className="w-6 h-6" aria-hidden />
              </div>
              <p
                className={`text-[11px] font-mono uppercase tracking-widest mb-2 ${
                  accent === "ember"
                    ? "text-ember"
                    : accent === "cheese"
                    ? "text-cheese"
                    : "text-tomato"
                }`}
              >
                {label}
              </p>
              <h3 className="text-xl font-bold text-cream mb-3">{title}</h3>
              <p className="text-sm text-cream/65 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
