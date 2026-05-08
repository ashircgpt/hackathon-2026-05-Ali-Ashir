"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

const ORBIT_ITEMS = [
  { src: "/assets/pizza/toppings/peperonis.jpg",   alt: "Pepperoni"  },
  { src: "/assets/pizza/toppings/mushrooms.jpg",   alt: "Mushrooms"  },
  { src: "/assets/pizza/toppings/capsicum.jpg",    alt: "Capsicum"   },
  { src: "/assets/pizza/toppings/olives.jpg",      alt: "Olives"     },
  { src: "/assets/pizza/sauces/bbq.jpg",           alt: "BBQ Sauce"  },
  { src: "/assets/pizza/cheese/mozzarella.jpg",    alt: "Mozzarella" },
];

const SIZE   = 520;  // outer wrapper px
const RADIUS = 210;  // orbit radius from center

export default function IngredientOrbitRing() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgCircleRef = useRef<SVGCircleElement>(null);
  const router = useRouter();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const circle = svgCircleRef.current;
    if (!wrapper || !circle) return;

    // Items start invisible (load sequence in AttractScreen controls them)
    gsap.set(wrapper.querySelectorAll(".orbit-item"), { scale: 0, opacity: 0 });

    // Continuous orbit rotation (starts after load sequence at 2s)
    const orbitTween = gsap.delayedCall(2, () => {
      gsap.to(wrapper, {
        rotation: 360,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    });

    return () => {
      orbitTween.kill();
      gsap.killTweensOf(wrapper);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="absolute"
      style={{ width: SIZE, height: SIZE, top: "50%", left: "50%", marginTop: -SIZE / 2, marginLeft: -SIZE / 2 }}
      onClick={() => router.push("/table/1")}
      role="button"
      aria-label="Start building your pizza"
    >
      {/* Dashed orbit guide circle */}
      <svg
        width={SIZE}
        height={SIZE}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <circle
          ref={svgCircleRef}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="hsl(240 5% 25%)"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
      </svg>

      {/* Ingredient images */}
      {ORBIT_ITEMS.map((item, i) => {
        const angleDeg = i * 60 - 90; // start from top
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = SIZE / 2 + RADIUS * Math.cos(angleRad) - 32;
        const y = SIZE / 2 + RADIUS * Math.sin(angleRad) - 32;
        return (
          <div
            key={item.alt}
            className="orbit-item absolute w-16 h-16 rounded-full overflow-hidden border border-ash shadow-lg cursor-pointer"
            style={{ left: x, top: y }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
