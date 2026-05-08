"use client";

import { useState } from "react";
import type { ApiResponse, Feedback } from "@/types";

interface Props {
  orderId: number;
  onStartNewOrder: () => void;
}

export default function FeedbackForm({ orderId, onStartNewOrder }: Props) {
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
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-mono mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Feedback recorded on-chain
        </div>
        <p className="text-xs text-cream/50 mb-5">
          Your review is part of the Pizza3.14 ledger forever.
        </p>
        <button
          onClick={onStartNewOrder}
          className="px-6 py-2 rounded-full border border-ember text-ember text-sm font-semibold hover:bg-ember hover:text-void transition-all"
        >
          Start New Order →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-cream/70 mb-1">
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
        onChange={(e) => { setContent(e.target.value); setError(null); }}
        disabled={loading}
        placeholder="Share your thoughts..."
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
          className="flex-1 py-2.5 rounded-xl bg-ember text-void text-sm font-bold hover:bg-cheese transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting…" : "Submit Feedback"}
        </button>
        <button
          onClick={onStartNewOrder}
          className="px-4 py-2.5 rounded-xl border border-ash text-smoke text-sm hover:border-cream/40 hover:text-cream transition-colors"
        >
          Skip →
        </button>
      </div>
    </div>
  );
}
