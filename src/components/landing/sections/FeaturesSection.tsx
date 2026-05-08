"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Pizza,
  Activity,
  ChefHat,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Pizza,
    title: "Visual Pizza Builder",
    desc: "Drag ingredients onto a live canvas. Watch your pizza come together layer by layer with real food photography — base, sauce, cheese, toppings.",
    color: "ember",
  },
  {
    icon: Activity,
    title: "Live Nutrition & Pricing",
    desc: "Calories, protein, fats, carbs, and total price update instantly as you customize. No surprises at the bill — informed choices on every layer.",
    color: "cheese",
  },
  {
    icon: ChefHat,
    title: "Real-time Kitchen Kanban",
    desc: "Socket.io push moves orders through NEW → PREPARING → BAKING → READY → SERVED. Drag to advance. Zero refresh, zero confusion.",
    color: "ember",
  },
  {
    icon: Radar,
    title: "Live Order Tracking",
    desc: "Watch your pizza progress live from the table. Know exactly where it is in the kitchen flow. No more guessing the wait.",
    color: "cheese",
  },
  {
    icon: ShieldCheck,
    title: "Blockchain Feedback",
    desc: "Every review hashed into an append-only SHA-256 chain. Each block references the previous. Tamper-evident, verifiable, fully transparent.",
    color: "tomato",
  },
  {
    icon: Sparkles,
    title: "Most Famous Combo",
    desc: "The system surfaces the most-ordered combinations from real customer behavior. Crowd favorites suggested at the right moment.",
    color: "ember",
  },
];

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  ember:  { bg: "bg-ember/15",  text: "text-ember"  },
  cheese: { bg: "bg-cheese/15", text: "text-cheese" },
  tomato: { bg: "bg-tomato/15", text: "text-tomato" },
};

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".features-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from(".feature-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <p className="features-heading text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
          04 — WHAT YOU GET
        </p>
        <h2 className="features-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-4xl">
          Six features.{" "}
          <span className="text-gradient-pizza">One revolution.</span>
        </h2>
        <p className="features-heading text-base md:text-lg text-cream/70 max-w-2xl mb-16 leading-relaxed">
          Every feature solves a specific problem. Every interaction feels
          intentional. Every pixel earns its place.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => {
            const cls = COLOR_MAP[color];
            return (
              <div
                key={title}
                className="feature-card group rounded-2xl border border-ash bg-glass/40 p-8 hover:border-ember/50 hover:bg-glass/70 hover:-translate-y-1 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${cls.bg} ${cls.text} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-cream mb-3 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-cream/65 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
