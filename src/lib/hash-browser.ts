// Browser-side SHA-256 using Web Crypto API (async).
// This file is CLIENT-ONLY. Do not import in API routes or server code.
// For server use, see hash.ts.
// Must produce identical hex output to hash.ts for the same input.
// TODO Milestone admin UI: activate when building ChainVerifier component.

// export async function sha256(input: string): Promise<string> {
//   const encoded = new TextEncoder().encode(input);
//   const buffer = await crypto.subtle.digest("SHA-256", encoded);
//   return Array.from(new Uint8Array(buffer))
//     .map((b) => b.toString(16).padStart(2, "0"))
//     .join("");
// }
//
// export async function verifyChain(
//   blocks: import("@/types").Feedback[],
// ): Promise<boolean> {
//   for (let i = 0; i < blocks.length; i++) {
//     const b = blocks[i];
//     const expectedPrev = i === 0 ? "0" : blocks[i - 1].blockHash;
//     if (b.prevHash !== expectedPrev) return false;
//     const expected = await sha256(b.prevHash + b.timestamp + b.contentHash);
//     if (b.blockHash !== expected) return false;
//   }
//   return true;
// }

export {};
