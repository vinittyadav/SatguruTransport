"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types";
import { Scene3D } from "./Scene3D";
import { TruckModel } from "./TruckModel";

/**
 * Premium 3D fleet showroom: rotate/zoom a stylized vehicle for each
 * category. Data-driven from the vehicles table; placeholder copy when
 * specs are missing.
 */

const CATEGORY_LABELS: Record<string, string> = {
  heavy: "Heavy Trucks",
  medium: "Medium Trucks",
  light: "Light Commercial",
  specialized: "Specialized",
};

function ShowroomVehicle({
  color,
  category,
  spinning,
}: {
  color: string;
  category: string;
  spinning: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current && spinning) {
      group.current.rotation.y = clock.elapsedTime * 0.35;
    }
  });

  const isLight = category === "light";

  return (
    // Translate the model so its geometric center sits at the orbit target:
    // the tractor-trailer spans roughly x ∈ [-5.4, +3.45] around its origin.
    <group ref={group} position={[0.4, 0, 0]}>
      {isLight ? (
        <MiniTruck color={color} />
      ) : (
        // Reuse the premium hero tractor-trailer (painted to the vehicle's
        // configured color) instead of the old primitive box body.
        <TruckModel cabColor={color} rolling={false} detail brandText="SATGURU TRANSPORT" />
      )}
      <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={12} blur={2.4} far={4} />
    </group>
  );
}

function MiniTruck({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[4.2, 0.18, 0.55]} />
        <meshStandardMaterial color="#1c222c" metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[1.35, 1.25, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.9]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[2.02, 1.4, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.06, 0.7, 1.6]} />
        <meshStandardMaterial color="#0b1017" roughness={0.1} />
      </mesh>
      <mesh position={[-0.7, 1.15, 0]}>
        <boxGeometry args={[2.6, 1.5, 1.9]} />
        <meshStandardMaterial color="#dde3ea" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[1.35, 0.5, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.26, 18]} />
        <meshStandardMaterial color="#11151c" roughness={0.9} />
      </mesh>
      <mesh position={[1.35, 0.5, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.26, 18]} />
        <meshStandardMaterial color="#11151c" roughness={0.9} />
      </mesh>
      <mesh position={[-1.2, 0.5, 0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.26, 18]} />
        <meshStandardMaterial color="#11151c" roughness={0.9} />
      </mesh>
      <mesh position={[-1.2, 0.5, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.26, 18]} />
        <meshStandardMaterial color="#11151c" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FleetFallback({ vehicle }: { vehicle: Vehicle | undefined }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-navy-900">
      <div className="text-5xl">🚚</div>
      <p className="font-semibold text-white">
        {vehicle?.title ?? "Fleet"}
      </p>
      <p className="body-muted text-sm">3D preview unavailable on this device.</p>
    </div>
  );
}

export function FleetViewer({ vehicles }: { vehicles: Vehicle[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const vehicle = vehicles[activeIndex];

  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    vehicles.forEach((v) => {
      if (!seen.has(v.category)) seen.set(v.category, 0);
      seen.set(v.category, seen.get(v.category)! + 1);
    });
    return Array.from(seen.keys());
  }, [vehicles]);

  if (vehicles.length === 0) {
    return (
      <div className="card">
        <p className="font-semibold text-white">Fleet</p>
        <p className="body-muted mt-2 text-sm">
          Fleet specification to be configured.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="relative h-[380px] min-w-0 overflow-hidden rounded-lg border border-navy-700 bg-navy-900 lg:h-[520px]">
        <Scene3D
          camera={{ position: [8.0, 3.6, 8.8], fov: 40 }}
          fallback={<FleetFallback vehicle={vehicle} />}
        >
          {/* Self-contained studio lighting (no external HDRI fetch). The
              Environment probe is REQUIRED for the PBR paint/chrome —
              metallic materials go black without reflections. */}
          <color attach="background" args={["#101826"]} />
          <Environment resolution={128} frames={1} background={false}>
            <color attach="background" args={["#0b0f16"]} />
            <Lightformer form="rect" intensity={2.4} color="#ffffff" scale={[10, 3, 1]} position={[0, 8, 2]} rotation={[Math.PI / 2, 0, 0]} />
            <Lightformer form="rect" intensity={1.6} color="#ffe6bd" scale={[8, 2, 1]} position={[7, 4, 6]} rotation={[0, -Math.PI / 3, 0]} />
            <Lightformer form="rect" intensity={1.1} color="#9db8e8" scale={[8, 2, 1]} position={[-7, 4, -6]} rotation={[0, Math.PI / 3, 0]} />
            <Lightformer form="circle" intensity={1.4} color="#ffffff" scale={3} position={[-5, 3, 7]} />
          </Environment>
          <ambientLight intensity={0.6} color="#c9d6e8" />
          <directionalLight position={[8, 12, 6]} intensity={1.2} color="#f2e9d8" />
          <directionalLight position={[-8, 5, -6]} intensity={0.35} color="#8fb0ff" />
          <spotLight position={[0, 9, 4]} angle={0.6} penumbra={0.9} intensity={0.9} color="#fff4dd" />
          <ShowroomVehicle
            key={vehicle.id}
            color={vehicle.color || "#f5a623"}
            category={vehicle.category}
            spinning={spinning}
          />
          <gridHelper args={[30, 30, "#1a2432", "#111825"]} position={[0, -0.01, 0]} />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={18}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={false}
            target={[0, 1.5, 0]}
          />
        </Scene3D>

        {/* Badges */}
        <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
          <span className="chip border-navy-600 bg-navy-950/80 text-mist-300">
            {CATEGORY_LABELS[vehicle.category] ?? vehicle.category}
          </span>
          {vehicle.availability === "available" && (
            <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              Available
            </span>
          )}
          {vehicle.availability === "on_request" && (
            <span className="chip border-amber-500/30 bg-amber-500/10 text-amber-300">
              On request
            </span>
          )}
        </div>

        {/* Rotate hint */}
        <div className="pointer-events-none absolute bottom-4 right-4">
          <span className="chip border-navy-600 bg-navy-950/80 text-mist-400">
            Drag to rotate · scroll to zoom
          </span>
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="card">
          <p className="eyebrow">Fleet</p>
          <h3 className="heading-md">{vehicle.title}</h3>
          <p className="body-muted mt-2 text-sm">{vehicle.description}</p>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <dt className="text-mist-400">Capacity</dt>
              <dd className="font-medium text-white">
                {vehicle.capacity ?? "To be configured"}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <dt className="text-mist-400">Cargo suitability</dt>
              <dd className="font-medium text-white">
                {vehicle.cargo_suitability ?? "To be configured"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-mist-400">Availability</dt>
              <dd className="font-medium text-white capitalize">
                {vehicle.availability.replace("_", " ")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Vehicle selector — swipeable strip on mobile, 2-col grid on sm+ */}
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
          {vehicles.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "min-w-40 shrink-0 snap-start rounded-md border p-3 text-left text-sm transition-all",
                i === activeIndex
                  ? "border-amber-500/60 bg-amber-500/10"
                  : "border-navy-600 bg-navy-850 hover:border-navy-500",
              )}
            >
              <span className="block font-medium text-white">{v.title}</span>
              <span className="mt-0.5 block text-xs text-mist-400">
                {CATEGORY_LABELS[v.category] ?? v.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
