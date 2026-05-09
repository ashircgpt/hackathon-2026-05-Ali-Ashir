"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingBag, DollarSign, Activity } from "lucide-react";
import type { MenuItem, OrderStatus, ApiResponse } from "@/types";
import { getSocket, disconnectSocket } from "@/lib/socket-client";

interface StatsData {
  totalOrders: number;
  activeOrders: number;
  servedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  verifiedFeedbackCount: number;
  ordersByStatus: Record<string, number>;
  hourlyBreakdown: { hour: number; count: number; revenue: number }[];
  topCombo: { ingredients: MenuItem[]; count: number } | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW:       "hsl(260 70% 65%)",
  PREPARING: "hsl(200 85% 55%)",
  BAKING:    "hsl(38 95% 55%)",
  READY:     "hsl(142 70% 45%)",
  SERVED:    "hsl(240 5% 40%)",
};

function useCountUp(target: number) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let cur = 0;
    const step = target / 40;
    const id = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.round(cur));
      if (cur >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target]);
  return val;
}

function StatCard({
  label,
  value,
  prefix = "",
  icon: Icon,
  live = false,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: React.ElementType;
  live?: boolean;
}) {
  const display = useCountUp(value);
  return (
    <div className="bg-glass border border-ash rounded-2xl p-5 hover:border-ember/40 transition-all">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-mono uppercase tracking-widest text-smoke">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-ember/10 flex items-center justify-center text-ember">
          <Icon className="w-4 h-4" aria-hidden />
        </div>
      </div>
      <p className="text-3xl font-bold text-cream font-mono">
        {prefix}{display.toLocaleString()}
      </p>
      {live && (
        <p className="text-xs text-smoke mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-status-ready animate-pulse inline-block" />
          live
        </p>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-glass border border-ash rounded-xl px-3 py-2 text-xs font-mono text-cream shadow-lg">
      <p className="text-smoke mb-1">{label}:00</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name === "revenue" ? `$${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function OverviewSection() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Track last socket-triggered refresh so rapid events don't spam the API
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchStats() {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then((res: ApiResponse<StatsData>) => {
        if (res.success) {
          setStats(res.data);
          setFetchError(null);
        } else {
          setFetchError((res as { message?: string }).message ?? "Stats unavailable");
        }
      })
      .catch((e: Error) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }

  // Debounced refresh — waits 500 ms after the last socket event before hitting the API
  function scheduleRefresh() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(fetchStats, 500);
  }

  // Initial fetch + 15-second polling fallback
  useEffect(() => {
    fetchStats();
    const pollId = setInterval(fetchStats, 15_000);
    return () => clearInterval(pollId);
  }, []);

  // Socket.io — instant refresh when any order is created or advanced
  useEffect(() => {
    const socket = getSocket();

    function joinAdmin() {
      socket.emit("join-admin");
    }

    joinAdmin();
    socket.on("connect", joinAdmin);
    socket.on("order-new", scheduleRefresh);
    socket.on("order-advance", scheduleRefresh);

    return () => {
      socket.off("connect", joinAdmin);
      socket.off("order-new", scheduleRefresh);
      socket.off("order-advance", scheduleRefresh);
      disconnectSocket();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avgOrder =
    stats && stats.todayOrders > 0
      ? Math.round(stats.todayRevenue / stats.todayOrders)
      : 0;

  const donutData = stats
    ? Object.entries(stats.ordersByStatus)
        .filter(([, v]) => v > 0)
        .map(([status, value]) => ({ name: status, value }))
    : [];

  const hourlyData = stats?.hourlyBreakdown ?? [];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
          Restaurant Intelligence
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-smoke mt-1">
          Live snapshot of today&apos;s operations.
        </p>
      </div>

      {fetchError && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          Could not load stats: {fetchError}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-glass border border-ash animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Today's Orders" value={stats?.todayOrders ?? 0} icon={ShoppingBag} />
            <StatCard label="Today's Revenue" value={stats?.todayRevenue ?? 0} prefix="$" icon={DollarSign} />
            <StatCard label="Avg Order Value" value={avgOrder} prefix="$" icon={TrendingUp} />
            <StatCard label="Active Now" value={stats?.activeOrders ?? 0} icon={Activity} live />
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Orders Area Chart */}
            <div className="bg-glass border border-ash rounded-2xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-4">
                Orders by Hour
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={hourlyData} margin={{ left: -20, right: 8 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(24 95% 53%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(24 95% 53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="orders" stroke="hsl(24 95% 53%)" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Bar Chart */}
            <div className="bg-glass border border-ash rounded-2xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-4">
                Revenue by Hour ($)
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourlyData} margin={{ left: -20, right: 8 }}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="revenue" fill="hsl(24 95% 53%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Famous Combo */}
            <div className="bg-glass border border-l-[3px] border-ember rounded-2xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-1">🔥 Most Famous Combo</p>
              {stats?.topCombo ? (
                <>
                  <p className="text-xs text-cheese mb-3">
                    Ordered {stats.topCombo.count}× today
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.topCombo.ingredients.map((ing) => (
                      <div key={ing.id} className="flex items-center gap-2 bg-void/50 rounded-lg px-2 py-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ing.imageUrl}
                          alt={ing.name}
                          className="w-6 h-6 rounded-full object-cover border border-ash"
                        />
                        <span className="text-xs text-cream/80">{ing.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-smoke mt-3">No SERVED orders yet.</p>
              )}
            </div>

            {/* Status Donut */}
            <div className="bg-glass border border-ash rounded-2xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke mb-2">
                Orders by Status
              </p>
              {donutData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={donutData} innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name as OrderStatus] ?? "#888"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n) => [v, n]}
                        contentStyle={{ background: "hsl(240 8% 7%)", border: "1px solid hsl(240 5% 25%)", borderRadius: 12, fontSize: 11, fontFamily: "monospace" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {donutData.map((d) => (
                      <span key={d.name} className="flex items-center gap-1 text-[10px] font-mono text-smoke">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: STATUS_COLORS[d.name] }} />
                        {d.name} {d.value}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-smoke mt-4">No orders today.</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-glass border border-ash rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-smoke">At a Glance</p>
              {[
                { label: "Total Orders All Time", value: stats?.totalOrders ?? 0 },
                { label: "Total Revenue All Time", value: stats?.totalRevenue ?? 0, prefix: "$" },
                { label: "Feedback Entries", value: stats?.verifiedFeedbackCount ?? 0 },
                { label: "Orders Served Today", value: stats?.servedOrders ?? 0 },
              ].map(({ label, value, prefix = "" }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-smoke">{label}</span>
                  <span className="font-mono text-sm text-cream">{prefix}{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
