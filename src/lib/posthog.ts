import posthog from "posthog-js";

let initialised = false;

export function initPostHog() {
  if (initialised) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: false, // manual via usePageView
    capture_pageleave: true,
    persistence: "localStorage",
  });
  initialised = true;
}

export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.capture(event, props);
}
