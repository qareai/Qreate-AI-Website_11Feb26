"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [slideComplete, setSlideComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const skipIntroRef = useRef(false);

  // Mark as mounted and check sessionStorage
  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem("qreateai-loaded") === "true") {
        skipIntroRef.current = true;
        setIsLoading(false);
        setSlideComplete(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // Simulate progress tied to actual document load
  const runProgress = useCallback(() => {
    if (skipIntroRef.current) return;

    const start = performance.now();
    const minDuration = 2000; // Minimum loading time for visual effect

    const tick = () => {
      const elapsed = performance.now() - start;
      const docReady = document.readyState === "complete";

      // Progress accelerates as document loads
      let target: number;
      if (!docReady) {
        // Cap at 70% while still loading
        target = Math.min(70, (elapsed / minDuration) * 80);
      } else {
        // Jump toward 100% once loaded
        target = Math.min(100, 70 + ((elapsed - minDuration * 0.5) / (minDuration * 0.5)) * 30);
      }

      // Smooth lerp
      progressRef.current += (target - progressRef.current) * 0.08;
      setProgress(Math.round(progressRef.current));

      if (progressRef.current >= 99 && elapsed >= minDuration) {
        setProgress(100);
        // Brief pause at 100% before slide up
        setTimeout(() => {
          setIsLoading(false);
          try {
            sessionStorage.setItem("qreateai-loaded", "true");
          } catch {
            // ignore
          }
        }, 400);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted || skipIntroRef.current) return;
    const cleanup = runProgress();
    return cleanup;
  }, [mounted, runProgress]);

  return (
    <>
      {/* Loading overlay — always in tree, removed via AnimatePresence */}
      <AnimatePresence
        onExitComplete={() => setSlideComplete(true)}
      >
        {isLoading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10"
            >
              <span className="font-display text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                Qreate<span className="text-accent">AI</span>
              </span>
            </motion.div>

            {/* Progress line */}
            <div className="w-48 md:w-64">
              <div className="h-px bg-white/10 relative overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-accent"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              {/* Progress percentage */}
              <motion.p
                className="font-mono text-xs text-text-secondary/40 mt-3 text-center tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {progress}%
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content — hidden behind loader, revealed on slide-up */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={slideComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
