"use client";

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/utils";
import { useMounted } from "@/lib/hooks";

export function SceneSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full min-h-64 items-center justify-center", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-600 border-t-amber-500" />
    </div>
  );
}

export type CapabilityTier = "full" | "lite" | "none";

export interface CapabilityResult {
  supported: boolean;
  tier: CapabilityTier;
  checked: boolean;
}

/* Module-level capability store. Detection runs once, after hydration, and
 * notifies subscribers — no synchronous setState inside an effect. */
const initialCapability: CapabilityResult = {
  supported: false,
  tier: "none",
  checked: false,
};
let capabilityState: CapabilityResult | null = null;
const capabilityListeners = new Set<() => void>();

function detectCapability(): CapabilityResult {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGLRenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);

    if (!gl) {
      return { supported: false, tier: "none", checked: true };
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const mobile = Math.min(window.innerWidth, window.innerHeight) < 700;
    const cores = navigator.hardwareConcurrency ?? 4;
    const lowPower = cores <= 4 && mobile;

    const tier: CapabilityTier = reducedMotion
      ? "lite"
      : lowPower
        ? "lite"
        : mobile
          ? "lite"
          : "full";

    return { supported: true, tier, checked: true };
  } catch {
    return { supported: false, tier: "none", checked: true };
  }
}

function computeCapability() {
  if (capabilityState) return;
  capabilityState = detectCapability();
  for (const listener of capabilityListeners) listener();
}

function subscribeCapability(notify: () => void) {
  capabilityListeners.add(notify);
  if (!capabilityState) {
    // Detection needs the DOM/measurement APIs — schedule after hydration.
    queueMicrotask(computeCapability);
  }
  return () => {
    capabilityListeners.delete(notify);
  };
}

const getCapabilitySnapshot = () => capabilityState ?? initialCapability;
const getCapabilityServerSnapshot = () => initialCapability;

/** Hook: detect WebGL + device capability tier. Runs client-side only. */
export function use3DCapability(): CapabilityResult {
  return useSyncExternalStore(
    subscribeCapability,
    getCapabilitySnapshot,
    getCapabilityServerSnapshot,
  );
}

/** Error boundary so a scene crash never takes down the page. */
class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("[3D] Scene failed, showing fallback:", error.message);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/** Lazy-mount helper: only render children once the container is near viewport. */
function useInView(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [inView, setInView] = useState(!enabled);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, enabled]);
  return inView;
}

/**
 * Wrapper that renders a 3D canvas with:
 * - WebGL support detection + capability tier
 * - error boundary with graceful fallback
 * - Suspense loader
 * - intersection-observer lazy mount
 * If WebGL is unavailable or the tier is "none", only the fallback renders.
 */
export function Scene3D({
  children,
  fallback,
  className,
  camera = { position: [0, 2, 8] as [number, number, number], fov: 45 },
  dpr = [1, 1.75] as [number, number],
  lazy = true,
  onCreated,
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
  dpr?: [number, number];
  lazy?: boolean;
  onCreated?: (state: unknown) => void;
}) {
  const { supported, tier, checked } = use3DCapability();
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, lazy);
  const mounted = useMounted();

  const showCanvas = mounted && checked && supported && tier !== "none" && inView;

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {showCanvas ? (
        <SceneErrorBoundary fallback={fallback}>
          <Canvas
            camera={{ position: camera.position, fov: camera.fov }}
            dpr={dpr}
            gl={{
              antialias: true,
              powerPreference: "high-performance",
              alpha: true,
            }}
            onCreated={onCreated}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        </SceneErrorBoundary>
      ) : checked && !supported ? (
        fallback
      ) : (
        <SceneSpinner />
      )}
    </div>
  );
}
