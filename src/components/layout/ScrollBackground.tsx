"use client";

import { useScrollProgress } from "@/hooks";

export function ScrollBackground() {
  const scrollProgress = useScrollProgress();
  
  // Background transitions from 0-15% scroll
  // From pure black (#050505) to subtle gradient
  const transitionProgress = Math.min(scrollProgress / 0.15, 1);
  
  // Gradient opacity increases as we scroll
  const gradientOpacity = transitionProgress * 0.3;
  
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Gradient overlay that fades in */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: gradientOpacity,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(74, 242, 200, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(167, 139, 250, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 1) 100%)
          `,
        }}
      />
      
      {/* Subtle grid pattern that appears */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: transitionProgress * 0.05,
          backgroundImage: `
            linear-gradient(rgba(74, 242, 200, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74, 242, 200, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
