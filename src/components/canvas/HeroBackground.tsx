"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Preload, PerformanceMonitor } from "@react-three/drei";
import { HeroParticles, HeroCameraController } from "./HeroCanvas";

// Module-level dispersal progress — updated every frame, read by HeroParticles
// in useFrame for frame-perfect values (no React re-renders).
// 0 = particles in formation (hero visible), 1 = fully dispersed (services scrolled through)
let _disperseProgress = 0;

/** Get current dispersal progress (0-1) without triggering React re-renders. */
export function getDisperseProgress(): number {
  return _disperseProgress;
}

/**
 * Fixed-position hero particle canvas that spans the viewport.
 * Visible throughout Hero + Services sections, fades out as the
 * About ("Our Philosophy") section enters the viewport.
 *
 * Placed in layout.tsx OUTSIDE PageTransition to avoid
 * framer-motion transform containing-block issues.
 */
export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
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

  // Scroll-based fade + dispersal tracking.
  // - Canvas opacity: fades out as #about enters viewport
  // - Disperse progress: 0 during hero, ramps to 1 as #services scrolls through
  useEffect(() => {
    let rafId: number;
    const update = () => {
      const aboutSection = document.getElementById("about");
      const servicesSection = document.getElementById("services");

      // Canvas opacity: fade out as About enters viewport
      if (containerRef.current && aboutSection) {
        const rect = aboutSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const fadeProgress = Math.max(0, Math.min(1, 1 - rect.top / vh));
        containerRef.current.style.opacity = String(
          Math.max(0, 1 - fadeProgress)
        );
      }

      // Dispersal: particles stay in formation during hero,
      // disperse gradually across the entire services section,
      // reaching full dispersal just as #about enters the viewport.
      if (servicesSection && aboutSection) {
        const sRect = servicesSection.getBoundingClientRect();
        const aRect = aboutSection.getBoundingClientRect();
        const vh = window.innerHeight;
        // servicesHeight is the constant distance between the two section tops
        const servicesHeight = aRect.top - sRect.top;
        // How far we've scrolled past the services entry point
        const scrolledIntoServices = Math.max(0, vh - sRect.top);
        _disperseProgress =
          servicesHeight > 0
            ? Math.min(1, scrolledIntoServices / servicesHeight)
            : 0;
      }

      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PerformanceMonitor
            onDecline={() => setDegraded(true)}
            onIncline={() => setDegraded(false)}
          >
            <HeroParticles count={isMobile ? 5000 : 20000} mouse={mouse} />
            <HeroCameraController mouse={mouse} />
          </PerformanceMonitor>
          {!degraded && (
            <EffectComposer>
              <Bloom
                intensity={0.1}
                luminanceThreshold={0.8}
                luminanceSmoothing={0.9}
              />
              <Vignette offset={0.3} darkness={0.8} />
            </EffectComposer>
          )}
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
}
