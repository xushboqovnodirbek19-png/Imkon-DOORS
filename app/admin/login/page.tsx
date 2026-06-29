"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Admin login via the Telegram Login Widget. The widget hands us a signed
 * payload; /api/admin/login validates it and checks the allowlist server-side.
 *
 * Requires:
 *  - NEXT_PUBLIC_BOT_USERNAME (the bot's @username, without @)
 *  - BotFather → /setdomain pointing at this site's domain
 */
export default function AdminLoginPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME;

  useEffect(() => {
    interface TgAuthUser {
      id: number;
      hash: string;
      [k: string]: string | number;
    }
    const w = window as unknown as {
      onTelegramAuth?: (u: TgAuthUser) => void;
    };
    w.onTelegramAuth = async (user: TgAuthUser) => {
      setError(null);
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.reason || data.error || "kirish xatosi");
        window.location.href = "/admin";
      } catch (e) {
        setError(e instanceof Error ? e.message : "kirish xatosi");
      }
    };

    if (ref.current && botUsername && ref.current.childElementCount === 0) {
      const s = document.createElement("script");
      s.src = "https://telegram.org/js/telegram-widget.js?22";
      s.async = true;
      s.setAttribute("data-telegram-login", botUsername);
      s.setAttribute("data-size", "large");
      s.setAttribute("data-onauth", "onTelegramAuth(user)");
      s.setAttribute("data-request-access", "write");
      ref.current.appendChild(s);
    }
  }, [botUsername]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-panel">
          <svg width="22" height="30" viewBox="0 0 16 22" fill="none">
            <rect x="1" y="1" width="14" height="20" rx="2" stroke="#C6A15B" strokeWidth="1.5" />
            <rect x="5" y="6" width="6" height="10" rx="1" stroke="#C6A15B" strokeWidth="1" />
            <rect x="9.4" y="10" width="1.4" height="3.2" rx="0.7" fill="#D8B774" />
          </svg>
        </div>
        <p className="eyebrow text-gold/70">IMKON · Admin</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-cream">
          Boshqaruv paneli
        </h1>
        <p className="mt-1 text-sm text-muted">
          Davom etish uchun Telegram orqali kiring.
        </p>
      </div>

      {!botUsername && (
        <p className="max-w-sm rounded-xl border border-line bg-panel p-3 text-center text-xs text-gold/80">
          NEXT_PUBLIC_BOT_USERNAME o&apos;rnatilmagan. .env.local ga bot
          @username&apos;ini qo&apos;shing.
        </p>
      )}

      <div ref={ref} />

      {error && (
        <p className="rounded-xl border border-line bg-panel p-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </main>
  );
}
