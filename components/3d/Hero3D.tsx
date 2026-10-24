"use client";

import dynamic from "next/dynamic";
import { Scene3D, use3DCapability, type CapabilityTier } from "./Scene3D";

// The scene is only loaded client-side, on demand.
const HeroSceneContent = dynamic(
  () => import("./HeroScene").then((m) => m.HeroSceneContent),
  { ssr: false },
);

function HeroFallbackArt() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Procedural static art: layered CSS gradient highway scene */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,#111825_0%,#06090f_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent_0%,#0a0f17_100%)]" />
      {/* Road */}
      <div className="absolute bottom-[28%] left-1/2 h-24 w-[160%] -translate-x-1/2 -rotate-3 bg-navy-800/80" />
      {/* Lane dashes */}
      <div className="absolute bottom-[36%] left-1/2 flex w-[150%] -translate-x-1/2 -rotate-3 gap-6 opacity-40">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="h-1 w-10 bg-mist-300" />
        ))}
      </div>
      {/* Truck silhouette */}
      <div className="absolute bottom-[30%] left-[54%] flex items-end gap-1.5">
        <div className="h-20 w-40 rounded-sm bg-gradient-to-r from-navy-600 to-navy-500 shadow-[0_16px_40px_rgba(0,0,0,0.5)]" />
        <div className="relative h-24 w-24 rounded-sm bg-gradient-to-b from-mist-100 to-mist-300">
          <div className="absolute right-2 top-3 h-8 w-6 bg-navy-900/70" />
        </div>
        {/* Brand stripe */}
        <div className="absolute -left-24 top-2 h-2 w-36 rounded bg-amber-500/80" />
      </div>
      {/* Glow */}
      <div className="absolute bottom-[30%] left-[40%] h-24 w-64 rounded-full bg-amber-500/10 blur-3xl" />
    </div>
  );
}

/**
 * Hero 3D entry. The capability tier is DETECTED client-side (WebGL support,
 * viewport size, reduced-motion preference) — never hard-coded. Until the
 * check completes, the premium static art renders, so there is never a blank
 * screen and the LCP content is stable.
 */
export function Hero3D({ tier: tierProp }: { tier?: CapabilityTier }) {
  const detected = use3DCapability();
  // Respect an explicitly-provided tier (used in tests/storybook); otherwise
  // use detection. While detection is pending (checked === false), we render
  // the static art to avoid any flash of the wrong scene.
  const tier: CapabilityTier =
    tierProp ?? (detected.checked ? detected.tier : "none");

  return (
    <div className="absolute inset-0">
      {tier === "none" ? (
        <HeroFallbackArt />
      ) : (
        <Scene3D
          camera={{ position: [5.2, 2.1, 8.4], fov: 40 }}
          dpr={[1, tier === "full" ? 1.75 : 1.25]}
          fallback={<HeroFallbackArt />}
        >
          <HeroSceneContent lite={tier === "lite"} />
        </Scene3D>
      )}
    </div>
  );
}
