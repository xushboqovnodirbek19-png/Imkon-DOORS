"use client";

import { useState } from "react";
import { AdminOverview } from "./AdminOverview";
import { AdminCatalog } from "./AdminCatalog";

type Section = "overview" | "catalog";

/**
 * Admin dashboard shell: persistent header + section tabs. Sections render
 * below. The catalog's create/edit form takes over the screen, so it can hide
 * the chrome via `onFullscreenChange`.
 */
export function AdminShell({
  adminId,
  adminCount,
}: {
  adminId: number;
  adminCount: number;
}) {
  const [section, setSection] = useState<Section>("overview");
  const [fullscreen, setFullscreen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-dvh bg-ink">
      {!fullscreen && (
        <header className="sticky top-0 z-30 border-b border-line bg-ink/95 px-4 pb-2.5 pt-4 backdrop-blur">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="eyebrow text-gold/70">IMKON · Admin</p>
              <h1 className="font-display text-lg font-semibold text-cream">
                Boshqaruv paneli
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-2">
                ID: {adminId}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-line px-3 py-1.5 text-xs text-cream-dim"
              >
                Chiqish
              </button>
            </div>
          </div>
          <nav className="flex gap-2">
            <Tab active={section === "overview"} onClick={() => setSection("overview")}>
              Umumiy
            </Tab>
            <Tab active={section === "catalog"} onClick={() => setSection("catalog")}>
              Katalog
            </Tab>
          </nav>
        </header>
      )}

      <main>
        {section === "overview" ? (
          <AdminOverview
            adminCount={adminCount}
            onManageCatalog={() => setSection("catalog")}
          />
        ) : (
          <AdminCatalog onFullscreenChange={setFullscreen} />
        )}
      </main>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-gold-gradient text-ink shadow-gold"
          : "border border-line bg-panel text-cream-dim"
      }`}
    >
      {children}
    </button>
  );
}
