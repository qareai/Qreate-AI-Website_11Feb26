"use client";

import { useRef, useMemo, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { motion, useInView } from "framer-motion";

// Simplex noise GLSL
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

// Converging vertex shader — particles move INWARD (inverse of hero dissolve)
const vertexShader = `
  ${simplexNoise}
  uniform float uTime;
  uniform float uConverge; // 0 = scattered, 1 = converged to sphere
  attribute float aRandomness;
  attribute vec3 aScatteredPos;
  varying float vDistance;
  varying float vNoise;

  void main() {
    vec3 targetPos = position; // icosphere position
    vec3 scattered = aScatteredPos;

    // Ease the convergence
    float ease = smoothstep(0.0, 1.0, uConverge);
    vec3 pos = mix(scattered, targetPos, ease);

    // Noise displacement when converged
    float noise = snoise(pos * 0.8 + uTime * 0.25) * 0.4;
    noise += snoise(pos * 1.6 + uTime * 0.15) * 0.2;
    vec3 normal = normalize(pos);
    pos += normal * noise * 0.25 * ease;

    vDistance = length(pos);
    vNoise = noise;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float sizeBase = 3.5 + aRandomness * 2.0;
    gl_PointSize = sizeBase * (1.0 / -mvPosition.z) * 70.0;
    gl_PointSize *= (0.5 + ease * 0.5);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uConverge;
  varying float vDistance;
  varying float vNoise;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

    vec3 accent = vec3(0.12, 0.38, 0.31);
    vec3 accentSecondary = vec3(0.26, 0.22, 0.39);
    float gradientMix = vNoise * 0.5 + 0.5;
    vec3 color = mix(accent, accentSecondary, gradientMix);

    float depthFade = 1.0 - smoothstep(2.0, 5.0, vDistance);
    alpha *= depthFade;
    alpha *= 0.4 + uConverge * 0.5;

    gl_FragColor = vec4(color, alpha * 0.3);
  }
`;

function generateSpherePoints(count: number, radius: number): Float32Array {
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

function generateScattered(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 6 + Math.random() * 5;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

function ConvergingParticles({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const convergeRef = useRef(0);

  const { positions, scattered, randomness } = useMemo(() => {
    const pos = generateSpherePoints(count, 2.5);
    const scat = generateScattered(count);
    const rand = new Float32Array(count);
    for (let i = 0; i < count; i++) rand[i] = Math.random();
    return { positions: pos, scattered: scat, randomness: rand };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uConverge: { value: 0 },
    }),
    []
  );

  useEffect(() => {
    const section = document.getElementById("cta-section");
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start converging when section enters viewport, complete by mid-section
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
      convergeRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smooth lerp toward target
      const current = materialRef.current.uniforms.uConverge.value;
      materialRef.current.uniforms.uConverge.value += (convergeRef.current - current) * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
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
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aScatteredPos" count={count} array={scattered} itemSize={3} />
        <bufferAttribute attach="attributes-aRandomness" count={count} array={randomness} itemSize={1} />
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

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 6);
  }, [camera]);

  return null;
}

function CTACanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    const handleResize = () => setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor onDecline={() => setDegraded(true)} onIncline={() => setDegraded(false)}>
            <CameraSetup />
            <ConvergingParticles count={isMobile ? 6000 : 15000} />
          </PerformanceMonitor>
          {!degraded && (
            <EffectComposer>
              <Bloom intensity={0.2} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
              <Vignette offset={0.3} darkness={0.7} />
            </EffectComposer>
          )}
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}

export function CTASection() {
  const textRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(textRef, { once: true, margin: "-100px" });
  // Wider margin to preload canvas before section scrolls into view
  const isNearView = useInView(sectionRef, { once: true, margin: "300px" });

  return (
    <section
      ref={sectionRef}
      id="cta-section"
      className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Converging particle background — lazy-mounted */}
      {isNearView && <CTACanvas />}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-background/40 pointer-events-none" />

      {/* Content */}
      <div ref={textRef} className="relative z-10 text-center px-6 md:px-12 max-w-3xl mx-auto">
        <motion.span
          className="font-mono text-accent text-xs tracking-widest uppercase mb-6 block"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Get in Touch
        </motion.span>

        <motion.h2
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Ready to Build Something{" "}
          <span className="text-gradient">Intelligent?</span>
        </motion.h2>

        <motion.p
          className="font-body text-text-primary text-lg md:text-xl mb-10"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Let&apos;s discuss how AI can transform your business.
        </motion.p>

        {/* CTA Button with rotating gradient border */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <a
            href="mailto:team@qareai.com"
            className="gradient-border-btn relative inline-flex items-center justify-center px-10 py-4 font-semibold text-text-primary rounded-full transition-transform duration-300 hover:scale-105"
          >
            <span className="relative z-10">Start a Conversation</span>
          </a>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="mailto:team@qareai.com"
              className="font-mono text-sm text-text-primary/80 hover:text-accent transition-colors duration-300"
            >
              team@qareai.com
            </a>
            <span className="hidden sm:inline text-text-secondary/30">|</span>
            <a
              href="https://calendly.com/qareailabs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-text-primary/80 hover:text-accent transition-colors duration-300"
            >
              Book a Call
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
