// app/page.tsx
"use client";

import { useEffect, useState } from "react";

type Link = {
  code: string;
  targetUrl: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
};

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);

  const [search, setSearch] = useState("");

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";

  async function loadLinks() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("Failed to load links");
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load links. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLinks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("URL is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          code: code.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create link");
      } else {
        setUrl("");
        setCode("");
        await loadLinks();
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(c: string) {
    if (!confirm(`Delete link "${c}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/links/${c}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete. Please try again.");
      return;
    }

    setLinks((prev) => prev.filter((link) => link.code !== c));
  }

  const filtered = links.filter((link) => {
    const q = search.toLowerCase();
    return (
      link.code.toLowerCase().includes(q) ||
      link.targetUrl.toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">TinyLink Dashboard</h1>
            <p className="text-sm text-slate-400">
              Create and manage your short URLs.
            </p>
          </div>
          <input
            className="w-full sm:w-64 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            placeholder="Search by code or URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        {/* Create form */}
        <section>
          <form
            onSubmit={handleCreate}
            className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm">Target URL</label>
              <input
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                We&apos;ll validate that this is a proper URL before saving.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">Custom code (optional)</label>
              <input
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="6–8 letters/numbers, e.g. docs1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">
                Must match <code>[A-Za-z0-9]&#123;6,8&#125;</code>. Codes are
                globally unique.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating…" : "Create short link"}
            </button>
          </form>
        </section>

        {/* Table */}
        <section>
          {loading ? (
            <p className="text-sm text-slate-400">Loading links…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-400">
              No links yet. Create your first one above!
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Code</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Target URL
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Total clicks
                    </th>
                    <th className="px-3 py-2 text-left font-medium">
                      Last clicked
                    </th>
                    <th className="px-3 py-2 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((link) => (
                    <tr key={link.code} className="border-t border-slate-800">
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{link.code}</span>
                          <button
                            type="button"
                            className="text-[11px] underline"
                            onClick={() => {
                              const shortUrl = `${baseUrl}/${link.code}`;
                              navigator.clipboard.writeText(shortUrl);
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 max-w-xs align-top">
                        <a
                          href={link.targetUrl}
                          target="_blank"
                          className="block truncate text-sky-400 hover:underline"
                          title={link.targetUrl}
                        >
                          {link.targetUrl}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-right align-top">
                        {link.totalClicks}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-400 align-top">
                        {link.lastClickedAt
                          ? new Date(link.lastClickedAt).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="px-3 py-2 text-right align-top">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/code/${link.code}`}
                            className="text-xs underline"
                          >
                            Stats
                          </a>
                          <button
                            type="button"
                            className="text-xs text-red-400 underline"
                            onClick={() => handleDelete(link.code)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="pt-4 text-xs text-slate-500">
          TinyLink &middot; Demo URL shortener
        </footer>
      </div>
    </main>
  );
}
