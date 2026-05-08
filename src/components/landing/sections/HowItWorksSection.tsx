"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sofa, MousePointer2, Send, Eye, ShieldCheck } from "lucide-react";

const STEPS = [
  { n: "01", icon: Sofa,           title: "Sit",     desc: "Take a seat. The table greets you with the menu and a warm welcome." },
  { n: "02", icon: MousePointer2,  title: "Build",   desc: "Drag layers onto the canvas. See your pizza form. Live nutrition, live price." },
  { n: "03", icon: Send,           title: "Order",   desc: "One tap places the order. The kitchen sees it instantly — no waiter relay." },
  { n: "04", icon: Eye,            title: "Watch",   desc: "Live status updates as it bakes. NEW, PREPARING, BAKING, READY — all visible." },
  { n: "05", icon: ShieldCheck,    title: "Verify",  desc: "Leave tamper-evident feedback after the meal. Every review is on-chain." },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".flow-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
      gsap.from(".step-item", {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 65%", once: true },
      });
      gsap.fromTo(
        ".flow-line-fill",
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="flow"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <p className="flow-heading text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
          05 — THE EXPERIENCE
        </p>
        <h2 className="flow-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-20 leading-tight max-w-3xl">
          Five steps.{" "}
          <span className="text-cream/40">From seat to satisfaction.</span>
        </h2>

        <div className="relative">
          {/* Background timeline rail (desktop only) */}
          <div className="absolute top-8 left-8 right-8 h-px bg-ash hidden md:block" />
          {/* Animated gradient fill */}
          <div className="flow-line-fill absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-ember via-cheese to-tomato origin-left hidden md:block" />

          <div className="grid md:grid-cols-5 gap-10 md:gap-4">
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="step-item relative">
                <div className="relative z-10 w-16 h-16 rounded-full bg-glass border-2 border-ember flex items-center justify-center text-ember mb-5 mx-auto md:mx-0 shadow-lg shadow-ember/20">
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-cheese mb-1">
                    Step {n}
                  </p>
                  <h3 className="text-2xl font-bold text-cream mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-cream/60 leading-relaxed">
                    {desc}
                  </p>
                </div>
                {/* Mobile arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div className="md:hidden flex justify-center mt-6 text-ember/40">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
