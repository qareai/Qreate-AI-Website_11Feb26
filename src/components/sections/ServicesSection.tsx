"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import { MagneticLink } from "@/components/ui/MagneticLink";

const ServiceCanvasBlock = dynamic(
  () =>
    import("@/components/canvas/ServiceVisuals").then((mod) => ({
      default: mod.ServiceCanvasBlock,
    })),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-surface/30 rounded-2xl" />,
  }
);

interface Service {
  id: string;
  title: string;
  description: string;
  visualType: "brain" | "stack" | "gear";
  color: string;
}

const services: Service[] = [
  {
    id: "ai-ml-services",
    title: "AI/ML Services",
    description:
      "From LLM fine-tuning and computer vision to NLP, text processing, and audio/speech AI — we build custom models trained for specific domains and use cases. Our expertise spans object detection, image classification, sentiment analysis, text generation, speech recognition, and synthesis.",
    visualType: "brain",
    color: "#4af2c8",
  },
  {
    id: "development-stack",
    title: "Development Stack",
    description:
      "Full-stack development with modern frameworks. We build polished frontends with React and Vite, robust backends with FastAPI, Python, and JavaScript, manage data with Firebase and Redis, and deploy to GCP, AWS, Netlify, and Render.",
    visualType: "stack",
    color: "#a78bfa",
  },
  {
    id: "specialized-solutions",
    title: "Specialized Solutions",
    description:
      "Complete agentic AI workflows from n8n to prompt chaining, data analytics with ETL pipelines and visualization, workflow automation and process optimization, and custom AI models tailored to specific business needs.",
    visualType: "gear",
    color: "#4af2c8",
  },
];

interface ServiceBlockProps {
  service: Service;
  index: number;
  isReversed: boolean;
}

function ServiceBlock({ service, index, isReversed }: ServiceBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
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

  const canvasVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center py-16 md:py-24 ${
        isReversed ? "md:direction-rtl" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas */}
      <motion.div
        className={`relative aspect-square max-w-[200px] md:max-w-[400px] mx-auto w-full ${
          isReversed ? "md:order-2 md:direction-ltr" : ""
        }`}
        variants={canvasVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-surface/20 backdrop-blur-sm border border-white/5">
          <ServiceCanvasBlock
            type={service.visualType}
            color={service.color}
            isHovered={isHovered}
            isInView={isInView}
          />
        </div>
        {/* Glow effect */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl -z-10 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${service.color}40 0%, transparent 70%)`,
            opacity: isHovered ? 0.5 : 0.2,
          }}
        />
      </motion.div>

      {/* Text Content */}
      <motion.div
        className={`${isReversed ? "md:order-1 md:direction-ltr md:text-right" : ""}`}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.span
          variants={itemVariants}
          className="font-mono text-xs tracking-widest uppercase mb-4 block"
          style={{ color: service.color }}
        >
          0{index + 1}
        </motion.span>

        <motion.h3
          variants={itemVariants}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6"
        >
          {service.title}
        </motion.h3>

        <motion.p
          variants={itemVariants}
          className="font-body text-text-primary/70 text-base md:text-lg leading-relaxed mb-8"
        >
          {service.description}
        </motion.p>

        <motion.div variants={itemVariants}>
          <MagneticLink
            href={`#${service.id}`}
            className="inline-flex items-center gap-2 font-medium transition-colors duration-300 hover:gap-3"
            style={{ color: service.color }}
          >
            Learn more
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-300"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticLink>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="relative z-10 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-mono text-accent text-xs tracking-widest uppercase mb-4 block"
          >
            What We Do
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary"
          >
            Our <span className="text-gradient">Services</span>
          </motion.h2>
        </div>

        {/* Service Blocks */}
        <div className="divide-y divide-white/5">
          {services.map((service, index) => (
            <ServiceBlock
              key={service.id}
              service={service}
              index={index}
              isReversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
