"use client";

import { useRef, Suspense, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import * as THREE from "three";

// AI/ML: Brain-like neural mesh — icosahedron wireframe with pulsing nodes
function BrainMesh({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const wireRef = useRef<THREE.LineSegments>(null);

  const { nodes, linePositions } = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.3, 1);
    const pos = geo.getAttribute("position");
    const pts: THREE.Vector3[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(2)},${pos.getY(i).toFixed(2)},${pos.getZ(i).toFixed(2)}`;
      if (!seen.has(key)) {
        seen.add(key);
        pts.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
      }
    }
    const edges = new THREE.EdgesGeometry(geo);
    const lp = edges.getAttribute("position").array as Float32Array;
    geo.dispose();
    edges.dispose();
    return { nodes: pts, linePositions: lp };
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      const speed = isHovered ? 0.015 : 0.005;
      groupRef.current.rotation.y += speed;
      groupRef.current.rotation.x += speed * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={wireRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={isHovered ? 0.5 : 0.3} />
      </lineSegments>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered ? 0.8 : 0.3}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

// Dev Stack: Stacked tech layers — 3 flat torus rings at different heights
function StackLayersMesh({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const speed = isHovered ? 0.02 : 0.008;
      groupRef.current.rotation.y += speed;
    }
  });

  const layers = [-0.6, 0, 0.6];
  const radii = [1.1, 0.85, 0.6];

  return (
    <group ref={groupRef}>
      {layers.map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radii[i], 0.06, 16, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
            transparent
            opacity={isHovered ? 0.8 : 0.5}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      ))}
      {/* Center data stream column */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Specialized Solutions: Orbiting gear nodes — dodecahedron wireframe with satellites
function GearNodesMesh({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  const linePositions = useMemo(() => {
    const geo = new THREE.DodecahedronGeometry(0.8, 0);
    const edges = new THREE.EdgesGeometry(geo);
    const lp = edges.getAttribute("position").array as Float32Array;
    geo.dispose();
    edges.dispose();
    return lp;
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = isHovered ? 0.015 : 0.006;
      groupRef.current.rotation.y += speed;
      groupRef.current.rotation.z += speed * 0.3;
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * (isHovered ? 1.5 : 0.8);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core wireframe */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={isHovered ? 0.6 : 0.35} />
      </lineSegments>
      {/* Core glow */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Orbiting satellite nodes */}
      <group ref={orbitRef}>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 1.4, Math.sin(angle) * 0.3, Math.sin(angle) * 1.4]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

interface ServiceVisualProps {
  type: "brain" | "stack" | "gear";
  color: string;
  isHovered: boolean;
}

function ServiceVisual({ type, color, isHovered }: ServiceVisualProps) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#a78bfa" />

      {type === "brain" && <BrainMesh color={color} isHovered={isHovered} />}
      {type === "stack" && <StackLayersMesh color={color} isHovered={isHovered} />}
      {type === "gear" && <GearNodesMesh color={color} isHovered={isHovered} />}
    </>
  );
}

interface ServiceCanvasBlockProps {
  type: "brain" | "stack" | "gear";
  color: string;
  isHovered: boolean;
  isInView: boolean;
}

export function ServiceCanvasBlock({ type, color, isHovered, isInView }: ServiceCanvasBlockProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isInView) {
    return <div className="w-full h-full bg-surface/30 rounded-2xl" />;
  }

  if (isMobile) {
    return <CSSGradientOrb color={color} isHovered={isHovered} />;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ServiceVisual type={type} color={color} isHovered={isHovered} />
      </Suspense>
      <Preload all />
    </Canvas>
  );
}

function CSSGradientOrb({ color, isHovered }: { color: string; isHovered: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl">
      <div
        className="absolute rounded-full transition-all duration-700 ease-out"
        style={{
          width: isHovered ? "75%" : "60%",
          height: isHovered ? "75%" : "60%",
          background: `radial-gradient(circle at 35% 35%, ${color}cc, ${color}66 50%, transparent 70%)`,
          filter: `blur(${isHovered ? 2 : 8}px)`,
          animation: "orbFloat 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full opacity-40 transition-all duration-700 ease-out"
        style={{
          width: isHovered ? "90%" : "80%",
          height: isHovered ? "90%" : "80%",
          background: `radial-gradient(circle at 60% 60%, ${color}44, transparent 60%)`,
          filter: "blur(20px)",
          animation: "orbFloat 8s ease-in-out infinite reverse",
        }}
      />
    </div>
  );
}
