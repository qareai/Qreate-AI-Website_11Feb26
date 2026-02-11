"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Lenis from "lenis";

// Module-level scroll store — updated every Lenis tick, no React re-renders.
// R3F components read this directly in useFrame for frame-perfect values.
let _scrollProgress = 0;

/** Get current scroll progress (0-1) without triggering React re-renders. */
export function getScrollProgress(): number {
  return _scrollProgress;
}

interface ScrollContextValue {
  progress: number;
  lenis: Lenis | null;
}

const ScrollContext = createContext<ScrollContextValue>({
  progress: 0,
  lenis: null,
});

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Update both module-level ref (for R3F) and React state (for DOM components)
    lenis.on("scroll", ({ progress: scrollProgress }: { progress: number }) => {
      _scrollProgress = scrollProgress;
      setProgress(scrollProgress);
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ progress, lenis: lenisRef.current }}>
      {children}
    </ScrollContext.Provider>
  );
}

/**
 * Custom hook to get the current normalized scroll position (0-1).
 * This value can be used to drive Three.js animations and other scroll-based effects.
 *
 * @returns The current scroll progress from 0 (top) to 1 (bottom)
 */
export function useScrollProgress(): number {
  const { progress } = useContext(ScrollContext);
  return progress;
}

/**
 * Custom hook to access the Lenis instance directly.
 * Useful for programmatic scrolling or advanced scroll manipulation.
 *
 * @returns The Lenis instance or null if not initialized
 */
export function useLenis(): Lenis | null {
  const { lenis } = useContext(ScrollContext);
  return lenis;
}

/**
 * Custom hook to get both scroll progress and lenis instance.
 *
 * @returns Object containing progress (0-1) and lenis instance
 */
export function useScroll(): ScrollContextValue {
  return useContext(ScrollContext);
}
