// Server-side SHA-256 using Node built-in crypto.
// This file is SERVER-ONLY. Do not import in Client Components.
// For browser use, see hash-browser.ts.
// TODO Milestone data layer: activate when building feedback ledger API.

// import crypto from "crypto";
//
// export function sha256(input: string): string {
//   return crypto.createHash("sha256").update(input, "utf8").digest("hex");
// }
//
// export function buildFeedbackBlock(
//   content: string,
//   prevHash: string,
// ): { contentHash: string; timestamp: string; blockHash: string } {
//   const contentHash = sha256(content);
//   const timestamp = new Date().toISOString();
//   const blockHash = sha256(prevHash + timestamp + contentHash);
//   return { contentHash, timestamp, blockHash };
// }

export {};
