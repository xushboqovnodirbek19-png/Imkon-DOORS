"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * App-wide Telegram identity. Runs the Phase 0 /api/auth handshake once and
 * shares the result. Browsing stays open (§8) — this never blocks the UI; it
 * just makes the verified user available to whoever needs it (Profile, and
 * later reserve/checkout).
 */

export interface AuthUser {
  id: string;
  telegram_id: number;
  phone: string | null;
  phone_verified: boolean;
  full_name: string | null;
  created_at: string;
}
export interface AuthTelegram {
  id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
}

interface TelegramCtx {
  status: "loading" | "outside" | "ready" | "error";
  user: AuthUser | null;
  telegram: AuthTelegram | null;
  error: string | null;
}

interface TelegramWebApp {
  initData: string;
  ready: () => void;
  expand: () => void;
}
declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const Ctx = createContext<TelegramCtx>({
  status: "loading",
  user: null,
  telegram: null,
  error: null,
});

export function useTelegram() {
  return useContext(Ctx);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TelegramCtx>({
    status: "loading",
    user: null,
    telegram: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const tg = window.Telegram?.WebApp;
      if (!tg || !tg.initData) {
        if (!cancelled)
          setState((s) => ({ ...s, status: "outside" }));
        return;
      }
      tg.ready();
      tg.expand();
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.reason || data.error || "auth failed");
        if (!cancelled)
          setState({
            status: "ready",
            user: data.user,
            telegram: data.telegram,
            error: null,
          });
      } catch (err) {
        const message = err instanceof Error ? err.message : "xato";
        if (!cancelled)
          setState((s) => ({ ...s, status: "error", error: message }));
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
