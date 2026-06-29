"use client";

import { useEffect, useState } from "react";
import type { Door } from "@/lib/types";
import { formatUzs } from "@/lib/format";
import { AdminDoorForm } from "./AdminDoorForm";

/** Admin catalog management (§11): list, create, edit, hide doors. */
export function AdminDashboard({ adminId }: { adminId: number }) {
  const [doors, setDoors] = useState<Door[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Door | "new" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = () => setReloadKey((k) => k + 1);

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

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
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
    <div className="min-h-dvh bg-ink p-4">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="eyebrow text-gold/70">IMKON · Admin</p>
          <h1 className="font-display text-lg font-semibold text-cream">
            Katalog boshqaruvi
          </h1>
          <p className="font-mono text-[11px] text-muted-2">ID: {adminId}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-line px-3 py-1.5 text-xs text-cream-dim"
        >
          Chiqish
        </button>
      </header>

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
