"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  image: string;
  linkedin: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Aryaman",
    role: "Co-Founder & CEO",
    tagline: "Leading our vision",
    bio: "Drives company strategy and client relationships, translating bold ideas into scalable AI solutions.",
    image: "/founder_images/Aryaman.jpeg",
    linkedin: "https://www.linkedin.com/in/aryaman-arya/",
  },
  {
    name: "Harsh",
    role: "Co-Founder & CTO",
    tagline: "Driving our technical innovation",
    bio: "Architects the full technical stack — from LLM fine-tuning and computer vision pipelines to production infrastructure.",
    image: "/founder_images/Harsh_Pandey.jpeg",
    linkedin: "https://www.linkedin.com/in/harsh-pandey-27013a202/",
  },
  {
    name: "Subhanshu",
    role: "Co-Founder & CPO",
    tagline: "Shaping our product strategy",
    bio: "Bridges user needs and engineering, shaping product roadmaps and ensuring every feature delivers real value.",
    image: "/founder_images/Subhanshu_Arya.jpeg",
    linkedin: "https://www.linkedin.com/in/subhanshu-arya-3a7017186/",
  },
];

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
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
    <section ref={sectionRef} id="team" className="relative z-10 py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-mono text-accent text-xs tracking-widest uppercase mb-4 block"
          >
            The People
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-4"
          >
            Meet the <span className="text-gradient">Founders</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-body text-text-primary/60 text-base md:text-lg max-w-lg mx-auto"
          >
            Three builders with one mission — make AI work for everyone.
          </motion.p>
        </div>

        {/* Team Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              className="group relative"
              variants={itemVariants}
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-surface">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* LinkedIn icon on hover */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-accent hover:text-background"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <LinkedInIcon />
                </a>
              </div>

              {/* Info */}
              <h3 className="font-display text-xl font-bold text-text-primary mb-1">
                {member.name}
              </h3>
              <p className="font-mono text-accent text-xs uppercase tracking-wider mb-2">
                {member.role}
              </p>
              <p className="font-body text-sm text-text-primary/50 italic mb-2">
                {member.tagline}
              </p>
              <p className="font-body text-sm text-text-primary/70 leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
