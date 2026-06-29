"use client";

import { Component, Suspense, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, OrbitControls } from "@react-three/drei";
import type { Door } from "@/lib/types";
import { GlbDoor } from "./GlbDoor";
import { ProceduralDoor } from "./ProceduralDoor";

/**
 * The 3D centerpiece (§7). Renders a .glb if the door has one, otherwise the
 * procedural placeholder. Falls back to a static image if WebGL is missing or
 * the model fails to load — "graceful fallbacks" from §14.
 *
 * This component is lazy-loaded (next/dynamic, ssr:false) only on the detail
 * screen, so Three.js never ships to the catalog grid.
 */
export function DoorViewer({ door }: { door: Door }) {
  // This component only mounts client-side (loaded via dynamic ssr:false),
  // so the lazy initializer can safely probe WebGL during render.
  const [webglOk] = useState<boolean>(() =>
    typeof window === "undefined" ? true : detectWebGL(),
  );

  if (!webglOk) return <ImageFallback door={door} />;

  return (
    <ViewerErrorBoundary fallback={<ImageFallback door={door} />}>
      <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-line bg-panel-gradient">
        <span className="eyebrow absolute left-3 top-3 z-10 rounded-full border border-line bg-ink/60 px-2.5 py-1 text-gold/80">
          .GLB · 3D model
        </span>
        <Canvas
          shadows
          dpr={[1, 1.8]} // cap DPR for mid-range Android (no lag)
          camera={{ position: [1.6, 1.1, 2.4], fov: 40 }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[3, 5, 2]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} />

          <Suspense
            fallback={
              <Html center className="text-xs text-muted">
                Yuklanmoqda…
              </Html>
            }
          >
            {door.model_3d_url ? (
              <GlbDoor url={door.model_3d_url} />
            ) : (
              <ProceduralDoor door={door} />
            )}
          </Suspense>

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.4}
            scale={6}
            blur={2.4}
            far={3}
          />
          <AutoOrbit />
        </Canvas>

        <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-line bg-ink/60 px-3 py-1 text-[10px] text-cream-dim">
          360° · suring va kattalashtiring
        </span>
      </div>
    </ViewerErrorBoundary>
  );
}

/** Auto-rotates until the user first interacts. */
function AutoOrbit() {
  const [auto, setAuto] = useState(true);
  return (
    <OrbitControls
      autoRotate={auto}
      autoRotateSpeed={1.2}
      enablePan={false}
      minDistance={1.4}
      maxDistance={5}
      onStart={() => setAuto(false)}
      target={[0, 1, 0]}
    />
  );
}

function ImageFallback({ door }: { door: Door }) {
  const img = door.image_urls?.[0];
  return (
    <div className="flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-panel-gradient">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={door.name} className="h-full w-full object-contain" />
      ) : (
        <div className="text-center text-muted">
          <svg width="44" height="62" viewBox="0 0 38 54" fill="none" className="mx-auto">
            <rect x="2" y="2" width="34" height="50" rx="4" stroke="#6F6658" strokeWidth="2" />
            <rect x="9" y="12" width="11" height="22" rx="2" stroke="#6F6658" strokeWidth="1.5" />
            <rect x="17" y="24" width="2.4" height="6" rx="1.2" fill="#C6A15B" />
          </svg>
          <p className="eyebrow mt-3 text-muted-2">3D koʻrinish mavjud emas</p>
        </div>
      )}
    </div>
  );
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

class ViewerErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
