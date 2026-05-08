"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".story-reveal", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
      });
      gsap.utils.toArray<HTMLElement>(".story-stack-layer").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            delay: i * 0.18,
            scrollTrigger: { trigger: sectionRef.current, start: "top 60%", once: true },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
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
          <p className="story-reveal text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
            01 — THE VISION
          </p>
          <h2 className="story-reveal text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-tight">
            Pizza is universal.
            <br />
            <span className="text-cream/40">
              Ordering it shouldn&apos;t feel ancient.
            </span>
          </h2>
          <p className="story-reveal text-base md:text-lg text-cream/70 mb-5 leading-relaxed">
            Most restaurants still operate like it&apos;s 1995. Paper menus,
            verbal orders, kitchen tickets, blind waits. Customers don&apos;t
            know what they&apos;re getting until it lands on the table.
          </p>
          <p className="story-reveal text-base md:text-lg text-cream/70 leading-relaxed">
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
            <div className="story-stack-layer absolute inset-0 rounded-full overflow-hidden border-2 border-crust shadow-2xl">
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
            <div className="story-stack-layer absolute inset-[8%] rounded-full overflow-hidden mix-blend-multiply opacity-90">
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
            <div className="story-stack-layer absolute inset-[14%] rounded-full overflow-hidden opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/pizza/cheese/cheddar_cheese.jpg"
                alt=""
                className="w-full h-full object-cover"
                aria-hidden
                loading="lazy"
              />
            </div>
            {/* Toppings sprinkled */}
            <div className="story-stack-layer absolute top-[30%] left-[28%] w-12 h-12 rounded-full overflow-hidden border-2 border-void">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/peperonis.jpg" alt="" className="w-full h-full object-cover" aria-hidden />
            </div>
            <div className="story-stack-layer absolute top-[55%] right-[25%] w-10 h-10 rounded-full overflow-hidden border-2 border-void">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/mushrooms.jpg" alt="" className="w-full h-full object-cover" aria-hidden />
            </div>
            <div className="story-stack-layer absolute top-[28%] right-[32%] w-9 h-9 rounded-full overflow-hidden border-2 border-void">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/olives.jpg" alt="" className="w-full h-full object-cover" aria-hidden />
            </div>
            <div className="story-stack-layer absolute bottom-[28%] left-[36%] w-11 h-11 rounded-full overflow-hidden border-2 border-void">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/pizza/toppings/capsicum.jpg" alt="" className="w-full h-full object-cover" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
