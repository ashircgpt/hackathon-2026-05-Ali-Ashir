"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, trackEvent } from "@/lib/posthog";

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    trackEvent("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
