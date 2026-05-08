// Browser-side SHA-256 using Web Crypto API (async).
// CLIENT-ONLY — do not import in API routes or server code.
// Produces identical hex output to hash.ts for the same input.

import type { Feedback } from "@/types";

export async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyChain(
  blocks: Feedback[],
): Promise<{ valid: boolean; failedAt: number | null }> {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const expectedPrev = i === 0 ? "0" : blocks[i - 1].blockHash;
    if (b.prevHash !== expectedPrev) return { valid: false, failedAt: i };
    const expected = await sha256(b.prevHash + b.timestamp + b.contentHash);
    if (b.blockHash !== expected) return { valid: false, failedAt: i };
  }
  return { valid: true, failedAt: null };
}
