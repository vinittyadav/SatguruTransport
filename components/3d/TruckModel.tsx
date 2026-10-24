"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

/**
 * Procedural premium commercial truck — cab-over tractor + box trailer,
 * the configuration typical of Indian fleet vehicles.
 *
 * Design goals:
 *  - Believable proportions and softened automotive surfaces (RoundedBox)
 *  - Separated PBR materials: metallic paint / glass / chrome / rubber /
 *    steel / emissive lights
 *  - Detailed wheels (hub, lug nuts) that roll while the hero plays
 *  - Undercarriage detail: fuel tanks, battery box, driveshaft, landing gear
 *  - Restrained SATGURU TRANSPORT branding — like a real fleet vehicle
 * No external assets; everything degrades gracefully via the `detail` flag.
 */

const NAVY = "#14213a";
const AMBER = "#f5a623";

export interface TruckModelProps {
  brandText?: string;
  cabColor?: string;
  trailerColor?: string;
  wheelRadius?: number;
  /** Spin the wheels (hero). Disable for static showroom-style shots. */
  rolling?: boolean;
  /** lite tier: skip fine detail geometry for performance */
  detail?: boolean;
}

function useMaterials(cabColor: string, trailerColor: string) {
  return useMemo(() => {
    const paint = new THREE.MeshPhysicalMaterial({
      color: cabColor,
      metalness: 0.82,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.25,
    });
    const paintTrim = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cabColor).multiplyScalar(0.55),
      metalness: 0.6,
      roughness: 0.45,
    });
    const trailer = new THREE.MeshPhysicalMaterial({
      color: trailerColor,
      metalness: 0.55,
      roughness: 0.42,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      envMapIntensity: 1.1,
    });
    const trailerRib = new THREE.MeshStandardMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0.16,
      roughness: 0.8,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: "#0a1220",
      metalness: 0.9,
      roughness: 0.06,
      clearcoat: 1,
      envMapIntensity: 2.2,
    });
    const chrome = new THREE.MeshStandardMaterial({
      color: "#d9dee5",
      metalness: 1,
      roughness: 0.08,
      envMapIntensity: 1.8,
    });
    const steel = new THREE.MeshStandardMaterial({
      color: "#39424f",
      metalness: 0.85,
      roughness: 0.35,
    });
    const darkSteel = new THREE.MeshStandardMaterial({
      color: "#1c222c",
      metalness: 0.6,
      roughness: 0.6,
    });
    const rubber = new THREE.MeshStandardMaterial({
      color: "#111418",
      metalness: 0.05,
      roughness: 0.95,
    });
    const plastic = new THREE.MeshStandardMaterial({
      color: "#15181d",
      metalness: 0.2,
      roughness: 0.7,
    });
    const headlight = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      emissive: "#fff3d0",
      emissiveIntensity: 2.4,
    });
    const amberLight = new THREE.MeshStandardMaterial({
      color: AMBER,
      emissive: AMBER,
      emissiveIntensity: 1.7,
    });
    const tailLight = new THREE.MeshStandardMaterial({
      color: "#ff2a2a",
      emissive: "#c8102e",
      emissiveIntensity: 1.4,
    });
    const brandStripe = new THREE.MeshStandardMaterial({
      color: AMBER,
      metalness: 0.4,
      roughness: 0.4,
    });
    return {
      paint,
      paintTrim,
      trailer,
      trailerRib,
      glass,
      chrome,
      steel,
      darkSteel,
      rubber,
      plastic,
      headlight,
      amberLight,
      tailLight,
      brandStripe,
    };
  }, [cabColor, trailerColor]);
}

type Mats = ReturnType<typeof useMaterials>;

/** Wheel: rubber tire + chrome hub + center cap + lug nuts. Rolls on X. */
function Wheel({
  position,
  radius,
  detail,
  rolling,
  mats,
}: {
  position: [number, number, number];
  radius: number;
  detail: boolean;
  rolling: boolean;
  mats: Mats;
}) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rolling && spin.current) {
      // Axle points along world +Z (local Y after the PI/2 X-rotation);
      // rolling toward +X is a positive rotation about that axis.
      spin.current.rotation.y += delta * 5.2;
    }
  });

  const lugs = useMemo(
    () =>
      detail
        ? Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return [Math.cos(a) * 0.15, Math.sin(a) * 0.15] as const;
          })
        : [],
    [detail],
  );

  return (
    <group position={position}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <group ref={spin}>
          {/* Tire */}
          <mesh castShadow>
            <cylinderGeometry args={[radius, radius, 0.34, detail ? 32 : 18]} />
            <primitive object={mats.rubber} attach="material" />
          </mesh>
          {/* Tread shoulder ring */}
          <mesh>
            <torusGeometry args={[radius * 0.86, 0.035, 8, detail ? 28 : 14]} />
            <primitive object={mats.plastic} attach="material" />
          </mesh>
          {/* Chrome hub face */}
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[radius * 0.48, radius * 0.48, 0.05, 24]} />
            <primitive object={mats.chrome} attach="material" />
          </mesh>
          {/* Center cap */}
          <mesh position={[0, 0.19, 0]}>
            <cylinderGeometry args={[radius * 0.2, radius * 0.2, 0.05, 16]} />
            <primitive object={mats.steel} attach="material" />
          </mesh>
          {/* Lug nuts on the outboard face */}
          {lugs.map(([lx, ly], i) => (
            <mesh key={i} position={[lx, 0.19, ly]}>
              <cylinderGeometry args={[0.032, 0.032, 0.05, 6]} />
              <primitive object={mats.chrome} attach="material" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

/** Cab-over tractor unit. */
function Cab({ detail, mats }: { detail: boolean; mats: Mats }) {
  const mirrors = detail;
  return (
    <group>
      {/* Main cab body — rounded automotive surfaces */}
      <RoundedBox
        args={[1.9, 2.3, 2.4]}
        radius={0.14}
        smoothness={4}
        position={[2.3, 1.92, 0]}
        castShadow
      >
        <primitive object={mats.paint} attach="material" />
      </RoundedBox>
      {/* Lower cab / step panel */}
      <RoundedBox
        args={[1.78, 0.55, 2.3]}
        radius={0.06}
        smoothness={3}
        position={[2.34, 0.88, 0]}
      >
        <primitive object={mats.paintTrim} attach="material" />
      </RoundedBox>
      {/* Roof + deflector sloping back toward the trailer */}
      <mesh position={[1.72, 3.18, 0]} rotation={[0, 0, -0.42]} castShadow>
        <boxGeometry args={[1.15, 0.07, 2.2]} />
        <primitive object={mats.paint} attach="material" />
      </mesh>
      {/* Sun visor over the windshield */}
      <mesh position={[3.24, 2.94, 0]} rotation={[0, 0, 0.18]}>
        <boxGeometry args={[0.34, 0.07, 2.28]} />
        <primitive object={mats.paint} attach="material" />
      </mesh>
      {/* Windshield — large, slightly raked */}
      <mesh position={[3.27, 2.42, 0]} rotation={[0, 0, -0.06]}>
        <boxGeometry args={[0.05, 1.02, 2.08]} />
        <primitive object={mats.glass} attach="material" />
      </mesh>
      {/* Side windows + door seams */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh position={[2.42, 2.5, s * 1.21]}>
            <boxGeometry args={[1.15, 0.62, 0.04]} />
            <primitive object={mats.glass} attach="material" />
          </mesh>
          {/* Door split line */}
          <mesh position={[2.35, 1.7, s * 1.22]}>
            <boxGeometry args={[0.02, 1.35, 0.015]} />
            <primitive object={mats.plastic} attach="material" />
          </mesh>
          {/* Door handle */}
          <mesh position={[2.02, 2.06, s * 1.23]}>
            <boxGeometry args={[0.16, 0.05, 0.03]} />
            <primitive object={mats.chrome} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Grille surround + horizontal chrome bars */}
      <mesh position={[3.3, 1.42, 0]}>
        <boxGeometry args={[0.06, 0.72, 1.98]} />
        <primitive object={mats.plastic} attach="material" />
      </mesh>
      {[1.62, 1.42, 1.22].map((y, i) => (
        <mesh key={i} position={[3.33, y, 0]}>
          <boxGeometry args={[0.03, 0.09, 1.86]} />
          <primitive object={mats.chrome} attach="material" />
        </mesh>
      ))}
      {/* Headlights + amber indicators */}
      {[0.88, -0.88].map((z) => (
        <mesh key={`hl${z}`} position={[3.34, 1.05, z]}>
          <boxGeometry args={[0.05, 0.2, 0.4]} />
          <primitive object={mats.headlight} attach="material" />
        </mesh>
      ))}
      {[0.42, -0.42].map((z) => (
        <mesh key={`ind${z}`} position={[3.34, 1.05, z]}>
          <boxGeometry args={[0.05, 0.14, 0.22]} />
          <primitive object={mats.amberLight} attach="material" />
        </mesh>
      ))}
      {/* Bumper with step pads */}
      <RoundedBox
        args={[0.2, 0.48, 2.44]}
        radius={0.06}
        smoothness={3}
        position={[3.42, 0.6, 0]}
        castShadow
      >
        <primitive object={mats.steel} attach="material" />
      </RoundedBox>
      {[0.5, -0.5].map((z) => (
        <mesh key={`step${z}`} position={[3.44, 0.48, z]}>
          <boxGeometry args={[0.1, 0.06, 0.34]} />
          <primitive object={mats.plastic} attach="material" />
        </mesh>
      ))}
      {/* Mirror arms + heads */}
      {mirrors &&
        [1, -1].map((s) => (
          <group key={`mir${s}`}>
            <mesh position={[2.72, 2.86, s * 1.32]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.4, 0.045, 0.045]} />
              <primitive object={mats.darkSteel} attach="material" />
            </mesh>
            <mesh position={[2.52, 2.68, s * 1.44]}>
              <boxGeometry args={[0.06, 0.52, 0.26]} />
              <primitive object={mats.plastic} attach="material" />
            </mesh>
          </group>
        ))}
      {/* Exhaust stack behind the cab (right side) */}
      <mesh position={[1.3, 1.9, -1.3]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 2.35, 14]} />
        <primitive object={mats.chrome} attach="material" />
      </mesh>
      <mesh position={[1.3, 3.12, -1.3]}>
        <cylinderGeometry args={[0.11, 0.09, 0.16, 14]} />
        <primitive object={mats.darkSteel} attach="material" />
      </mesh>
      {/* Amber accent stripe along the cab skirt */}
      {[1, -1].map((s) => (
        <mesh key={`stripe${s}`} position={[2.34, 0.66, s * 1.16]}>
          <boxGeometry args={[1.75, 0.07, 0.02]} />
          <primitive object={mats.brandStripe} attach="material" />
        </mesh>
      ))}
      {/* Cab door branding */}
      {detail &&
        [1, -1].map((s) => (
          <Text
            key={`door${s}`}
            position={[2.35, 2.02, s * 1.235]}
            rotation={[0, s > 0 ? 0 : Math.PI, 0]}
            fontSize={0.13}
            color={NAVY}
            letterSpacing={0.08}
            anchorX="center"
            anchorY="middle"
          >
            SATGURU
          </Text>
        ))}
    </group>
  );
}

/** Box trailer with ribs, rear doors, lights, landing gear, branding. */
function Trailer({
  brandText,
  detail,
  mats,
}: {
  brandText: string;
  detail: boolean;
  mats: Mats;
}) {
  const ribs = useMemo(
    () => Array.from({ length: detail ? 9 : 5 }).map((_, i, arr) => -2.9 + i * (5.8 / (arr.length - 1))),
    [detail],
  );
  return (
    <group>
      {/* Container body */}
      <RoundedBox
        args={[6.4, 2.75, 2.45]}
        radius={0.07}
        smoothness={3}
        position={[-2.15, 2.53, 0]}
        castShadow
      >
        <primitive object={mats.trailer} attach="material" />
      </RoundedBox>
      {/* Vertical side ribs */}
      {ribs.map((x) =>
        [1, -1].map((s) => (
          <mesh key={`${x}-${s}`} position={[x, 2.53, s * 1.235]}>
            <boxGeometry args={[0.07, 2.5, 0.02]} />
            <primitive object={mats.trailerRib} attach="material" />
          </mesh>
        )),
      )}
      {/* Rear doors + lock rods */}
      {[0.6, -0.6].map((z) => (
        <mesh key={`door${z}`} position={[-5.37, 2.53, z]}>
          <boxGeometry args={[0.05, 2.55, 1.16]} />
          <primitive object={mats.trailer} attach="material" />
        </mesh>
      ))}
      {detail &&
        [0.35, -0.35].map((z) =>
          [1.9, 3.1].map((y) => (
            <mesh key={`rod${z}-${y}`} position={[-5.42, y, z]}>
              <cylinderGeometry args={[0.02, 0.02, 0.34, 8]} />
              <primitive object={mats.steel} attach="material" />
            </mesh>
          )),
        )}
      {/* Amber marker lights — top front + top rear rows */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((z) => (
        <group key={`mk${z}`}>
          <mesh position={[1.07, 3.84, z]}>
            <boxGeometry args={[0.04, 0.09, 0.16]} />
            <primitive object={mats.amberLight} attach="material" />
          </mesh>
          <mesh position={[-5.38, 3.84, z]}>
            <boxGeometry args={[0.04, 0.09, 0.16]} />
            <primitive object={mats.amberLight} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Tail lights + indicators */}
      {[0.95, -0.95].map((z) => (
        <group key={`tail${z}`}>
          <mesh position={[-5.4, 1.0, z]}>
            <boxGeometry args={[0.04, 0.16, 0.36]} />
            <primitive object={mats.tailLight} attach="material" />
          </mesh>
          <mesh position={[-5.4, 1.2, z]}>
            <boxGeometry args={[0.04, 0.1, 0.36]} />
            <primitive object={mats.amberLight} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Rear underrun bar + supports */}
      <mesh position={[-5.28, 0.62, 0]}>
        <boxGeometry args={[0.12, 0.18, 2.2]} />
        <primitive object={mats.steel} attach="material" />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={`ur${s}`} position={[-5.28, 0.85, s * 1.05]}>
          <boxGeometry args={[0.1, 0.5, 0.08]} />
          <primitive object={mats.darkSteel} attach="material" />
        </mesh>
      ))}
      {/* Mud flaps behind the rearmost wheels */}
      {[1, -1].map((s) => (
        <mesh key={`flap${s}`} position={[-4.32, 0.42, s * 1.0]}>
          <boxGeometry args={[0.05, 0.6, 0.34]} />
          <primitive object={mats.rubber} attach="material" />
        </mesh>
      ))}
      {/* Landing gear */}
      {detail &&
        [1, -1].map((s) => (
          <group key={`lg${s}`}>
            <mesh position={[-1.25, 0.62, s * 0.55]}>
              <boxGeometry args={[0.14, 0.95, 0.12]} />
              <primitive object={mats.darkSteel} attach="material" />
            </mesh>
            <mesh position={[-1.25, 0.12, s * 0.55]}>
              <boxGeometry args={[0.3, 0.06, 0.24]} />
              <primitive object={mats.steel} attach="material" />
            </mesh>
          </group>
        ))}
      {/* Side guard rails */}
      {detail &&
        [1, -1].map((s) => (
          <group key={`gr${s}`}>
            <mesh position={[-2.6, 0.98, s * 1.08]}>
              <boxGeometry args={[3.2, 0.07, 0.05]} />
              <primitive object={mats.steel} attach="material" />
            </mesh>
            {[-3.9, -2.6, -1.3].map((x) => (
              <mesh key={x} position={[x, 0.78, s * 1.08]}>
                <boxGeometry args={[0.06, 0.5, 0.05]} />
                <primitive object={mats.steel} attach="material" />
              </mesh>
            ))}
          </group>
        ))}
      {/* Branding — side lettering + amber underline, like a real fleet unit */}
      {[1, -1].map((s) => (
        <group key={`brand${s}`}>
          {brandText && (
            <Text
              position={[-1.9, 2.86, s * 1.235]}
              rotation={[0, s > 0 ? 0 : Math.PI, 0]}
              fontSize={0.33}
              color={NAVY}
              letterSpacing={0.05}
              anchorX="center"
              anchorY="middle"
            >
              {brandText}
            </Text>
          )}
          <mesh position={[-1.9, 2.6, s * 1.24]}>
            <boxGeometry args={[3.4, 0.06, 0.015]} />
            <primitive object={mats.brandStripe} attach="material" />
          </mesh>
        </group>
      ))}
      {/* Rear door lettering */}
      {brandText && detail && (
        <Text
          position={[-5.44, 3.2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.2}
          color={NAVY}
          letterSpacing={0.06}
          anchorX="center"
          anchorY="middle"
        >
          {brandText}
        </Text>
      )}
    </group>
  );
}

/** Chassis + undercarriage: rails, tanks, battery box, driveshaft. */
function Chassis({ detail, mats }: { detail: boolean; mats: Mats }) {
  return (
    <group>
      {/* Frame rails */}
      <mesh position={[-0.85, 0.62, 0]} castShadow>
        <boxGeometry args={[7.1, 0.24, 0.7]} />
        <primitive object={mats.darkSteel} attach="material" />
      </mesh>
      {/* Fifth-wheel / kingpin plate under the trailer front */}
      <mesh position={[0.6, 0.78, 0]}>
        <boxGeometry args={[0.9, 0.08, 1.3]} />
        <primitive object={mats.steel} attach="material" />
      </mesh>
      {/* Chrome fuel tanks, both sides */}
      {[1, -1].map((s) => (
        <group key={`tank${s}`}>
          <mesh position={[-0.35, 0.6, s * 0.62]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 1.15, 18]} />
            <primitive object={mats.chrome} attach="material" />
          </mesh>
          {[-0.75, 0.05].map((x) => (
            <mesh key={x} position={[-0.35 + x, 0.6, s * 0.62]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.225, 0.014, 6, 20]} />
              <primitive object={mats.darkSteel} attach="material" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Battery box */}
      <mesh position={[-1.35, 0.66, 0.62]}>
        <boxGeometry args={[0.72, 0.36, 0.26]} />
        <primitive object={mats.steel} attach="material" />
      </mesh>
      {/* Air filter canister */}
      {detail && (
        <mesh position={[1.05, 0.95, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.5, 12]} />
          <primitive object={mats.steel} attach="material" />
        </mesh>
      )}
      {/* Driveshaft */}
      {detail && (
        <mesh position={[-1.4, 0.52, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.1, 10]} />
          <primitive object={mats.steel} attach="material" />
        </mesh>
      )}
      {/* Leaf spring blocks over the drive axle */}
      {detail &&
        [1, -1].map((s) => (
          <mesh key={`ls${s}`} position={[-0.6, 0.82, s * 0.55]}>
            <boxGeometry args={[0.95, 0.1, 0.14]} />
            <primitive object={mats.darkSteel} attach="material" />
          </mesh>
        ))}
    </group>
  );
}

export function TruckModel({
  brandText = "SATGURU TRANSPORT",
  cabColor = "#eef1f5",
  trailerColor = "#e6eaef",
  wheelRadius = 0.52,
  rolling = false,
  detail = true,
}: TruckModelProps) {
  const mats = useMaterials(cabColor, trailerColor);

  return (
    <group>
      <Chassis detail={detail} mats={mats} />
      <Cab detail={detail} mats={mats} />
      <Trailer brandText={brandText} detail={detail} mats={mats} />
      {/* Front axle, drive axle, trailer bogie */}
      <Wheel position={[2.3, wheelRadius, 1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[2.3, wheelRadius, -1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-0.6, wheelRadius, 1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-0.6, wheelRadius, -1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-2.95, wheelRadius, 1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-2.95, wheelRadius, -1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-3.75, wheelRadius, 1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
      <Wheel position={[-3.75, wheelRadius, -1.02]} radius={wheelRadius} detail={detail} rolling={rolling} mats={mats} />
    </group>
  );
}
