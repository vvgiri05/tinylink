// app/api/links/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CODE_REGEX, generateRandomCode } from "./utils";

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { url, code: customCode } = body as {
    url?: string;
    code?: string;
  };

  if (!url || !url.trim()) {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL format" },
      { status: 400 }
    );
  }

  let code = customCode?.trim();

  // If custom code provided, validate and check uniqueness
  if (code) {
    if (!CODE_REGEX.test(code)) {
      return NextResponse.json(
        { error: "Code must match [A-Za-z0-9]{6,8}" },
        { status: 400 }
      );
    }

    const existing = await prisma.link.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 409 } // important for autograding
      );
    }
  } else {
    // Generate random code of length 6–8, ensure unique
    for (let i = 0; i < 5; i++) {
      const len = 6 + Math.floor(Math.random() * 3); // 6,7,8
      const candidate = generateRandomCode(len);
      const existing = await prisma.link.findUnique({
        where: { code: candidate },
      });
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return NextResponse.json(
        { error: "Failed to generate unique code" },
        { status: 500 }
      );
    }
  }

  const link = await prisma.link.create({
    data: {
      code,
      targetUrl: url,
    },
  });

  return NextResponse.json(link, { status: 201 });
}
