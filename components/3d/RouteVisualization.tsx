"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D, type CapabilityTier } from "./Scene3D";
import { routeLocations, type RouteLocationId } from "@/lib/config/site";

/**
 * Interactive route visualization (NOT live tracking).
 * Users pick pickup + destination; an amber corridor animates between them.
 * Positions are schematic, on a stylized map plane.
 */

interface RoutePoint {
  id: RouteLocationId;
  name: string;
  x: number;
  z: number;
}

const toV3 = (p: RoutePoint) => new THREE.Vector3(p.x, 0.4, p.z);

function makeCurve(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dist = a.distanceTo(b);
  mid.y += Math.min(2.2, 0.5 + dist * 0.28);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

function Marker({
  point,
  color,
  label,
  active,
  onClick,
}: {
  point: RoutePoint;
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!ring.current || !active) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.12;
    ring.current.scale.setScalar(s);
  });

  // Pointer affordance without DOM portals. Setting a style on <body> is safe:
  // it never touches React-owned nodes (the root of the old <Html> unmount bug).
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group position={[point.x, 0.42, point.z]}>
      {/* Clickable meshes — the marker itself is the hit target. */}
      <group
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh>
          <cylinderGeometry args={[0.14, 0.18, 0.55, 16]} />
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 1.4 : hovered ? 0.9 : 0.5}
          />
        </mesh>
        <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.42, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={active ? 0.55 : 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Native 3D label (troika Text) — no <Html> portal, no manual DOM. */}
        <Text
          position={[0, 0.95, 0]}
          fontSize={0.26}
          anchorX="center"
          anchorY="middle"
          color={active ? "#f5c56b" : "#c9d2dd"}
          outlineWidth={0.012}
          outlineColor="#06090f"
        >
          {label}
        </Text>
      </group>
    </group>
  );
}

function RouteLine({
  from,
  to,
  progress,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  progress: number;
}) {
  const progressMesh = useRef<THREE.Mesh>(null);
  const truckRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => makeCurve(from, to), [from, to]);
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.045, 8, false),
    [curve],
  );
  const fullGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.018, 6, false),
    [curve],
  );

  // Reveal the amber tube progressively via drawRange.
  useEffect(() => {
    if (!progressMesh.current) return;
    const geo = progressMesh.current.geometry as THREE.TubeGeometry;
    const total = geo.getIndex()?.count ?? 0;
    geo.setDrawRange(0, Math.floor(total * progress));
  }, [progress, curve]);

  useFrame(({ clock }) => {
    if (truckRef.current && progress > 0) {
      const t = ((clock.elapsedTime * 0.12) % 1) * progress;
      const clamped = Math.min(t, 0.999);
      truckRef.current.position.copy(curve.getPointAt(clamped));
      const tangent = curve.getTangentAt(clamped);
      truckRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
  });

  return (
    <group>
      <mesh geometry={fullGeometry}>
        <meshBasicMaterial color="#33435c" transparent opacity={0.5} />
      </mesh>
      <mesh ref={progressMesh} geometry={tubeGeometry}>
        <meshBasicMaterial color="#f5a623" transparent opacity={0.9} />
      </mesh>
      {progress > 0 && (
        <mesh ref={truckRef}>
          <boxGeometry args={[0.22, 0.14, 0.34]} />
          <meshStandardMaterial
            color="#f5a623"
            emissive="#f5a623"
            emissiveIntensity={0.7}
          />
        </mesh>
      )}
    </group>
  );
}

function MapPlane() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#0a0f17" roughness={0.95} />
      </mesh>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={`h${i}`}
          position={[0, 0.01, -6 + i * 0.85]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[16, 0.008]} />
          <meshBasicMaterial color="#1a2432" />
        </mesh>
      ))}
      {Array.from({ length: 19 }).map((_, i) => (
        <mesh
          key={`v${i}`}
          position={[-8 + i * 0.85, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.008, 12]} />
          <meshBasicMaterial color="#1a2432" />
        </mesh>
      ))}
      <Text
        position={[0, 0.02, 5.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="#33435c"
      >
        MAHARASHTRA — SCHEMATIC VISUALIZATION
      </Text>
    </group>
  );
}

function SceneContent({
  pickupId,
  dropId,
  progress,
  onSelect,
}: {
  pickupId: RouteLocationId;
  dropId: RouteLocationId;
  progress: number;
  onSelect: (id: RouteLocationId) => void;
}) {
  const pickup = routeLocations.find((l) => l.id === pickupId);
  const drop = routeLocations.find((l) => l.id === dropId);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 10, 4]} intensity={0.9} />
      <fog attach="fog" args={["#06090f", 18, 40]} />
      <MapPlane />
      {routeLocations.map((loc) => (
        <Marker
          key={loc.id}
          point={loc}
          color={
            loc.id === pickupId
              ? "#f5a623"
              : loc.id === dropId
                ? "#4f8ef7"
                : "#39424f"
          }
          label={loc.name}
          active={loc.id === pickupId || loc.id === dropId}
          onClick={() => onSelect(loc.id)}
        />
      ))}
      {pickup && drop && pickupId !== dropId && (
        <RouteLine from={toV3(pickup)} to={toV3(drop)} progress={progress} />
      )}
    </>
  );
}

/** Tween helper: animates 0 → 1 over `duration` ms with easing. */
function useProgressTween(key: string) {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key]);
  return progress;
}

export function RouteVisualization({
  tier = "full",
}: {
  tier?: CapabilityTier;
}) {
  // Default corridor starts at the Ambernath home base.
  const [pickupId, setPickupId] = useState<RouteLocationId>("ambernath");
  const [dropId, setDropId] = useState<RouteLocationId>("pune");
  const [routeKey, setRouteKey] = useState("ambernath-pune");

  const progress = useProgressTween(routeKey);

  const pickup = routeLocations.find((l) => l.id === pickupId)!;
  const drop = routeLocations.find((l) => l.id === dropId)!;

  const setPickup = useCallback((id: RouteLocationId) => {
    setPickupId(id);
    setRouteKey(`${id}-${id === dropId ? pickupId : dropId}`);
    if (id === dropId) setDropId(pickupId);
  }, [dropId, pickupId]);

  const setDrop = useCallback((id: RouteLocationId) => {
    setDropId(id);
    setRouteKey(`${pickupId}-${id}`);
  }, [pickupId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="relative h-[420px] min-w-0 overflow-hidden rounded-lg border border-navy-700 lg:h-[520px]">
        <Scene3D
          camera={{ position: [0, 9, 10], fov: 40 }}
          fallback={
            <div className="flex h-full flex-col items-center justify-center gap-3 bg-navy-900">
              <p className="text-sm font-semibold text-white">
                Route Visualization
              </p>
              <p className="body-muted px-8 text-center text-sm">
                {pickupId !== dropId
                  ? `${pickup.name} → ${drop.name}`
                  : "Select pickup and destination cities."}
              </p>
            </div>
          }
        >
          <SceneContent
            pickupId={pickupId}
            dropId={dropId}
            progress={progress}
            onSelect={(id) => {
              // Clicking a marker sets it as the new destination.
              setDrop(id);
            }}
          />
          <OrbitControls
            enablePan={false}
            minDistance={6}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Scene3D>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="card">
          <p className="eyebrow">Route Visualization</p>
          <h3 className="heading-md">Plan a corridor</h3>
          <p className="body-muted mt-2 text-sm">
            Select pickup and destination cities to preview a corridor. This is
            a planning visualization — not live tracking.
          </p>
        </div>

        <div className="card space-y-4">
          <div>
            <label className="label-base" htmlFor="rv-pickup">
              Pickup
            </label>
            <select
              id="rv-pickup"
              className="input-base"
              value={pickupId}
              onChange={(e) => setPickup(e.target.value as RouteLocationId)}
            >
              {routeLocations.map((l) => (
                <option key={l.id} value={l.id} className="bg-navy-900">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base" htmlFor="rv-drop">
              Destination
            </label>
            <select
              id="rv-drop"
              className="input-base"
              value={dropId}
              onChange={(e) => setDrop(e.target.value as RouteLocationId)}
            >
              {routeLocations.map((l) => (
                <option key={l.id} value={l.id} className="bg-navy-900">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed text-mist-300">
            Planning visualization — not live tracking, and not a
            service-coverage claim. Corridors shown are examples.
            <Link
              href={`/quote?origin=${pickup.name}&destination=${drop.name}`}
              className="ml-1 font-semibold text-amber-500 hover:underline"
            >
              Request this route →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
