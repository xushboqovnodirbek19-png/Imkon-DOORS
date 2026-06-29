"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Customer bottom navigation: Home · Cart · Orders · Profile (locked §6). */

const TABS = [
  { href: "/", label: "Asosiy", icon: HomeIcon },
  { href: "/cart", label: "Savat", icon: CartIcon },
  { href: "/orders", label: "Buyurtmalar", icon: OrdersIcon },
  { href: "/profile", label: "Profil", icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel-2/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide transition-colors ${
                  active ? "text-gold" : "text-muted-2"
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const ICON = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg {...ICON} stroke="currentColor">
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      {active && <rect x="10" y="13" width="4" height="7" fill="currentColor" stroke="none" />}
    </svg>
  );
}
function CartIcon() {
  return (
    <svg {...ICON} stroke="currentColor">
      <path d="M3 4h2l2.2 11.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 7H6" />
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
    </svg>
  );
}
function OrdersIcon() {
  return (
    <svg {...ICON} stroke="currentColor">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg {...ICON} stroke="currentColor">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5" />
    </svg>
  );
}
