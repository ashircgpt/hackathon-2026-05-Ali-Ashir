import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "pizza314",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
  });
}
