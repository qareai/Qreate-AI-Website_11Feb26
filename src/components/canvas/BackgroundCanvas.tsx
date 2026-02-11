"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { HeroParticles, HeroCameraController } from "./HeroCanvas";
import { ServiceParticles } from "./ServiceCanvas";

export function BackgroundCanvas() {
  const mouse = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || navigator.maxTouchPoints > 0
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const heroCount = isMobile ? 5000 : 20000;
  const serviceCount = isMobile ? 4000 : 10000;

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
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
          <PerformanceMonitor
            onDecline={() => setDegraded(true)}
            onIncline={() => setDegraded(false)}
          >
            <HeroParticles count={heroCount} mouse={mouse} />
            <ServiceParticles count={serviceCount} />
            <HeroCameraController mouse={mouse} />
          </PerformanceMonitor>

          {!degraded && isMobile && (
            <EffectComposer>
              <Bloom
                intensity={0.2}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                blendFunction={BlendFunction.ADD}
              />
              <Vignette darkness={0.7} offset={0.3} />
            </EffectComposer>
          )}
          {!degraded && !isMobile && (
            <EffectComposer>
              <Bloom
                intensity={0.3}
                luminanceThreshold={0.3}
                luminanceSmoothing={0.9}
                blendFunction={BlendFunction.ADD}
              />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.002, 0.002)}
                radialModulation={false}
                modulationOffset={0}
              />
              <Vignette darkness={0.7} offset={0.3} />
            </EffectComposer>
          )}
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}
