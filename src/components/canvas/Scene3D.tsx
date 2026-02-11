"use client";

import dynamic from "next/dynamic";

const HeroBackground = dynamic(
  () =>
    import("@/components/canvas/HeroBackground").then((mod) => ({
      default: mod.HeroBackground,
    })),
  { ssr: false }
);

export function Scene3D() {
  return <HeroBackground />;
}
