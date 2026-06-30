"use client";

import { useEffect, useState } from "react";
import type { Door } from "@/lib/types";
import { formatUzs } from "@/lib/format";
import { AdminDoorForm } from "./AdminDoorForm";

/**
 * Admin catalog management (§11): list, create, edit, hide doors.
 * Rendered inside the admin dashboard shell. While the create/edit form is
 * open it takes over the screen, so we notify the shell to hide its chrome.
 */
export function AdminCatalog({
  onFullscreenChange,
}: {
  onFullscreenChange?: (fullscreen: boolean) => void;
}) {
  const [doors, setDoors] = useState<Door[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Door | "new" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    onFullscreenChange?.(editing !== null);
  }, [editing, onFullscreenChange]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch("/api/admin/doors");
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "xato");
        if (!cancelled) {
          setDoors(d.doors as Door[]);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "xato");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function hide(id: string) {
    if (!confirm("Bu eshik yashirilsinmi?")) return;
    await fetch(`/api/admin/doors/${id}`, { method: "DELETE" });
    refresh();
  }

  if (editing) {
    return (
      <AdminDoorForm
        door={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refresh();
        }}
      />
    );
  }

  return (
    <div className="p-4">
      <button
        onClick={() => setEditing("new")}
        className="mb-5 w-full rounded-xl bg-gold-gradient py-2.5 text-sm font-bold text-ink shadow-gold"
      >
        + Yangi eshik
      </button>

      {error && (
        <p className="mb-3 rounded-lg border border-line bg-panel p-3 text-sm text-red-300">
          {error}
        </p>
      )}
      {doors === null && !error && (
        <p className="text-sm text-muted">Yuklanmoqda…</p>
      )}
      {doors?.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          Hali eshik yo&apos;q. &quot;+ Yangi eshik&quot; bilan qo&apos;shing.
        </p>
      )}

      <ul className="space-y-2.5">
        {doors?.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-3 rounded-xl border border-line bg-panel-gradient p-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-panel-2">
              {d.image_urls?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.image_urls[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gold/60">🚪</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium text-cream">
                {d.name}
                {d.is_featured && <span className="text-gold" title="Top">★</span>}
                {!d.is_active && (
                  <span className="eyebrow rounded bg-line px-1.5 py-0.5 text-muted-2">
                    yashirin
                  </span>
                )}
              </p>
              <p className="font-mono text-xs text-muted">
                {formatUzs(d.price)} · {d.stock_count} dona
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setEditing(d)}
                className="rounded-lg border border-line px-2.5 py-1 text-xs text-cream-dim"
              >
                Tahrirlash
              </button>
              {d.is_active && (
                <button
                  onClick={() => hide(d.id)}
                  className="rounded-lg border border-red-400/30 px-2.5 py-1 text-xs text-red-300"
                >
                  Yashirish
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
