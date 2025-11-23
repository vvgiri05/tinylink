// app/healthz/route.ts
import { NextResponse } from "next/server";

const startedAt = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  return NextResponse.json({
    ok: true,
    version: "1.0",
    uptimeSeconds,
  });
}
