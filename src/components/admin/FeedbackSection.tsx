"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, ShieldCheck, ShieldX, Hash } from "lucide-react";
import { gsap } from "gsap";
import type { Feedback, ApiResponse } from "@/types";
import { verifyChain } from "@/lib/hash-browser";

interface FeedbackWithOrder extends Feedback {
  order?: { id: number; tableId: number };
}

type VerifyState = "idle" | "verifying" | "valid" | "tampered";

function truncHash(h: string) {
  if (h === "0") return "0 (genesis)";
  return h.length > 20 ? `${h.slice(0, 10)}…${h.slice(-8)}` : h;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FeedbackSection() {
  const [blocks, setBlocks] = useState<FeedbackWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [failedAt, setFailedAt] = useState<number | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then((r) => r.json())
      .then((res: ApiResponse<FeedbackWithOrder[]>) => {
        if (res.success) setBlocks(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    blockRefs.current = blockRefs.current.slice(0, blocks.length);
  }, [blocks.length]);

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
    };
  }, []);

  async function handleVerify() {
    if (verifyState === "verifying" || blocks.length === 0) return;
    setVerifyState("verifying");
    setFailedAt(null);

    blockRefs.current.forEach((el) => {
      if (el) gsap.set(el, { borderColor: "hsl(240 5% 25%)" });
    });

    const { valid, failedAt: fi } = await verifyChain(blocks);

    const tl = gsap.timeline({
      onComplete: () => {
        setVerifyState(valid ? "valid" : "tampered");
        setFailedAt(fi);
      },
    });
    tlRef.current = tl;

    blocks.forEach((_, i) => {
      const el = blockRefs.current[i];
      if (!el) return;
      const isBad = !valid && fi !== null && i >= fi;
      tl.to(
        el,
        {
          borderColor: isBad ? "hsl(0 70% 52%)" : "hsl(142 70% 42%)",
          boxShadow: isBad
            ? "0 0 12px hsl(0 70% 52% / 0.25)"
            : "0 0 12px hsl(142 70% 42% / 0.25)",
          duration: 0.22,
          ease: "power2.out",
        },
        i * 0.12,
      );
    });
  }

  const VerifyIcon =
    verifyState === "valid"
      ? ShieldCheck
      : verifyState === "tampered"
        ? ShieldX
        : Shield;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-cheese mb-2">
            Integrity Ledger
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Chain</h1>
          <p className="text-sm text-smoke mt-1">
            {loading
              ? "Loading blocks…"
              : `${blocks.length} block${blocks.length !== 1 ? "s" : ""} on chain · SHA-256 secured`}
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={verifyState === "verifying" || blocks.length === 0 || loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all
            focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-void
            ${verifyState === "verifying"
              ? "bg-ash text-smoke cursor-not-allowed"
              : blocks.length === 0
                ? "bg-ash/50 text-smoke/50 cursor-not-allowed"
                : "bg-ember text-void hover:bg-ember/90 active:scale-95 cursor-pointer"
            }`}
        >
          <VerifyIcon className="w-4 h-4" />
          {verifyState === "verifying" ? "Verifying…" : "Verify Chain"}
        </button>
      </div>

      {/* Result Banner */}
      {(verifyState === "valid" || verifyState === "tampered") && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 border text-sm font-mono
            ${verifyState === "valid"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
        >
          <VerifyIcon className="w-4 h-4 shrink-0" />
          {verifyState === "valid"
            ? `✓ CHAIN VALID — all ${blocks.length} blocks verified`
            : `✗ TAMPERED — chain broken at Block #${(failedAt ?? 0) + 1}`}
        </div>
      )}

      {/* Blocks */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-glass border border-ash animate-pulse"
            />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <div className="py-24 text-center bg-glass border border-ash rounded-2xl">
          <Hash className="w-9 h-9 text-smoke mx-auto mb-3 opacity-50" />
          <p className="text-smoke text-sm font-medium">No feedback submitted yet.</p>
          <p className="text-smoke/50 text-xs mt-1.5">
            Blocks appear once customers leave feedback on served orders.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, i) => (
            <div
              key={block.id}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className="feedback-block bg-glass border border-ash rounded-2xl p-5 transition-[box-shadow] duration-300"
              style={{ borderColor: "hsl(240 5% 25%)" }}
            >
              {/* Block meta */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cheese font-bold">
                  Block #{i + 1}
                </span>
                <span className="text-[10px] font-mono text-smoke/40">·</span>
                <span className="text-[10px] font-mono text-smoke">Order #{block.orderId}</span>
                {block.order && (
                  <>
                    <span className="text-[10px] font-mono text-smoke/40">·</span>
                    <span className="text-[10px] font-mono text-smoke">T-{block.order.tableId}</span>
                  </>
                )}
                <span className="ml-auto text-[10px] font-mono text-smoke">
                  {fmtDate(block.timestamp)}
                </span>
              </div>

              {/* Feedback content */}
              <p className="text-sm text-cream/80 italic leading-relaxed mb-4 pl-3 border-l-2 border-ember/40">
                &ldquo;{block.content}&rdquo;
              </p>

              {/* Hash grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: "prevHash", value: block.prevHash },
                  { label: "contentHash", value: block.contentHash },
                  { label: "blockHash", value: block.blockHash },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-void/60 rounded-lg px-3 py-2.5">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-smoke mb-1.5">
                      {label}
                    </p>
                    <p className="text-[10px] font-mono text-ember/80 break-all leading-relaxed">
                      {truncHash(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
