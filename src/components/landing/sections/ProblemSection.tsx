"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ScrollText,
  MessageSquareWarning,
  EyeOff,
  Calculator,
  AlertTriangle,
  Hourglass,
} from "lucide-react";

const PROBLEMS = [
  {
    icon: ScrollText,
    title: "Static, lifeless menus",
    desc: "Paper menus and basic digital catalogs that haven't evolved in decades. No personality, no interactivity.",
  },
  {
    icon: MessageSquareWarning,
    title: "Verbal miscommunication",
    desc: "Orders relayed through waiters introduce errors at every step. Wrong toppings, wrong sizes, wrong instructions.",
  },
  {
    icon: EyeOff,
    title: "No live preview",
    desc: "Customers can't see what they're building until the food arrives. Surprises — usually unwelcome ones.",
  },
  {
    icon: Calculator,
    title: "Hidden pricing & nutrition",
    desc: "No real-time updates for price, calories, protein, fats, or carbs while customizing. Informed dining is impossible.",
  },
  {
    icon: AlertTriangle,
    title: "Chaotic kitchen workflow",
    desc: "Paper tickets, shouted orders, and lost slips during peak hours create operational mess and bad food.",
  },
  {
    icon: Hourglass,
    title: "Hidden order status",
    desc: "Once an order is placed, customers are in the dark. Perceived wait time stretches. Anxiety builds.",
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".problem-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });
      gsap.from(".problem-card", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6 bg-tomato-radial"
    >
      <div className="max-w-6xl mx-auto">
        <p className="problem-heading text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-tomato mb-6">
          02 — THE OLD WAY
        </p>
        <h2 className="problem-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight max-w-3xl">
          Restaurants are stuck
          <br />
          <span className="text-tomato">in 1995.</span>
        </h2>
        <p className="problem-heading text-base md:text-lg text-cream/70 max-w-2xl mb-16 leading-relaxed">
          Six pain points every diner has felt. Six broken processes every
          restaurant tolerates because they always have.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="problem-card group rounded-2xl border border-ash bg-glass/40 p-6 hover:border-tomato/60 hover:bg-glass/60 transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-tomato/10 flex items-center justify-center mb-5 text-tomato group-hover:bg-tomato/20 group-hover:scale-110 transition-all">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-cream mb-2 leading-tight">
                {title}
              </h3>
              <p className="text-sm text-cream/60 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
