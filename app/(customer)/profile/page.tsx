"use client";

import { useTelegram } from "@/app/providers/TelegramProvider";

/**
 * Profile (§6.4, design 09). Phase 1 shows the verified Telegram identity and
 * the settings scaffold. Phone, saved address and OTP arrive in Phase 2.
 */
export default function ProfilePage() {
  const { status, user, telegram, error } = useTelegram();

  const initials = (user?.full_name ?? telegram?.first_name ?? "?")
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="px-4 py-5">
      <h1 className="mb-4 font-display text-xl font-semibold">Profil</h1>

      {status === "loading" && (
        <div className="h-40 animate-pulse rounded-2xl bg-panel" />
      )}

      {status === "outside" && (
        <div className="rounded-2xl border border-line bg-panel p-4 text-sm text-cream-dim">
          Profilni ko&apos;rish uchun ilovani Telegram bot orqali oching.
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl border border-line bg-panel p-4 text-sm text-red-300">
          Xatolik: {error}
        </div>
      )}

      {status === "ready" && user && telegram && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-panel-gradient p-5">
            <div className="flex items-center gap-4">
              {telegram.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={telegram.photo_url}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover ring-1 ring-gold/40"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient font-display text-lg font-bold text-ink">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-display text-lg font-semibold text-cream">
                  {user.full_name ?? "Foydalanuvchi"}
                </p>
                <p className="font-mono text-sm text-muted">
                  {user.phone_verified ? user.phone : "+998 — — — — —"}
                </p>
                {telegram.username && (
                  <p className="text-xs text-muted-2">@{telegram.username}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <span className="eyebrow text-muted">Telegram ID</span>
              <span className="font-mono text-xs text-cream-dim">
                {user.telegram_id}
              </span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-success">
              <CheckIcon /> Telegram identifikatoringiz serverda tasdiqlandi.
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line">
            <SettingRow label="Manzillarim" />
            <SettingRow label="Bildirishnomalar" />
            <SettingRow label="Til" value="Oʻzbekcha" />
            <SettingRow label="Chiqish" danger last />
          </section>

          <section className="rounded-2xl border border-line bg-panel p-4">
            <p className="eyebrow text-gold/70">Bizning doʻkon</p>
            <p className="mt-1 font-display text-sm font-semibold text-cream">
              IMKON Doors · Toshkent
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  label,
  value,
  danger,
  last,
}: {
  label: string;
  value?: string;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between bg-panel px-4 py-3.5 text-sm ${
        last ? "" : "border-b border-line"
      } ${danger ? "text-red-300" : "text-cream"}`}
    >
      <span>{label}</span>
      <span className="flex items-center gap-2 text-muted-2">
        {value && <span className="text-xs text-muted">{value}</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}
