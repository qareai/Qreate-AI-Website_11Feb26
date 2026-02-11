"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

const steps: ProcessStep[] = [
  {
    number: "01",
    title: "Ideation",
    description:
      "We brainstorm and align with your vision to define goals and strategy. Before writing a single line of code, we ensure we understand the problem space deeply and have a clear roadmap for success.",
  },
  {
    number: "02",
    title: "Development",
    description:
      "Our team designs and builds your solution using the latest technologies — from LLM fine-tuning and computer vision to React frontends and FastAPI backends. Every component is engineered for reliability and scale.",
  },
  {
    number: "03",
    title: "Launch & Beyond",
    description:
      "We launch your product and support you with updates, scaling, and growth. Our commitment doesn't end at deployment — we provide ongoing maintenance and iterate based on real-world feedback.",
  },
];

export function ProcessSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section ref={sectionRef} id="process" className="relative z-10 py-24 md:py-32 bg-background">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-mono text-accent text-xs tracking-widest uppercase mb-4 block"
          >
            How We Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4"
          >
            Our <span className="text-gradient">Process</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-text-primary/60 text-base md:text-lg max-w-lg mx-auto"
          >
            From concept to launch, we collaborate with you at every stage to ensure success.
          </motion.p>
        </div>

        {/* Steps */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="relative group"
              variants={itemVariants}
            >
              {/* Step number */}
              <span className="font-mono text-6xl lg:text-7xl font-bold text-white/5 group-hover:text-accent/10 transition-colors duration-500 block mb-4">
                {step.number}
              </span>

              {/* Accent line */}
              <div className="h-px w-12 bg-accent/50 mb-6 group-hover:w-20 transition-all duration-500" />

              <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-4">
                {step.title}
              </h3>

              <p className="font-body text-sm md:text-base text-text-primary/70 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
