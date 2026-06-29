import { ComingSoon } from "@/app/components/ComingSoon";

export default function OrdersPage() {
  return (
    <ComingSoon
      icon={
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      }
      title="Buyurtmalar"
      note="Buyurtmalar tarixi keyingi bosqichda (Phase 3) ko'rinadi."
    />
  );
}
