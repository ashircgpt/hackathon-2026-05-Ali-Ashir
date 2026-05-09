"use client";

import { useState } from "react";
import type { ApiResponse, Feedback } from "@/types";

interface Props {
  orderId: number;
  onSubmitted: () => void;
  onSkip: () => void;
}

const RATING_LABELS = ["", "Bad", "Meh", "Okay", "Good", "Amazing"];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="32"
      height="32"
      className={`transition-colors ${filled ? "text-cheese" : "text-ash"}`}
      aria-hidden
    >
      <path d="M12 2.5l3.09 6.26 6.91 1.01-5 4.87 1.18 6.86L12 18.27l-6.18 3.23L7 14.64l-5-4.87 6.91-1.01L12 2.5z" />
    </svg>
  );
}

export default function FeedbackForm({ orderId, onSubmitted, onSkip }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const display = hovered || rating;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      // Encode rating as a stars-prefix on the content text since the backend
      // ledger only persists a single content string. Reviewers read it
      // back as part of the feedback row.
      const stars =
        rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "";
      const body =
        rating > 0
          ? `${stars} (${rating}/5)\n${content.trim()}`
          : content.trim();

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, content: body }),
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

  const canSubmit =
    !loading && (rating > 0 || content.trim().length > 0);

  return (
    <div className="w-full">
      <p className="text-sm text-cream/85 mb-1 font-medium">
        Enjoyed your pizza?
      </p>
      <p className="text-xs text-smoke mb-4">
        Rate it and leave a review — permanently recorded on the blockchain.
      </p>

      {/* Star rating */}
      <div className="flex flex-col items-center gap-1 mb-4">
        <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}${RATING_LABELS[n] ? ` — ${RATING_LABELS[n]}` : ""}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              disabled={loading}
              className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-50"
            >
              <StarIcon filled={n <= display} />
            </button>
          ))}
        </div>
        <p className="text-[11px] font-mono uppercase tracking-widest text-cheese h-4">
          {display > 0 ? RATING_LABELS[display] : "Tap a star"}
        </p>
      </div>

      <label
        htmlFor="feedback-content"
        className="block text-[10px] font-mono uppercase tracking-widest text-smoke mb-2"
      >
        Your feedback (optional)
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
        placeholder="Share what you loved (or didn't)…"
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
          disabled={!canSubmit}
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
