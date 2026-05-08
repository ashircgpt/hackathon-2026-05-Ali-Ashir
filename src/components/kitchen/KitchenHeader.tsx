"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";

interface KitchenHeaderProps {
  counts: Record<OrderStatus, number>;
  todayTotal: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function liveClock() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function KitchenHeader({ counts, todayTotal }: KitchenHeaderProps) {
  const [time, setTime] = useState(liveClock());
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => setTime(liveClock()), 1000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const active = counts.NEW + counts.PREPARING + counts.BAKING;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-glass border-b border-ash shrink-0">
      {/* Left: brand */}
      <span className="font-bold text-ember tracking-tight">Pizza3.14 Kitchen</span>

      {/* Center: live counts */}
      <div className="flex items-center gap-6 text-xs font-mono">
        <span className="text-smoke">
          Active <span className="text-foreground font-bold ml-1">{active}</span>
        </span>
        <span className="text-smoke">
          Ready <span className="text-status-ready font-bold ml-1">{counts.READY}</span>
        </span>
        <span className="text-smoke">
          Served <span className="text-smoke font-bold ml-1">{counts.SERVED}</span>
        </span>
        <span className="text-smoke">
          Today <span className="text-foreground font-bold ml-1">{todayTotal}</span>
        </span>
      </div>

      {/* Right: clock + logout */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-smoke tabular-nums">{time}</span>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-ash text-smoke hover:border-ember hover:text-ember transition-colors focus:outline-none focus:ring-1 focus:ring-ember"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
