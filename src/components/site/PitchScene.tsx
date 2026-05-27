import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";

/* ---------- Stadium ring (low-poly, atmospheric) ---------- */
function StadiumRing() {
  return (
    <group position={[0, -0.05, 0]}>
      {/* Field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[14, 96]} />
        <meshStandardMaterial color="#1a3a24" roughness={1} metalness={0} />
      </mesh>
      {/* Inner field tone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[6.5, 8.5, 96]} />
        <meshBasicMaterial color="#22512f" transparent opacity={0.55} />
      </mesh>
      {/* 30-yard circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[6.45, 6.55, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </mesh>
      {/* Boundary rope */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[13.6, 13.85, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>

      {/* Stand ring */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[16, 14, 2.8, 96, 1, true]} />
        <meshStandardMaterial
          color="#0b1620"
          side={THREE.DoubleSide}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {/* Stand top trim */}
      <mesh position={[0, 2.85, 0]}>
        <torusGeometry args={[16, 0.08, 8, 96]} />
        <meshStandardMaterial color="#16e0e0" emissive="#0ad" emissiveIntensity={1.2} />
      </mesh>

      {/* Floodlight pylons */}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const r = 16.5;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh position={[0, 3.5, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 7, 8]} />
              <meshStandardMaterial color="#2a3340" />
            </mesh>
            <mesh position={[0, 7.1, 0]}>
              <boxGeometry args={[1.4, 0.5, 0.25]} />
              <meshStandardMaterial
                color="#0e1a26"
                emissive="#bfeaff"
                emissiveIntensity={2.2}
              />
            </mesh>
            {/* Light cone */}
            <pointLight
              position={[0, 7, 0]}
              color="#cfeeff"
              intensity={2.5}
              distance={28}
              decay={1.4}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ---------- Pitch (22-yard strip) ---------- */
function Pitch() {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.4, 9, 1, 1]} />
        <meshStandardMaterial color="#b89465" roughness={0.95} />
      </mesh>
      {/* Crease lines */}
      {[3.6, -3.6].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, z]}>
          <planeGeometry args={[2.4, 0.06]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {[3.0, -3.0].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, z]}>
          <planeGeometry args={[1.6, 0.04]} />
          <meshBasicMaterial color="#ffffff" opacity={0.7} transparent />
        </mesh>
      ))}

      {/* Stumps */}
      {[3.7, -3.7].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {[-0.12, 0, 0.12].map((x) => (
            <mesh key={x} position={[x, 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
              <meshStandardMaterial color="#f5f1e8" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Heat zone (good length, off stump) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.012, 1.6]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#ff5a3c" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.012, 0.4]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial color="#16e0e0" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/* ---------- Ball trajectory (animated path + ball) ---------- */
function Trajectory() {
  const ballRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  // Curve from bowler end to batter end, with a bounce on a "good length"
  const { curve, points } = useMemo(() => {
    const start = new THREE.Vector3(0.05, 1.9, -3.9);
    const release = new THREE.Vector3(0.1, 2.1, -3.6);
    const preBounce = new THREE.Vector3(0.25, 0.9, 0.4);
    const bounce = new THREE.Vector3(0.3, 0.02, 1.6);
    const postBounce = new THREE.Vector3(0.18, 0.55, 2.6);
    const stumps = new THREE.Vector3(0.0, 0.45, 3.7);
    const c = new THREE.CatmullRomCurve3(
      [start, release, preBounce, bounce, postBounce, stumps],
      false,
      "catmullrom",
      0.2,
    );
    const pts = c.getPoints(120);
    return { curve: c, points: pts };
  }, []);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() % 3.2) / 3.2;
    const p = curve.getPoint(t);
    if (ballRef.current) {
      ballRef.current.position.copy(p);
      ballRef.current.rotation.x += 0.3;
      ballRef.current.rotation.y += 0.2;
    }
    // Pulse the trail a touch
    if (trailRef.current) {
      const m = trailRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.55 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <group>
      <line>
        <primitive object={lineGeom} attach="geometry" />
        <lineBasicMaterial
          attach="material"
          color="#16e0e0"
          transparent
          opacity={0.8}
          linewidth={2}
        />
      </line>
      {/* Tube glow */}
      <mesh ref={trailRef}>
        <tubeGeometry args={[curve, 120, 0.018, 8, false]} />
        <meshBasicMaterial color="#16e0e0" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial
          color="#e8c07a"
          emissive="#ff7a2a"
          emissiveIntensity={0.5}
          roughness={0.5}
        />
      </mesh>
      {/* Bounce mark */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.3, 0.013, 1.6]}>
        <ringGeometry args={[0.05, 0.09, 24]} />
        <meshBasicMaterial color="#16e0e0" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/* ---------- Subtle camera dolly + parallax ---------- */
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cam = state.camera;
    const mx = state.pointer.x;
    const my = state.pointer.y;
    const targetX = Math.sin(t * 0.15) * 0.6 + mx * 0.8;
    const targetY = 4.4 + Math.sin(t * 0.2) * 0.15 - my * 0.4;
    cam.position.x += (targetX - cam.position.x) * 0.04;
    cam.position.y += (targetY - cam.position.y) * 0.04;
    cam.lookAt(0, 0.4, 0.4);
  });
  return null;
}

/* ---------- Main scene ---------- */
export function PitchScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 4.4, 8.2], fov: 38 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#06121a", 14, 30]} />

      {/* Lighting */}
      <ambientLight intensity={0.35} color="#bcd8ff" />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.5} color="#16e0e0" />
      <pointLight position={[0, 6, 0]} intensity={0.6} color="#ff7a2a" distance={10} />

      <Suspense fallback={null}>
        <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.15}>
          <group rotation={[0, 0.05, 0]}>
            <StadiumRing />
            <Pitch />
            <Trajectory />
          </group>
        </Float>
        <Environment preset="night" />
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}

export default PitchScene;
