"use client";

import { useEffect } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useScrollProgress } from "@/hooks";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function HeroSection() {
  const scrollProgress = useScrollProgress();
  const showScrollIndicator = scrollProgress < 0.05;

  // Motion value for scroll-linked animations
  const scrollMotion = useMotionValue(0);

  useEffect(() => {
    scrollMotion.set(scrollProgress);
  }, [scrollProgress, scrollMotion]);

  // Hero exits between 0% and 15% scroll
  const heroProgress = Math.min(scrollProgress / 0.15, 1);
  const heroOpacity = 1 - heroProgress;
  const heroY = -heroProgress * 100;

  // Animation variants
  const clipPathReveal = {
    hidden: { clipPath: "inset(0 100% 0 0)" },
    visible: { clipPath: "inset(0 0% 0 0)" },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="min-h-screen flex items-center relative px-6 md:px-12 lg:px-24">
      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto w-full"
        style={{
          opacity: heroOpacity,
          y: heroY,
        }}
      >
        <div className="max-w-3xl">
          {/* Main Heading */}
          <h1 className="font-display font-bold leading-[1.1] mb-6">
            <div className="overflow-hidden">
              <motion.span
                className="block text-text-primary"
                style={{ fontSize: "clamp(3rem, 6vw, 7rem)" }}
                variants={clipPathReveal}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, ease: [0.77, 0, 0.175, 1], delay: 0.2 }}
              >
                Too niche. Too bold.
              </motion.span>
            </div>
            <div className="overflow-hidden">
              <motion.span
                className="block text-gradient"
                style={{ fontSize: "clamp(3rem, 6vw, 7rem)" }}
                variants={clipPathReveal}
                initial="hidden"
                animate="visible"
                transition={{ duration: 1, ease: [0.77, 0, 0.175, 1], delay: 0.4 }}
              >
                We build it anyway.
              </motion.span>
            </div>
          </h1>

          {/* Subheading */}
          <motion.p
            className="font-body text-[#b0b0b0] text-lg md:text-xl lg:text-2xl max-w-xl mb-12"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          >
            Your trusted partner for building cutting-edge AI and LLM-powered software solutions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.8, ease: "easeOut", delay: 1.2 }}
          >
            <MagneticLink
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent text-background font-semibold rounded-full transition-all duration-300 hover:glow-accent hover:scale-105"
            >
              Start Your Project
            </MagneticLink>
            <MagneticLink
              href="#work"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-text-primary/40 text-text-primary font-semibold rounded-full transition-all duration-300 hover:border-accent hover:text-accent hover:scale-105"
            >
              Explore Our Work
            </MagneticLink>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showScrollIndicator ? 1 : 0, y: showScrollIndicator ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-mono text-xs text-text-primary/80 tracking-widest uppercase">
          Scroll to explore
        </span>
        <div className="relative h-12 w-px">
          <motion.div
            className="absolute top-0 left-0 w-full bg-accent"
            initial={{ height: "0%" }}
            animate={{ height: ["0%", "100%", "0%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div className="absolute inset-0 bg-text-secondary/20" />
        </div>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-accent"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M8 12L2 6L3.4 4.6L8 9.2L12.6 4.6L14 6L8 12Z"
            fill="currentColor"
          />
        </motion.svg>
      </motion.div>
    </section>
  );
}
