"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ChefHat, Settings2 } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const from = searchParams.get("from") ?? "/admin";
  const isKitchen = from.startsWith("/kitchen");
  const role = isKitchen ? "kitchen" : "admin";

  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passphrase.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: passphrase.trim(), role }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(from);
      } else {
        setError(data.message ?? "Invalid passphrase.");
      }
    } catch {
      setError("Network error — please retry.");
    } finally {
      setLoading(false);
    }
  }

  const RoleIcon = isKitchen ? ChefHat : Settings2;
  const accentClass = isKitchen ? "text-cheese" : "text-ember";
  const borderActive = isKitchen
    ? "focus:border-cheese focus:ring-cheese/20"
    : "focus:border-ember focus:ring-ember/20";
  const btnClass = isKitchen
    ? "bg-cheese hover:bg-amber-300 text-void"
    : "bg-ember hover:bg-cheese text-void";

  return (
    <div className="min-h-screen bg-void text-cream flex flex-col items-center justify-center px-4">
      {/* Brand */}
      <div className="mb-10 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-smoke mb-3">
          Pizza3.14π — Staff Access
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Pizza{" "}
          <span className="font-serif italic text-gradient-pizza">3.14π</span>
        </h1>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-glass border border-ash rounded-2xl p-8 shadow-2xl">
        {/* Role header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isKitchen ? "bg-cheese/15" : "bg-ember/15"}`}>
            <RoleIcon className={`w-5 h-5 ${accentClass}`} aria-hidden />
          </div>
          <div>
            <p className={`text-[10px] font-mono uppercase tracking-widest ${accentClass}`}>
              {isKitchen ? "Kitchen" : "Admin"} Access
            </p>
            <p className="text-sm text-cream/60">Enter your passphrase</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="passphrase"
              className="block text-xs font-mono uppercase tracking-widest text-smoke mb-2"
            >
              <Lock className="inline w-3 h-3 mr-1.5 -mt-0.5" aria-hidden />
              Passphrase
            </label>
            <input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError(null);
              }}
              placeholder="Enter demo passphrase"
              autoComplete="current-password"
              required
              className={`w-full bg-void border border-ash rounded-xl px-4 py-3 text-cream text-sm placeholder:text-smoke/50 outline-none transition-all focus:ring-2 ${borderActive} ${error ? "border-red-500" : ""}`}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !passphrase.trim()}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${btnClass}`}
          >
            {loading
              ? "Verifying…"
              : `Enter ${isKitchen ? "Kitchen" : "Admin"} →`}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-cream/30 font-mono">
          Demo credentials only — not for production.
        </p>
      </div>

      {/* Switch role hint */}
      <p className="mt-6 text-xs text-smoke">
        Need{" "}
        <a
          href={`/login?from=${isKitchen ? "/admin" : "/kitchen"}`}
          className={`underline underline-offset-2 ${accentClass} hover:opacity-80`}
        >
          {isKitchen ? "admin" : "kitchen"} access
        </a>{" "}
        instead?
      </p>
    </div>
  );
}
