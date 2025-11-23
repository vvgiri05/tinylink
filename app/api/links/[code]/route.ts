// app/api/links/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Helper to normalize context.params whether it's a Promise or a plain object.
 */
async function resolveParams(context: any) {
  if (!context) return {};
  if (context.params && typeof context.params.then === "function") {
    return await context.params;
  }
  return context.params ?? {};
}

export async function GET(_request: NextRequest, context: any) {
  const params = await resolveParams(context);
  const code = params?.code as string | undefined;

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const link = await prisma.link.findUnique({ where: { code } });
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(link);
}

export async function DELETE(_request: NextRequest, context: any) {
  const params = await resolveParams(context);
  const code = params?.code as string | undefined;

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const existing = await prisma.link.findUnique({ where: { code } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.link.delete({ where: { code } });
  return NextResponse.json({ ok: true });
}
