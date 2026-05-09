"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-sm font-mono text-red-400 uppercase tracking-widest">
            Something went wrong
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
