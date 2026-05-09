"use client";

import { useState } from "react";
import type { ApiResponse, Feedback } from "@/types";

interface Props {
  orderId: number;
  onSubmitted: () => void;
  onSkip: () => void;
}

export default function FeedbackForm({ orderId, onSubmitted, onSkip }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, content: content.trim() }),
      });
      const data: ApiResponse<Feedback> = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTimeout(onSubmitted, 2000);
      } else {
        setError(data.message ?? "Failed to submit — please try again.");
      }
    } catch {
      setError("Network error — please retry.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-mono mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
          Feedback recorded on-chain
        </div>
        <p className="text-xs text-cream/50">
          Your review is part of the Pizza3.14 ledger forever.
        </p>
        <p className="text-[10px] text-smoke font-mono mt-3">
          Returning to home…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm text-cream/80 mb-1 font-medium">
        Enjoyed your pizza?
      </p>
      <p className="text-xs text-smoke mb-4">
        Leave a review — it&apos;s permanently recorded on the blockchain.
      </p>

      <label
        htmlFor="feedback-content"
        className="block text-[10px] font-mono uppercase tracking-widest text-smoke mb-2"
      >
        Your feedback
      </label>
      <textarea
        id="feedback-content"
        rows={3}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setError(null);
        }}
        disabled={loading}
        placeholder="Share your thoughts…"
        className="w-full bg-void/60 border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder-smoke/50 resize-none focus:outline-none focus:border-ember/60 transition-colors disabled:opacity-50"
      />

      {error && (
        <p className="text-xs text-red-400 mt-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={submit}
          disabled={content.trim().length === 0 || loading}
          className="flex-1 py-2.5 rounded-xl bg-ember text-void text-sm font-bold hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ember/50"
        >
          {loading ? "Submitting…" : "Submit Feedback"}
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2.5 rounded-xl border border-ash text-smoke text-sm hover:border-cream/40 hover:text-cream transition-colors focus:outline-none focus:ring-1 focus:ring-cream/30"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
