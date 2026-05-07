// Server-side SHA-256 using Node built-in crypto.
// SERVER-ONLY — do not import in Client Components or browser code.
// For browser chain verification, see hash-browser.ts.

import crypto from "crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

export function buildFeedbackBlock(
  content: string,
  prevHash: string,
): { contentHash: string; timestamp: string; blockHash: string } {
  const contentHash = sha256(content);
  const timestamp = new Date().toISOString();
  const blockHash = sha256(prevHash + timestamp + contentHash);
  return { contentHash, timestamp, blockHash };
}
