"use client";

import { useState, useEffect } from "react";

interface UrgencyBarProps {
  createdAt: string | Date;
}

export default function UrgencyBar({ createdAt }: UrgencyBarProps) {
  const [width, setWidth] = useState("0%");

  useEffect(() => {
    const minutes = (Date.now() - new Date(createdAt).getTime()) / 60_000;
    const pct = Math.min((minutes / 15) * 100, 100);
    // Trigger CSS transition by setting width after mount
    const id = requestAnimationFrame(() => setWidth(`${pct}%`));
    return () => cancelAnimationFrame(id);
  }, [createdAt]);

  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60_000;
  const colorClass =
    minutes < 5
      ? "bg-status-ready"
      : minutes < 10
      ? "bg-status-baking"
      : "bg-red-500 animate-pulse";

  return (
    <div className="h-[3px] w-full rounded-full bg-glass my-2" role="progressbar" aria-label="Order urgency">
      <div
        className={`h-full rounded-full transition-[width] duration-1000 ${colorClass}`}
        style={{ width }}
      />
    </div>
  );
}
