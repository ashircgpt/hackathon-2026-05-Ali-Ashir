"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const FLOATING_INGREDIENTS = [
  { src: "/assets/pizza/toppings/peperonis.jpg",   pos: "top-24 left-[8%]",          size: "w-14 h-14", opacity: "opacity-30" },
  { src: "/assets/pizza/toppings/mushrooms.jpg",   pos: "top-1/3 left-[18%]",        size: "w-10 h-10", opacity: "opacity-25" },
  { src: "/assets/pizza/toppings/olives.jpg",      pos: "bottom-24 left-[12%]",      size: "w-9 h-9",   opacity: "opacity-30" },
  { src: "/assets/pizza/toppings/capsicum.jpg",    pos: "bottom-1/3 left-[28%]",     size: "w-12 h-12", opacity: "opacity-25" },
  { src: "/assets/pizza/toppings/jalapenos.jpg",   pos: "top-[18%] right-[12%]",     size: "w-10 h-10", opacity: "opacity-25" },
  { src: "/assets/pizza/toppings/onions.jpg",      pos: "top-1/2 right-[22%]",       size: "w-8 h-8",   opacity: "opacity-30" },
  { src: "/assets/pizza/toppings/chicken_chunks.jpg", pos: "bottom-32 right-[8%]",   size: "w-12 h-12", opacity: "opacity-25" },
];

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-line",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.18, ease: "power3.out", delay: 0.2 },
      );
      gsap.fromTo(
        ".hero-pizza-wrap",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.6, ease: "power3.out", delay: 0.1 },
      );
      gsap.to(".hero-pizza-img", {
        rotation: 360,
        duration: 70,
        repeat: -1,
        ease: "none",
      });
      gsap.to(".hero-glow", {
        scale: 1.1,
        opacity: 0.55,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.utils.toArray<HTMLElement>(".float-ingredient").forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 === 0 ? "+=22" : "-=18",
          rotation: i % 2 === 0 ? 14 : -14,
          duration: 3 + (i % 4) * 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.15,
        });
      });
      gsap.to(".scroll-cue", {
        y: 8,
        duration: 1.3,
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Warm pizza-radial backdrop */}
      <div className="absolute inset-0 bg-pizza-radial pointer-events-none" />

      {/* Floating decorative ingredients */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_INGREDIENTS.map((ing, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={ing.src}
            alt=""
            className={`float-ingredient absolute ${ing.pos} ${ing.size} ${ing.opacity} rounded-full object-cover blur-[1px]`}
            aria-hidden
          />
        ))}
      </div>

      {/* Hero pizza disc — large, bleeding off the right edge */}
      <div className="hero-pizza-wrap absolute -right-[180px] md:-right-[140px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] md:w-[640px] md:h-[640px] hidden md:block pointer-events-none">
        <div className="hero-glow absolute inset-0 rounded-full bg-ember/40 blur-3xl opacity-40" />
        <div className="hero-pizza-img relative w-full h-full rounded-full overflow-hidden border-2 border-ember/30 opacity-70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/pizza/bases/1.jpg"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden
          />
        </div>
      </div>

      {/* Hero text — left aligned on desktop, centered on mobile */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left">
          <p className="hero-line text-[10px] md:text-xs font-mono uppercase tracking-[0.35em] text-cheese mb-6">
            ▸ THE FUTURE OF DINING
          </p>
          <h1 className="hero-line text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]">
            Welcome to
            <br />
            <span className="text-gradient-pizza">
              Pizza 3.14
              <span className="font-serif italic">π</span>
            </span>
          </h1>
          <p className="hero-line text-base md:text-lg text-cream/70 max-w-xl mb-10 leading-relaxed mx-auto md:mx-0">
            Where tradition meets technology. An interactive dining experience
            that turns ordering pizza into an immersive ritual — built for the
            modern table.
          </p>
          <div className="hero-line flex items-center gap-3 justify-center md:justify-start flex-wrap">
            <a
              href="#story"
              className="text-sm font-bold px-6 py-3 rounded-full bg-ember text-void hover:bg-cheese transition-all focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void"
            >
              Discover the Story →
            </a>
            <a
              href="/table/1"
              className="text-sm font-semibold px-6 py-3 rounded-full border border-ash text-cream/70 hover:border-ember hover:text-ember transition-colors"
            >
              Skip to Building
            </a>
          </div>
        </div>
        <div /> {/* visual right side intentionally empty — pizza is absolute */}
      </div>

      {/* Scroll cue */}
      <div className="scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/50">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">
          Scroll to explore
        </span>
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
