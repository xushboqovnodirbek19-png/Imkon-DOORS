"use client";

import type { Door } from "@/lib/types";

/**
 * Procedural placeholder door (spec §7.1 option 2). Pure code geometry so the
 * catalog + viewer are fully testable before real .glb models exist. Driven
 * loosely by the door's specs (dimensions, colour).
 */
export function ProceduralDoor({ door }: { door: Door }) {
  const w = clamp((door.specs?.width_cm ?? 96) / 100, 0.7, 1.2);
  const h = clamp((door.specs?.height_cm ?? 205) / 100, 1.8, 2.3);
  const t = clamp((door.specs?.thickness_cm ?? 7) / 100, 0.04, 0.12);
  const color = String(door.specs?.color ?? "#3f3f46");

  const frameDepth = t + 0.04;
  const panelInsetW = w * 0.62;
  const panelH = h * 0.34;

  return (
    <group position={[0, h / 2, 0]}>
      {/* Door frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + 0.12, h + 0.12, frameDepth]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Door slab */}
      <mesh position={[0, 0, frameDepth / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.45} />
      </mesh>

      {/* Two embossed panels */}
      {[0.26, -0.26].map((yFactor) => (
        <mesh
          key={yFactor}
          position={[0, h * yFactor, frameDepth / 2 + t / 2 + 0.005]}
          castShadow
        >
          <boxGeometry args={[panelInsetW, panelH, 0.012]} />
          <meshStandardMaterial
            color={color}
            metalness={0.5}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* Handle */}
      <mesh
        position={[w / 2 - 0.1, 0, frameDepth / 2 + t / 2 + 0.03]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.018, 0.018, 0.16, 16]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
