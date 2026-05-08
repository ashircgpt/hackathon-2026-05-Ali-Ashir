"use client";

import { useEffect, useRef } from "react";

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    sectionRef.current
      .querySelectorAll(".reveal, .reveal-scale")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative py-32 md:py-48 px-6"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left — narrative */}
        <div>
          <p className="reveal text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
            01 — THE VISION
          </p>
          <h2 className="reveal text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight" style={{ transitionDelay: "80ms" }}>
            Pizza is universal.
            <br />
            <span className="text-cream/40">
              Ordering it shouldn&apos;t feel ancient.
            </span>
          </h2>
          <p className="reveal text-base md:text-lg text-cream/70 mb-5 leading-relaxed" style={{ transitionDelay: "160ms" }}>
            Most restaurants still operate like it&apos;s 1995. Paper menus,
            verbal orders, kitchen tickets, blind waits. Customers don&apos;t
            know what they&apos;re getting until it lands on the table.
          </p>
          <p className="reveal text-base md:text-lg text-cream/70 leading-relaxed" style={{ transitionDelay: "240ms" }}>
            We rebuilt the dining table from scratch. Pizza3.14 turns every
            seat into an interactive canvas — visualize, customize, track, and
            verify your meal in real time.
          </p>
        </div>

        {/* Right — animated layer-stack visualization */}
        <div className="relative aspect-square max-w-md mx-auto w-full">
          <div className="absolute inset-0 rounded-full bg-ember/15 blur-3xl" aria-hidden />
          <div className="relative w-full h-full">
            {/* Crust */}
            <div className="reveal-scale absolute inset-0 rounded-full overflow-hidden border-2 border-crust shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/pizza/bases/1.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden
                loading="lazy"
              />
            </div>
            {/* Sauce */}
            <div className="reveal-scale absolute inset-[8%] rounded-full overflow-hidden mix-blend-multiply opacity-90" style={{ transitionDelay: "100ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/pizza/sauces/tomatto.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden
                loading="lazy"
              />
            </div>
            {/* Cheese */}
            <div className="reveal-scale absolute inset-[14%] rounded-full overflow-hidden opacity-80" style={{ transitionDelay: "200ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/pizza/cheese/cheddar_cheese.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden
                loading="lazy"
              />
            </div>
            {/* Toppings */}
            <div className="reveal-scale absolute top-[30%] left-[28%] w-12 h-12 rounded-full overflow-hidden border-2 border-void" style={{ transitionDelay: "300ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/peperonis.jpg" alt="" className="w-full h-full object-cover" aria-hidden loading="lazy" />
            </div>
            <div className="reveal-scale absolute top-[55%] right-[25%] w-10 h-10 rounded-full overflow-hidden border-2 border-void" style={{ transitionDelay: "380ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/mushrooms.jpg" alt="" className="w-full h-full object-cover" aria-hidden loading="lazy" />
            </div>
            <div className="reveal-scale absolute top-[28%] right-[32%] w-9 h-9 rounded-full overflow-hidden border-2 border-void" style={{ transitionDelay: "440ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/olives.jpg" alt="" className="w-full h-full object-cover" aria-hidden loading="lazy" />
            </div>
            <div className="reveal-scale absolute bottom-[28%] left-[36%] w-11 h-11 rounded-full overflow-hidden border-2 border-void" style={{ transitionDelay: "500ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/capsicum.jpg" alt="" className="w-full h-full object-cover" aria-hidden loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
