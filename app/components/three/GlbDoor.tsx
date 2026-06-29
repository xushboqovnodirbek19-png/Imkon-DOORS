"use client";

import { useGLTF } from "@react-three/drei";

/**
 * Loads a compressed .glb. Draco + meshopt decoders are enabled so models
 * authored with either compression load correctly (spec §7 performance rules).
 */
export function GlbDoor({ url }: { url: string }) {
  // useGLTF(url, useDraco, useMeshopt)
  const { scene } = useGLTF(url, true, true);
  return <primitive object={scene} dispose={null} />;
}
