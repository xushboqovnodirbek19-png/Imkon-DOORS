import { ComingSoon } from "@/app/components/ComingSoon";

export default function CartPage() {
  return (
    <ComingSoon
      icon={
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H6" />
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="18" cy="20" r="1.3" />
        </svg>
      }
      title="Savat"
      note="Savat va band qilish keyingi bosqichda (Phase 3) ishga tushadi."
    />
  );
}
