"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ───────────────────────── Types ───────────────────────── */

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  filterGroup: "ai" | "web";
  gradient: string;
  videoUrl?: string;
  link?: { name: string; url: string; external: boolean };
  status?: string;
  featured?: boolean;
}

/* ───────────────────────── Data ────────────────────────── */

const filters = [
  { key: "all", label: "All Projects" },
  { key: "ai", label: "AI & ML" },
  { key: "web", label: "Web & Design" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const projects: Project[] = [
  {
    id: "project-1",
    title: "Intelligent Traffic Management System",
    description:
      "Comprehensive AI-powered traffic management solution combining vehicle tracking, re-identification, and pattern recognition across multiple junction points.",
    tags: ["Object Tracking", "Re-ID", "Pattern Analysis", "Traffic AI"],
    category: "Computer Vision & AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)",
    videoUrl: "/Project_video_files/Vehicle Tracking & Re-Identification.mp4",
    featured: true,
  },
  {
    id: "project-2",
    title: "DoQ AI Assistant",
    description:
      "Intelligent AI assistant powered by large language models, delivering conversational automation and natural language understanding for streamlined user interactions.",
    tags: ["LLM", "Chatbot", "NLP", "Automation"],
    category: "AI Assistant",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a2e1a 0%, #1a4e2a 100%)",
    videoUrl: "/Project_video_files/DoQ AI Assistant.mp4",
    link: { name: "Live", url: "https://qareai.in", external: true },
  },
  {
    id: "project-3",
    title: "Lobo AI — Personalized Podcast MVP",
    description:
      "AI-powered personalized podcast platform for stock market investors. Users select stocks and receive daily audio briefings with news, summaries, and voice conversion.",
    tags: ["NLP", "Generative AI", "TTS", "Backend Automation"],
    category: "AI + Audio Content",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #2e0a1a 0%, #4e1a2a 100%)",
    videoUrl: "/Project_video_files/Lobo AI – Personalized Podcast MVP.mp4",
    link: { name: "Live", url: "https://joinlobo.com", external: true },
    featured: true,
  },
  {
    id: "project-4",
    title: "AQI & Heatwave Forecasting",
    description:
      "Environmental AI system for air quality index prediction and heatwave forecasting using time-series analysis and GIS visualization.",
    tags: ["Time-Series", "Forecasting", "GIS", "Visualization"],
    category: "Environmental AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    videoUrl: "/Project_video_files/AQI & Heatwave Forecasting.mp4",
    link: { name: "Demo", url: "https://aqiheatwave.netlify.app/", external: true },
  },
  {
    id: "project-5",
    title: "Supply Chain Optimization",
    description:
      "AI-driven supply chain optimization platform leveraging forecasting and analytics to streamline operations and reduce costs.",
    tags: ["Optimization", "Forecasting", "Analytics"],
    category: "Supply Chain AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a1a2e 0%, #1a2a4e 100%)",
    status: "Confidential Project",
  },
  {
    id: "project-6",
    title: "Quantum Neural Networks",
    description:
      "Research project exploring the intersection of quantum computing and neural networks for next-generation AI architectures.",
    tags: ["Quantum Computing", "Neural Networks", "Research"],
    category: "Quantum AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #2a1a4e 100%)",
    status: "Confidential Project",
  },
  {
    id: "project-7",
    title: "Floorplan Annotation Platform",
    description:
      "A full-stack floorplan annotation platform with AI capabilities that can automatically assign room names from PDF files using auto-classification of bounding boxes.",
    tags: ["CV", "PDF Processing", "Auto-Classification"],
    category: "Computer Vision",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #2e1a0a 0%, #4e2a1a 100%)",
    status: "Confidential Project",
  },
  {
    id: "project-8",
    title: "Phitness — AI-Powered Fitness Betting",
    description:
      "Health tech platform combining AI-powered fitness tracking with gamification and betting mechanics to drive user engagement.",
    tags: ["AI", "Mobile App", "Gamification"],
    category: "Health Tech",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #0a2e2e 0%, #1a4e4e 100%)",
    link: { name: "Demo", url: "https://phitness.netlify.app/", external: true },
  },
  {
    id: "project-9",
    title: "Creaco — Problem Statement Showcase",
    description:
      "Beautifully designed web platform for showcasing and organizing problem statements with a modern, interactive UI.",
    tags: ["React", "UI/UX", "Full-Stack"],
    category: "Web Design",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #2e0a2e 0%, #4e1a4e 100%)",
    videoUrl: "/Project_video_files/Creaco - Problem Statement Showcase.mp4",
    link: { name: "Live", url: "https://creaco.netlify.app/", external: true },
  },
  {
    id: "project-10",
    title: "Qoach — Waitlist Platform",
    description:
      "Modern waitlist and landing page platform built with React and Firebase for capturing early adopter interest.",
    tags: ["React", "Firebase", "Landing Page"],
    category: "Web Design",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)",
    videoUrl: "/Project_video_files/Qoach - Waitlist Platform.mp4",
    link: { name: "Live", url: "https://qoach.qareai.in/", external: true },
  },
  {
    id: "project-11",
    title: "Qreate Legacy Website",
    description:
      "The original Qreate AI website — a clean, modern React + Vite site showcasing our brand identity and services.",
    tags: ["React", "Vite", "Design"],
    category: "Web Design",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #1a1a0a 0%, #2a2a1a 100%)",
    videoUrl: "/Project_video_files/Qreate Legacy Website.mp4",
    link: { name: "Live", url: "https://qreate-old.netlify.app/", external: true },
  },
];

/* ───────────────────────── Grid Card ───────────────────── */

function GridCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  return (
    <motion.div
      ref={ref}
      className={project.featured ? "sm:col-span-2" : ""}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group h-full transition-transform duration-150 ease-out"
        style={{ background: project.gradient }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`View ${project.title}`}
      >
        {/* Aspect-ratio container */}
        <div
          className={
            project.featured
              ? "aspect-[4/3] sm:aspect-[2/1]"
              : "aspect-[4/3]"
          }
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Bottom gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Project number + status badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {project.status && (
            <span className="px-2.5 py-1 rounded-full border border-white/15 text-white/40 text-[10px] font-mono uppercase tracking-wider">
              {project.status}
            </span>
          )}
          <span className="font-mono text-3xl font-bold text-white/[0.07] group-hover:text-white/15 transition-colors duration-300">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <span className="font-mono text-[10px] tracking-widest uppercase text-accent/70 mb-2 block">
            {project.category}
          </span>
          <h3 className="font-display text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight mb-2.5 group-hover:text-accent transition-colors duration-300">
            {project.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full border border-white/10 text-white/40 text-[10px] font-mono
                  group-hover:border-accent/20 group-hover:text-white/60 transition-all duration-300"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2.5 py-0.5 text-white/25 text-[10px] font-mono">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Hover view indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-14 h-14 rounded-full border-2 border-accent/30 flex items-center justify-center backdrop-blur-sm bg-black/30">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-accent"
            >
              <path
                d="M4 9H14M14 9L10 5M14 9L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Border glow */}
        <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-accent/20 transition-colors duration-300 pointer-events-none" />
      </div>
    </motion.div>
  );
}

/* ───────────────────── Project Spotlight ────────────────── */

function ProjectSpotlight({
  project,
  navProjects,
  onClose,
  onNavigate,
}: {
  project: Project;
  navProjects: Project[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentIndex = navProjects.findIndex((p) => p.id === project.id);
  const prevProject =
    currentIndex > 0 ? navProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < navProjects.length - 1
      ? navProjects[currentIndex + 1]
      : null;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prevProject) onNavigate(prevProject.id);
      if (e.key === "ArrowRight" && nextProject) onNavigate(nextProject.id);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate, prevProject, nextProject]);

  // Auto-play video when project changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [project.id]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Content card */}
      <motion.div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/5"
        style={{ background: project.gradient }}
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center
            text-white/60 hover:text-white hover:border-white/40 transition-colors bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11 3L3 11M3 3L11 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Prev / Next arrows */}
        {prevProject && (
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/15
              flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors bg-black/30 backdrop-blur-sm"
            onClick={() => onNavigate(prevProject.id)}
            aria-label="Previous project"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 3L5 7L9 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {nextProject && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/15
              flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors bg-black/30 backdrop-blur-sm"
            onClick={() => onNavigate(nextProject.id)}
            aria-label="Next project"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 3L9 7L5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Video or gradient hero */}
        {project.videoUrl ? (
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover rounded-t-3xl"
            src={project.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <div
            className="w-full aspect-video rounded-t-3xl relative overflow-hidden"
            style={{ background: project.gradient }}
          >
            {/* Decorative grid for non-video projects */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-8xl font-bold text-white/[0.04]">
                {project.title
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)}
              </span>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="relative p-6 md:p-10 bg-gradient-to-b from-black/40 to-black/70">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="font-mono text-xs tracking-widest uppercase text-accent/80">
              {project.category}
            </span>
            {project.status && (
              <span className="px-2.5 py-0.5 rounded-full border border-white/15 text-white/40 text-[10px] font-mono uppercase tracking-wider">
                {project.status}
              </span>
            )}
          </div>

          <h3 className="font-display text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {project.title}
          </h3>

          <p className="font-body text-sm md:text-base text-white/60 max-w-2xl mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full border border-white/10 text-white/50 text-xs font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>

            {project.link && (
              <a
                href={project.link.url}
                target={project.link.external ? "_blank" : undefined}
                rel={
                  project.link.external ? "noopener noreferrer" : undefined
                }
                className="inline-flex items-center gap-2 text-accent font-medium text-sm shrink-0 hover:gap-3 transition-all duration-300"
              >
                {project.link.name}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {navProjects.map((p) => (
              <button
                key={p.id}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  p.id === project.id
                    ? "bg-accent w-6"
                    : "bg-white/15 w-1.5 hover:bg-white/30"
                }`}
                onClick={() => onNavigate(p.id)}
                aria-label={`Go to ${p.title}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────── Main Section ────────────────────── */

export function FeaturedWorkSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true });
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.filterGroup === activeFilter);

  const selectedProject = selectedId
    ? projects.find((p) => p.id === selectedId) ?? null
    : null;

  const handleNavigate = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <section id="work" className="relative z-10 py-24 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Header + Filters */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="font-mono text-accent text-xs tracking-widest uppercase mb-3 block"
            >
              Featured Work
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary"
            >
              <span className="text-gradient">Portfolio</span>
            </motion.h2>
          </div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex gap-2"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                role="tab"
                aria-selected={activeFilter === f.key}
                className={`px-4 py-2 rounded-full font-mono text-xs tracking-wider transition-all duration-200 ${
                  activeFilter === f.key
                    ? "bg-accent text-background"
                    : "border border-white/10 text-text-secondary hover:border-accent/30 hover:text-text-primary"
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Project Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-flow-row-dense gap-4 md:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <GridCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => setSelectedId(project.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Project count */}
        <motion.p
          layout
          className="text-center mt-8 font-mono text-xs text-text-secondary/50"
        >
          Showing {filteredProjects.length} of {projects.length} projects
        </motion.p>
      </div>

      {/* Spotlight Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectSpotlight
            project={selectedProject}
            navProjects={filteredProjects}
            onClose={handleClose}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
