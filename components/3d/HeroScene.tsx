"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  Sky,
} from "@react-three/drei";
import * as THREE from "three";
import { TruckModel } from "./TruckModel";

/**
 * Cinematic golden-hour highway hero.
 *
 * WORLD AXES: the highway runs along X. The truck faces +X (screen right in
 * the 3/4 camera) and "drives" forward while the world moves past it —
 * dashes scroll toward -X, wheels roll +X. Landscape and furniture are
 * aligned to the same axis so nothing reads as "truck crossing the road".
 *
 * Quality strategy — everything is LOCAL (no network fetches):
 *  - drei <Sky> (Preetham) for the evening gradient + warm backlight mood
 *  - drei <Environment> with Lightformers for believable paint/chrome/glass
 *    reflections (no HDRI download, renders on first frame)
 *  - MeshReflectorMaterial asphalt for road reflections
 *  - Volumetric-style headlight cones + warm light pools
 *  - Slow dolly rig: front-3/4 camera, truck framed on the RIGHT so the
 *    headline never sits over the vehicle.
 *
 * Motion is automotive-commercial subtle: rolling wheels, road dashes,
 * gentle dolly + mouse parallax, soft sway. No spinning, no bouncing.
 */

const ROAD_LENGTH = 160;
const DASH_COUNT = 14;
const DASH_GAP = 6;

/* ------------------------------------------------------------------ */
/* Road                                                                */
/* ------------------------------------------------------------------ */

function Road({ lite }: { lite: boolean }) {
  return (
    <group>
      {/* Reflective asphalt — highway runs along X */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROAD_LENGTH, 16]} />
        <MeshReflectorMaterial
          resolution={lite ? 512 : 1024}
          blur={lite ? [200, 60] : [400, 100]}
          mixBlur={1}
          mixStrength={lite ? 1.6 : 2.4}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.2}
          color="#10141b"
          metalness={0.45}
          roughness={0.88}
          mirror={lite ? 0.3 : 0.5}
        />
      </mesh>

      {/* Lane dashes — scrolled toward -X each frame (truck travels +X) */}
      <LaneDashes lite={lite} />

      {/* Solid edge lines along the highway */}
      {[5.4, -5.4].map((z) => (
        <mesh key={z} position={[0, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ROAD_LENGTH, 0.15]} />
          <meshStandardMaterial color="#9aa7b8" roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function LaneDashes({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const count = lite ? 9 : DASH_COUNT;
  const span = count * DASH_GAP;

  useFrame((_, delta) => {
    if (!group.current) return;
    const speed = lite ? 4 : 6.5;
    for (const child of group.current.children) {
      child.position.x -= speed * delta;
      if (child.position.x < -span + 24) child.position.x += span;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[60 - i * DASH_GAP, 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[2.2, 0.16]} />
          <meshStandardMaterial color="#cfd6df" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Landscape                                                           */
/* ------------------------------------------------------------------ */

function Terrain() {
  const hills = useMemo(
    () =>
      [-1, 1].flatMap((side) =>
        Array.from({ length: 6 }).map((_, i) => ({
          key: `${side}-${i}`,
          x: -30 - i * 24 + (side === 1 ? 12 : 0),
          z: side * (24 + (i % 3) * 16),
          r: 11 + (i % 3) * 4,
          rot: side > 0 ? 0.4 : -0.4,
        })),
      ),
    [],
  );

  return (
    <>
      {/* Dark landscape plane slightly below road level */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#0b1017" roughness={1} />
      </mesh>
      {/* Distant low hills catching the last light */}
      {hills.map((h) => (
        <mesh key={h.key} position={[h.x, -1.6, h.z]} rotation={[-Math.PI / 2, 0, h.rot]}>
          <circleGeometry args={[h.r, 9]} />
          <meshStandardMaterial color="#0e1521" roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Highway furniture                                                   */
/* ------------------------------------------------------------------ */

/** Streetlight on the far side of the road; arm reaches toward +Z. */
function Streetlight({ x, z }: { x: number; z: number }) {
  const pool = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (pool.current) {
      const m = pool.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.05 + Math.sin(clock.elapsedTime * 1.7 + x) * 0.008;
    }
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 5.4, 8]} />
        <meshStandardMaterial color="#1a2432" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 5.25, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 8]} />
        <meshStandardMaterial color="#1a2432" roughness={0.6} />
      </mesh>
      <mesh position={[0, 5.2, 1.05]}>
        <boxGeometry args={[0.26, 0.13, 0.55]} />
        <meshStandardMaterial color="#e8eef5" emissive="#ffd9a0" emissiveIntensity={2.4} />
      </mesh>
      {/* Warm pool of light on the asphalt */}
      <mesh ref={pool} position={[0, 0.02, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.8, 24]} />
        <meshBasicMaterial color="#f7c97e" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}

function HighwayProps({ lite }: { lite: boolean }) {
  return (
    <group>
      {/* Guardrails both sides, running along X */}
      {[5.75, -5.75].map((z) => (
        <group key={z}>
          {Array.from({ length: lite ? 12 : 22 }).map((_, i) => (
            <mesh key={i} position={[30 - i * 4.5, 0.45, z]}>
              <boxGeometry args={[0.09, 0.9, 0.09]} />
              <meshStandardMaterial color="#232d3c" roughness={0.7} metalness={0.4} />
            </mesh>
          ))}
          <mesh position={[-20, 0.82, z]}>
            <boxGeometry args={[ROAD_LENGTH, 0.3, 0.06]} />
            <meshStandardMaterial color="#33404f" metalness={0.6} roughness={0.45} />
          </mesh>
        </group>
      ))}
      {/* Streetlights along the far side */}
      {Array.from({ length: lite ? 4 : 7 }).map((_, i) => (
        <Streetlight key={i} x={24 - i * 12} z={-6.6} />
      ))}
      {/* Distant signal gantry across the highway, ahead of the truck */}
      <group position={[-52, 0, 0]}>
        {[4.8, -4.8].map((z) => (
          <mesh key={z} position={[0, 3.4, z]}>
            <cylinderGeometry args={[0.1, 0.1, 6.8, 8]} />
            <meshStandardMaterial color="#1a2432" />
          </mesh>
        ))}
        <mesh position={[0, 6.7, 0]}>
          <boxGeometry args={[0.2, 0.55, 10]} />
          <meshStandardMaterial color="#1a2432" />
        </mesh>
        <mesh position={[0.12, 6.35, -1.6]}>
          <boxGeometry args={[0.05, 0.3, 1.4]} />
          <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={1.6} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Atmosphere                                                          */
/* ------------------------------------------------------------------ */

/** Tiny deterministic PRNG — render-pure stand-in for Math.random(). */
function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ count = 90 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    // Deterministic PRNG: pure for useMemo, same organic spread per mount.
    const rand = mulberry32(0x5a17); 
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * ROAD_LENGTH;
      arr[i * 3 + 1] = rand() * 5.5 + 0.3;
      arr[i * 3 + 2] = (rand() - 0.5) * 26;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) - 0.004 - (i % 3) * 0.001;
      pos.setY(i, y < 0.1 ? 5.5 : y);
      pos.setZ(i, pos.getZ(i) + Math.sin(t * 0.4 + i) * 0.002);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#d8c9a8"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* Headlights: real spotlights + fake volumetric cones + road pools     */
/* ------------------------------------------------------------------ */

function HeadlightBeams({ lite }: { lite: boolean }) {
  const targetL = useMemo(() => new THREE.Object3D(), []);
  const targetR = useMemo(() => new THREE.Object3D(), []);

  return (
    <group>
      {/* Spotlight targets far down the road (+X = travel direction) */}
      <primitive object={targetL} position={[26, 0.4, 1.4]} />
      <primitive object={targetR} position={[26, 0.4, -1.4]} />

      <spotLight
        position={[3.5, 1.02, 0.88]}
        target={targetL}
        angle={0.32}
        penumbra={0.7}
        distance={34}
        intensity={lite ? 40 : 70}
        color="#ffedc4"
      />
      <spotLight
        position={[3.5, 1.02, -0.88]}
        target={targetR}
        angle={0.32}
        penumbra={0.7}
        distance={34}
        intensity={lite ? 40 : 70}
        color="#ffedc4"
      />

      {/* Volumetric-style cones (additive, barely-there), pointing +X */}
      {!lite &&
        [0.88, -0.88].map((z) => (
          <mesh
            key={z}
            position={[8.1, 0.9, z]}
            rotation={[0, 0, -Math.PI / 2 - 0.045]}
          >
            <coneGeometry args={[1.15, 9.2, 24, 1, true]} />
            <meshBasicMaterial
              color="#ffe9c0"
              transparent
              opacity={0.05}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

      {/* Warm ellipses where the beams land */}
      {[1.4, -1.4].map((z) => (
        <mesh key={z} position={[9.5, 0.025, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.7, 20]} />
          <meshBasicMaterial
            color="#ffe2ae"
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The truck                                                           */
/* ------------------------------------------------------------------ */

function MovingTruck({
  lite,
  mouse,
}: {
  lite: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    // Road-surface vibration — barely perceptible.
    group.current.position.y = Math.sin(t * 9) * 0.008 + Math.sin(t * 23) * 0.004;
    group.current.rotation.z = Math.sin(t * 7) * 0.004;
    // Subtle mouse-follow yaw.
    const targetYaw = mouse.current.x * 0.05;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetYaw, 0.03);
  });

  return (
    <group ref={group}>
      <TruckModel rolling detail={!lite} brandText="SATGURU TRANSPORT" />
      {!lite && (
        <ContactShadows position={[0, 0.03, 0]} opacity={0.5} scale={18} blur={2.6} far={4.5} frames={1} />
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig                                                          */
/* ------------------------------------------------------------------ */

function Rig({
  mouse,
  lite,
}: {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  lite: boolean;
}) {
  const vec = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = mouse.current;
    // Slow dolly: arc slightly closer + higher, easing out. Layered with
    // mouse parallax. Front-3/4 on the truck; look-at shifted LEFT so the
    // vehicle frames on the RIGHT of the viewport — the headline overlay
    // owns the left third.
    const k = Math.min(t * 0.05, 1);
    const ease = 1 - Math.pow(1 - k, 2.2);
    vec.set(
      5.2 + ease * (lite ? 0.4 : 0.8) + m.x * 0.45,
      2.1 + ease * 0.3 + m.y * 0.22,
      8.4 - ease * (lite ? 0.5 : 0.9),
    );
    state.camera.position.lerp(vec, 0.035);
    look.set(-4.6 + m.x * 0.35, 1.55 + m.y * 0.18, 0);
    state.camera.lookAt(look);
  });
  return null;
}

/* ------------------------------------------------------------------ */
/* Scene assembly                                                      */
/* ------------------------------------------------------------------ */

export function HeroSceneContent({ lite = false }: { lite?: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });

  // Track pointer without forcing re-renders. useEffect — NOT useMemo —
  // so subscribe/unsubscribe runs in the commit phase, not during render.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const sunPosition = useMemo(() => new THREE.Vector3(26, 7, 16), []);

  return (
    <>
      <fog attach="fog" args={["#0a0e14", 26, 95]} />
      <color attach="background" args={["#0a0e14"]} />

      {/* Golden-hour sky (Preetham, local — no HDR fetch) */}
      <Sky
        distance={4000}
        sunPosition={sunPosition}
        turbidity={6.5}
        rayleigh={2.2}
        mieCoefficient={0.025}
        mieDirectionalG={0.9}
      />

      {/* Reflection probe from lightformers — believable paint, chrome and
          glass with zero network requests. Rendered once. */}
      <Environment resolution={lite ? 64 : 256} frames={1} background={false}>
        <color attach="background" args={["#0b0f16"]} />
        <Lightformer form="rect" intensity={lite ? 1.2 : 2} color="#ffd9a0" scale={[12, 2.5, 1]} position={[-14, 5, -8]} rotation={[0, Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={lite ? 0.6 : 1.1} color="#9db8e8" scale={[10, 2, 1]} position={[10, 6, 6]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={lite ? 0.5 : 0.9} color="#ffffff" scale={[6, 1.2, 1]} position={[2, 9, 2]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="circle" intensity={lite ? 0.7 : 1.3} color="#ffe6bd" scale={4} position={[-6, 3, 8]} />
      </Environment>

      {/* Three-point cinematic lighting: warm sun key from the front-right
          (lights the camera-facing faces), warm rim from behind-left, cool fill */}
      <ambientLight intensity={0.5} color="#aebfd8" />
      <directionalLight
        position={sunPosition}
        intensity={lite ? 1.6 : 2.3}
        color="#ffd9a0"
        castShadow={!lite}
        shadow-mapSize={lite ? 1024 : 2048}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
      />
      {/* Warm rim light separating the truck from the road behind it */}
      <directionalLight position={[-14, 5, -8]} intensity={0.9} color="#ffd9a0" />
      {/* Cool environmental fill from the opposite side */}
      <directionalLight position={[10, 7, 9]} intensity={0.45} color="#8fb0ff" />
      {/* Soft warm bounce under the skyline */}
      <hemisphereLight args={["#3d4a63", "#141a24", 0.55]} />

      <Road lite={lite} />
      <Terrain />
      <HighwayProps lite={lite} />
      <Particles count={lite ? 40 : 90} />
      <HeadlightBeams lite={lite} />
      <MovingTruck lite={lite} mouse={mouse} />
      <Rig mouse={mouse} lite={lite} />
    </>
  );
}
