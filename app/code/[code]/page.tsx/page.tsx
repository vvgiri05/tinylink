// app/code/[code]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CodeStats({
  params,
}: {
  params: { code: string };
}) {
  const link = await prisma.link.findUnique({
    where: { code: params.code },
  });

  if (!link) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
        <a
          href="/"
          className="text-sm text-slate-400 underline underline-offset-2"
        >
          ← Back to dashboard
        </a>
        <div>
          <h1 className="text-2xl font-semibold">
            Stats for <span className="font-mono">{link.code}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Overview of this short link&apos;s performance.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
          <div>
            <div className="text-slate-400">Target URL</div>
            <a
              href={link.targetUrl}
              target="_blank"
              className="break-all text-sky-400 hover:underline"
            >
              {link.targetUrl}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total clicks</span>
            <span className="font-medium">{link.totalClicks}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last clicked</span>
            <span>
              {link.lastClickedAt
                ? link.lastClickedAt.toLocaleString()
                : "Never"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Created at</span>
            <span>{link.createdAt.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
