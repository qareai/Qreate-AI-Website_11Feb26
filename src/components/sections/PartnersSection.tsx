"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Partner {
  name: string;
  filename: string;
}

const partners: Partner[] = [
  { name: "OpenAI", filename: "openai.svg" },
  { name: "Google Cloud", filename: "googlecloud.svg" },
  { name: "AWS", filename: "aws.svg" },
  { name: "NVIDIA", filename: "nvidia.svg" },
  { name: "Microsoft", filename: "microsoft.svg" },
  { name: "Meta", filename: "meta.svg" },
  { name: "Anthropic", filename: "anthropic.svg" },
  { name: "Hugging Face", filename: "huggingface.svg" },
  { name: "Mistral", filename: "mistral.png" },
  { name: "LangChain", filename: "langchain.svg" },
  { name: "LlamaIndex", filename: "llamaindex.png" },
  { name: "Docker", filename: "docker.svg" },
];

export function PartnersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-20 md:py-28 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(74, 242, 200, 0.04) 0%, transparent 60%)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="text-center mb-14 md:mb-18">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-mono text-accent text-xs tracking-widest uppercase mb-4 block"
          >
            Ecosystem
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary"
          >
            Design & Engineering{" "}
            <span className="text-gradient">Partners</span>
          </motion.h2>
        </div>

        {/* Logo grid in glass panel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-12"
        >
          {/* Inner ambient glow */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(74,242,200,0.03) 0%, transparent 70%)",
            }}
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12 place-items-center">
            {partners.map((partner) => (
              <motion.div
                key={partner.name}
                variants={itemVariants}
                className="group flex flex-col items-center gap-3 cursor-default"
              >
                <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/partners/${partner.filename}?v=2`}
                    alt={partner.name}
                    className="w-full h-full object-contain transition-all duration-300"
                    loading="lazy"
                  />
                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-accent/20 -z-10" />
                </div>
                <span className="font-mono text-[9px] md:text-[10px] text-text-primary/30 group-hover:text-accent/60 uppercase tracking-widest transition-colors duration-300 text-center whitespace-nowrap">
                  {partner.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
