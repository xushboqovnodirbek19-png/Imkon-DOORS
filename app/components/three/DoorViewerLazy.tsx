"use client";

import dynamic from "next/dynamic";
import type { Door } from "@/lib/types";

/**
 * Client wrapper that lazy-loads the Three.js viewer with no SSR. The heavy
 * 3D bundle is fetched only when a detail page mounts.
 */
const DoorViewer = dynamic(
  () => import("./DoorViewer").then((m) => m.DoorViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse rounded-2xl border border-line bg-panel" />
    ),
  },
);

export function DoorViewerLazy({ door }: { door: Door }) {
  return <DoorViewer door={door} />;
}
