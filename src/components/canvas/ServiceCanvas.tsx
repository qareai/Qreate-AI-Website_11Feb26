"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { getScrollProgress } from "@/hooks";

// Simplex noise GLSL (same as HeroCanvas)
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
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
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

// Vertex shader - particles coalesce from scattered to form a shape
const vertexShader = `
  ${simplexNoise}
  
  uniform float uTime;
  uniform float uCoalesce; // 0 = scattered, 1 = formed
  uniform vec3 uTargetPosition;
  
  attribute float aRandomness;
  attribute vec3 aScatteredPosition;
  
  varying float vDistance;
  varying float vNoise;
  
  void main() {
    // Interpolate between scattered and target position
    vec3 targetPos = position;
    vec3 scatteredPos = aScatteredPosition;
    
    // Ease the coalescing
    float ease = smoothstep(0.0, 1.0, uCoalesce);
    vec3 pos = mix(scatteredPos, targetPos, ease);
    
    // Add subtle noise animation when formed
    float noise = snoise(pos * 0.5 + uTime * 0.2) * (1.0 - ease * 0.7);
    vec3 normal = normalize(pos);
    pos += normal * noise * 0.2;
    
    vDistance = length(pos);
    vNoise = noise;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size
    float sizeMultiplier = 1.0 + (1.0 - ease) * 0.5;
    gl_PointSize = (3.0 + aRandomness * 2.0) * (1.0 / -mvPosition.z) * 60.0 * sizeMultiplier;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uCoalesce;
  uniform float uFade;

  varying float vDistance;
  varying float vNoise;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

    // Color gradient
    vec3 accent = vec3(0.15, 0.50, 0.40);
    vec3 accentSecondary = vec3(0.35, 0.28, 0.50);
    float gradientMix = vNoise * 0.5 + 0.5;
    vec3 color = mix(accentSecondary, accent, gradientMix);

    // Fade based on coalesce state
    alpha *= 0.6 + uCoalesce * 0.3;

    // Smooth scroll-based fade-in
    alpha *= uFade;

    gl_FragColor = vec4(color, alpha * 0.4);
  }
`;

function generateTorusPoints(count: number, radius: number, tube: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    
    const x = (radius + tube * Math.cos(v)) * Math.cos(u);
    const y = (radius + tube * Math.cos(v)) * Math.sin(u);
    const z = tube * Math.sin(v);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  
  return positions;
}

function generateScatteredPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // Random positions in a large sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 8 + Math.random() * 6;
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  return positions;
}

interface ServiceParticlesProps {
  count: number;
}

export function ServiceParticles({ count }: ServiceParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const scrollRef = useRef(0);

  const { positions, scattered, randomness } = useMemo(() => {
    const pos = generateTorusPoints(count, 1.8, 0.6);
    const scat = generateScatteredPositions(count);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      rand[i] = Math.random();
    }
    return { positions: pos, scattered: scat, randomness: rand };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCoalesce: { value: 0 },
      uFade: { value: 0 },
      uTargetPosition: { value: new THREE.Vector3(0, 0, 0) },
    }),
    []
  );

  useFrame((state) => {
    const scrollProgress = getScrollProgress();
    scrollRef.current = scrollProgress;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Coalesce starts at 10% scroll, completes at 25%
      const coalesceStart = 0.10;
      const coalesceEnd = 0.25;
      const coalesceProgress = Math.max(0, Math.min(1,
        (scrollProgress - coalesceStart) / (coalesceEnd - coalesceStart)
      ));
      materialRef.current.uniforms.uCoalesce.value = coalesceProgress;

      // Smooth fade-in: 0 at 3% scroll, 1 at 12% scroll
      const fadeStart = 0.03;
      const fadeEnd = 0.12;
      const fade = Math.max(0, Math.min(1,
        (scrollProgress - fadeStart) / (fadeEnd - fadeStart)
      ));
      materialRef.current.uniforms.uFade.value = fade;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
      pointsRef.current.rotation.z += 0.001;
    }
  });

  // Dispose geometry and material on unmount
  useEffect(() => {
    const points = pointsRef.current;
    return () => {
      if (points) {
        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
      }
    };
  }, []);

  // Skip rendering when fully at top (fade is 0 anyway)
  const visible = scrollRef.current > 0.02;

  return (
    <points ref={pointsRef} visible={visible}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatteredPosition"
          count={count}
          array={scattered}
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
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene({ particleCount }: { particleCount: number }) {
  return (
    <>
      <PerformanceMonitor>
        <ServiceParticles count={particleCount} />
      </PerformanceMonitor>
      <Preload all />
    </>
  );
}

export function ServiceCanvas() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const particleCount = isMobile ? 4000 : 10000;

  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <Scene particleCount={particleCount} />
        </Suspense>
      </Canvas>
    </div>
  );
}
