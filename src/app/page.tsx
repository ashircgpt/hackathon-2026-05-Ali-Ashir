import Link from "next/link";
import { Pizza, Zap, ChefHat, MessageSquare, Star, FlaskConical } from "lucide-react";

const FEATURES = [
  {
    icon: Pizza,
    title: "Interactive Builder",
    desc: "Drag transparent PNG layers onto a live canvas. See your pizza come together in real time.",
    border: "border-orange-500/20",
    iconColor: "text-orange-400",
    bg: "bg-orange-500/5",
  },
  {
    icon: Zap,
    title: "Live Nutrition",
    desc: "Calories, protein, fat, and carbs update instantly as you add or remove ingredients.",
    border: "border-yellow-500/20",
    iconColor: "text-yellow-400",
    bg: "bg-yellow-500/5",
  },
  {
    icon: ChefHat,
    title: "Kitchen Kanban",
    desc: "Real-time order board for kitchen staff. Orders flow from NEW → PREPARING → READY → SERVED.",
    border: "border-green-500/20",
    iconColor: "text-green-400",
    bg: "bg-green-500/5",
  },
  {
    icon: MessageSquare,
    title: "Feedback Ledger",
    desc: "Post-meal ratings are stored in an append-only blockchain ledger — tamper-evident by design.",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    bg: "bg-blue-500/5",
  },
  {
    icon: Star,
    title: "Famous Combos",
    desc: "Admin dashboard surfaces the most-ordered ingredient combinations across all orders.",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
    bg: "bg-purple-500/5",
  },
  {
    icon: FlaskConical,
    title: "Hackathon Demo",
    desc: "Built in one sprint. Synthetic data only. No real payments, no real kitchens.",
    border: "border-primary/20",
    iconColor: "text-primary",
    bg: "bg-primary/5",
    cta: true,
  },
];

const FLOW_STEPS = [
  { n: "01", title: "Build",    desc: "Drag ingredients onto the pizza canvas"  },
  { n: "02", title: "Order",    desc: "Place order with one tap — no account needed" },
  { n: "03", title: "Kitchen",  desc: "Chef sees a live Kanban card appear"     },
  { n: "04", title: "Served",   desc: "Status flips to SERVED via SSE push"     },
  { n: "05", title: "Feedback", desc: "Customer rates 1–5 stars"                },
  { n: "06", title: "Verified", desc: "Hash chain confirms the ledger is intact" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Fixed nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Pizza className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <span className="font-bold text-sm tracking-tight">Pizza3.14</span>
          </div>
          <Link
            href="/table/1"
            className="text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start Ordering
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-gradient min-h-screen flex flex-col items-center justify-center text-center px-6 pt-14">

        {/* Background blob */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"
          aria-hidden
        />

        {/* Animated pizza disc */}
        <div className="relative w-44 h-44 rounded-full pizza-base-disc border-2 border-primary/30 glow-ring-md animate-float mb-8 flex items-center justify-center">
          {/* Spinning dashed inner ring */}
          <div
            className="absolute inset-4 rounded-full border-dashed border-primary/20 animate-spin-slow"
            aria-hidden
          />
          <Pizza className="h-12 w-12 text-primary/70 relative z-10" aria-hidden />

          {/* Orbiting dot 1 */}
          <div
            className="absolute w-3 h-3 rounded-full bg-orange-400/80 animate-spin-slow"
            style={{ transformOrigin: "88px 88px", transform: "translateX(60px)" }}
            aria-hidden
          />
          {/* Orbiting dot 2 */}
          <div
            className="absolute w-2 h-2 rounded-full bg-yellow-400/60 animate-spin-slow"
            style={{ transformOrigin: "88px 88px", transform: "translateX(-52px) translateY(-20px)", animationDelay: "-9s" }}
            aria-hidden
          />
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 mb-6 text-[11px] font-mono uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden />
          Hackathon Demo — Table 1 is live
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 max-w-2xl leading-tight">
          Build your perfect pizza,{" "}
          <span className="text-primary">layer by layer</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
          An interactive tabletop ordering experience. Drag ingredients, track nutrition,
          and watch your order move through the kitchen in real time.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/table/1"
            className="font-semibold px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors glow-primary"
          >
            Build a Pizza →
          </Link>
          <Link
            href="/kitchen"
            className="font-semibold px-6 py-3 rounded-full border border-border hover:border-primary/40 hover:bg-accent transition-colors text-sm"
          >
            Kitchen View
          </Link>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-10">
          What&apos;s inside
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, border, iconColor, bg, cta }) => (
            <div
              key={title}
              className={`relative rounded-xl border ${border} ${bg} p-5 hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-9 h-9 rounded-lg bg-background/60 flex items-center justify-center mb-3 ${iconColor}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              {cta && (
                <Link
                  href="/table/1"
                  className="mt-3 inline-block text-[11px] font-semibold text-primary hover:underline"
                >
                  Try it now →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo flow ── */}
      <section className="max-w-lg mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">
          How it works
        </h2>
        <div className="relative flex flex-col gap-0">
          {/* Vertical connector line */}
          <div
            className="absolute left-5 top-5 bottom-5 w-px bg-border/40"
            aria-hidden
          />
          {FLOW_STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex items-start gap-4 pb-8 last:pb-0 relative">
              <div className="shrink-0 w-10 h-10 rounded-full bg-card border border-border/60 flex items-center justify-center font-mono text-[10px] text-primary z-10">
                {n}
              </div>
              <div className="pt-2">
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pizza className="h-4 w-4 text-primary/60" aria-hidden />
            <span className="text-sm font-bold text-muted-foreground">Pizza3.14</span>
          </div>
          <p className="text-[11px] text-muted-foreground/50 font-mono">
            Hackathon demo. Synthetic data only.
          </p>
        </div>
      </footer>
    </div>
  );
}
