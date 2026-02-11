"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";

// Location data
interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

const LOCATIONS: Location[] = [
  { id: "nyc", name: "New York", country: "USA", lat: 40.7128, lng: -74.006 },
  { id: "sf", name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { id: "india", name: "New Delhi", country: "India", lat: 28.6139, lng: 77.209 },
  { id: "singapore", name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { id: "indonesia", name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456 },
];

const GLOBE_RADIUS = 2.0;

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Simplex noise GLSL (shared with HeroCanvas)
const simplexNoise = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const globeVertexShader = `
  ${simplexNoise}
  uniform float uTime;
  attribute float aRandomness;
  varying float vNoise;

  void main() {
    vec3 pos = position;
    float noise = snoise(pos * 2.0 + uTime * 0.1) * 0.02;
    pos += normalize(pos) * noise;
    vNoise = noise;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (2.0 + aRandomness * 1.5) * (1.0 / -mvPosition.z) * 50.0;
  }
`;

const globeFragmentShader = `
  varying float vNoise;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

    vec3 teal = vec3(0.15, 0.50, 0.40);
    vec3 purple = vec3(0.35, 0.28, 0.50);
    float mixFactor = vNoise * 0.5 + 0.5;
    vec3 color = mix(teal, purple, mixFactor * 0.3);

    gl_FragColor = vec4(color, alpha * 0.35);
  }
`;

// Generate fibonacci-distributed points on a sphere
function generateGlobePoints(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;

    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  return positions;
}

function GlobeDots({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, randomness } = useMemo(() => {
    const pos = generateGlobePoints(count, GLOBE_RADIUS);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    return { positions: pos, randomness: rand };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    const points = pointsRef.current;
    return () => {
      if (points) {
        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
      }
    };
  }, []);

  return (
    <points ref={pointsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandomness"
          count={count}
          array={randomness}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={globeVertexShader}
        fragmentShader={globeFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function LocationMarker({
  location,
  isActive,
  onHover,
}: {
  location: Location;
  isActive: boolean;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useMemo(
    () => latLngToVector3(location.lat, location.lng, GLOBE_RADIUS * 1.02),
    [location]
  );

  useFrame((state) => {
    if (meshRef.current) {
      const scale = isActive
        ? 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
        : 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => onHover(location.id)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial
          color="#4af2c8"
          transparent
          opacity={isActive ? 1.0 : 0.8}
        />
      </mesh>
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[0.05, 0.08, 32]} />
        <meshBasicMaterial
          color="#4af2c8"
          transparent
          opacity={isActive ? 0.6 : 0.2}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function LocationArc({
  start,
  end,
}: {
  start: Location;
  end: Location;
}) {
  const lineObj = useMemo(() => {
    const startPos = latLngToVector3(start.lat, start.lng, GLOBE_RADIUS);
    const endPos = latLngToVector3(end.lat, end.lng, GLOBE_RADIUS);
    const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
    midPoint.normalize().multiplyScalar(GLOBE_RADIUS * 1.5);
    const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#4af2c8",
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return new THREE.Line(geometry, material);
  }, [start, end]);

  useEffect(() => {
    return () => {
      lineObj.geometry.dispose();
      (lineObj.material as THREE.Material).dispose();
    };
  }, [lineObj]);

  return <primitive object={lineObj} />;
}

interface GlobeGroupProps {
  activeLocation: string | null;
  onHoverLocation: (id: string | null) => void;
  isMobile: boolean;
}

function GlobeGroup({ activeLocation, onHoverLocation, isMobile }: GlobeGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHovered = useRef(false);
  const rotationSpeed = useRef(0.003);
  const dotCount = isMobile ? 3000 : 8000;

  const indiaLocation = LOCATIONS.find((l) => l.id === "india")!;

  useFrame(() => {
    if (groupRef.current) {
      const targetSpeed = isHovered.current ? 0.0005 : 0.003;
      rotationSpeed.current += (targetSpeed - rotationSpeed.current) * 0.05;
      groupRef.current.rotation.y += rotationSpeed.current;
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={[0.3, -0.5, 0.1]}
      onPointerEnter={() => {
        isHovered.current = true;
      }}
      onPointerLeave={() => {
        isHovered.current = false;
      }}
    >
      <GlobeDots count={dotCount} />
      {LOCATIONS.map((loc) => (
        <LocationMarker
          key={loc.id}
          location={loc}
          isActive={activeLocation === loc.id}
          onHover={onHoverLocation}
        />
      ))}
      {LOCATIONS.filter((l) => l.id !== "india").map((loc) => (
        <LocationArc key={`arc-${loc.id}`} start={indiaLocation} end={loc} />
      ))}
    </group>
  );
}

function GlobeScene({
  activeLocation,
  onHoverLocation,
  isMobile,
}: GlobeGroupProps) {
  const [degraded, setDegraded] = useState(false);

  return (
    <>
      <PerformanceMonitor
        onDecline={() => setDegraded(true)}
        onIncline={() => setDegraded(false)}
      >
        <GlobeGroup
          activeLocation={activeLocation}
          onHoverLocation={onHoverLocation}
          isMobile={isMobile}
        />
      </PerformanceMonitor>
      {!degraded && (
        <EffectComposer>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.4}
            luminanceSmoothing={0.9}
          />
          <Vignette offset={0.3} darkness={0.5} />
        </EffectComposer>
      )}
      <Preload all />
    </>
  );
}

interface GlobeCanvasProps {
  activeLocation: string | null;
  onHoverLocation: (id: string | null) => void;
}

export function GlobeCanvas({ activeLocation, onHoverLocation }: GlobeCanvasProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ pointerEvents: "auto" }}
    >
      <Suspense fallback={null}>
        <GlobeScene
          activeLocation={activeLocation}
          onHoverLocation={onHoverLocation}
          isMobile={isMobile}
        />
      </Suspense>
    </Canvas>
  );
}
