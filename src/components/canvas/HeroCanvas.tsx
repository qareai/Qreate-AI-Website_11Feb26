"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getDisperseProgress } from "./HeroBackground";

// Simplex noise GLSL implementation (embedded)
const simplexNoise = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
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
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const vertexShader = `
  ${simplexNoise}
  
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uMouse;
  
  attribute float aRandomness;
  
  varying float vDistance;
  varying float vNoise;
  
  void main() {
    vec3 pos = position;
    vec3 normal = normalize(position);
    
    // Simplex noise displacement along normals
    float noise = snoise(pos * 0.8 + uTime * 0.3) * 0.5;
    noise += snoise(pos * 1.5 + uTime * 0.2) * 0.25;
    pos += normal * noise * 0.3;
    
    // Mouse reactive displacement
    float mouseDistance = length(pos - uMouse);
    float mouseInfluence = smoothstep(2.0, 0.0, mouseDistance);
    vec3 mouseDir = normalize(pos - uMouse);
    pos += mouseDir * mouseInfluence * 0.5;
    
    // Scroll-based dissolve (particles move outward)
    float dissolve = uScroll * 3.0;
    pos += normal * dissolve * (1.0 + aRandomness * 0.5);
    
    // Pass varyings
    vDistance = length(pos);
    vNoise = noise;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Point size with distance attenuation
    gl_PointSize = (1.5 + aRandomness * 1.0) * (1.0 / -mvPosition.z) * 40.0;
    gl_PointSize *= (1.0 - uScroll * 0.5);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScroll;
  
  varying float vDistance;
  varying float vNoise;
  
  void main() {
    // Soft circular point
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edges
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    
    // Color gradient: accent tones
    vec3 accent = vec3(0.15, 0.50, 0.40);
    vec3 accentSecondary = vec3(0.35, 0.28, 0.50);
    float gradientMix = vNoise * 0.5 + 0.5;
    vec3 color = mix(accent, accentSecondary, gradientMix);

    // Fade based on distance from center for depth
    float depthFade = 1.0 - smoothstep(2.0, 4.0, vDistance);
    alpha *= depthFade;

    // Scroll fade
    alpha *= (1.0 - uScroll * 0.8);

    // Keep alpha low so additive stacking stays colorful, not white
    gl_FragColor = vec4(color * 0.6, alpha * 0.12);
  }
`;

function generateIcospherePoints(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  
  // Golden ratio for fibonacci sphere distribution
  const phi = Math.PI * (3 - Math.sqrt(5));
  
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    
    positions[i * 3] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;
  }
  
  return positions;
}

interface ParticleSystemProps {
  count: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

export function HeroParticles({ count, mouse }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, size } = useThree();

  const { positions, randomness } = useMemo(() => {
    const pos = generateIcospherePoints(count, 2.5);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      rand[i] = Math.random();
    }
    return { positions: pos, randomness: rand };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 0) },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = getDisperseProgress();

      // Convert 2D mouse to 3D position on a plane
      const vector = new THREE.Vector3(
        (mouse.current.x / size.width) * 2 - 1,
        -(mouse.current.y / size.height) * 2 + 1,
        0.5
      );
      vector.unproject(camera);
      const dir = vector.sub(camera.position).normalize();
      const distance = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance));

      materialRef.current.uniforms.uMouse.value.lerp(pos, 0.1);
    }

    // Gentle rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
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

  return (
    <points ref={pointsRef}>
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

export function HeroCameraController({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera, size } = useThree();
  const targetX = useRef(0);
  const targetY = useRef(0);

  useFrame(() => {
    // Calculate target based on mouse position
    targetX.current = ((mouse.current.x / size.width) * 2 - 1) * 0.3;
    targetY.current = ((mouse.current.y / size.height) * 2 - 1) * 0.2;

    // Lerp camera position for subtle sway
    camera.position.x += (targetX.current - camera.position.x) * 0.02;
    camera.position.y += (-targetY.current - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
