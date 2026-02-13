"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { getLenisInstance } from "@/components/layout/SmoothScrollProvider";

/* ───────────────────────── Types ───────────────────────── */

interface CaseStudy {
  client?: string;
  industry: string;
  status?: string;
  problem: string;
  solution: string;
  impact: string[];
  techStack: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  filterGroup: "ai" | "web";
  gradient: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  link?: { name: string; url: string; external: boolean };
  status?: string;
  featured?: boolean;
  caseStudy?: CaseStudy;
}

/* ───────────────────────── Data ────────────────────────── */

const filters = [
  { key: "all", label: "All Projects" },
  { key: "ai", label: "AI & ML" },
  { key: "web", label: "Web & Design" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

const projects: Project[] = [
  // ── Products (PDF order) ──
  {
    id: "project-1",
    title: "DoQ AI Assistant",
    description:
      "Pre-medical consultation intelligence assistant that engages patients through voice and chat to systematically collect medically relevant information before the clinical visit, enhancing consultation readiness and efficiency.",
    tags: ["LLM", "Speech AI", "Agentic Workflows", "Healthcare", "NLP"],
    category: "Healthcare AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a2e1a 0%, #1a4e2a 100%)",
    videoUrl: "/Project_video_files/DoQ AI Assistant.mp4",
    link: { name: "Live", url: "https://qareai.in", external: true },
    featured: true,
    caseStudy: {
      industry: "Healthcare & Clinical Services",
      status: "Piloting at AIIMS and private hospitals across India",
      problem:
        "Healthcare providers continue to rely on manual, form-based, or front-desk-driven patient intake processes that are time-consuming, inconsistent, and prone to information loss. Patients often arrive at consultations without having communicated their symptoms in a structured manner, forcing doctors to spend valuable consultation time on basic data collection rather than clinical reasoning. This leads to shorter effective consultation time, clinician fatigue, and reduced patient throughput.",
      solution:
        "DoQ AI is a pre-medical consultation intelligence assistant designed to prepare both the patient and the doctor before the clinical visit begins. The system engages patients through voice and chat interfaces to systematically collect all medically relevant information. Using guided, adaptive questioning rooted in clinical reasoning, DoQ AI narrows patient-reported symptoms into probabilistic health concerns, ensuring only relevant and high-signal information is captured. It functions as a structured clinical intake layer that enhances consultation readiness and efficiency.",
      impact: [
        "Significant reduction in time spent on repetitive history-taking and irrelevant questioning",
        "Doctors receive concise, structured pre-consultation summaries for faster clinical context-building",
        "Increased patient throughput in high-volume settings while preserving consultation quality",
        "Reduced cognitive load for clinicians and improved time utilization",
        "Shorter, more purposeful consultations with better patient experience",
      ],
      techStack: [
        "Voice (Speech-to-Speech): Real-time telephony via Twilio SIP, Deepgram STT, ElevenLabs TTS",
        "Chat (WhatsApp): Stateful conversations via WABA + Twilio, Redis session context",
        "Multi-stage agentic workflow: Symptom Intake Agent + Doctor Reasoning Agent",
        "Medical-grade LLMs fine-tuned on Indian medical exams (NEET) datasets",
        "Model-agnostic orchestration: GPT-4/GPT-4o/Claude + specialized medical LLMs",
        "Python FastAPI microservices with custom state-machine orchestration",
        "Automated SOAP reports with symptom timelines, risk flags & confidence scores",
      ],
    },
  },
  {
    id: "project-2",
    title: "TalQ — Clinical Documentation",
    description:
      "Doctor-in-the-loop conversation intelligence system that captures real doctor-patient consultations and converts them into accurate, transcript-grounded SOAP notes. Piloting at AIIMS and private hospitals.",
    tags: ["Speech AI", "NLP", "Healthcare", "SOAP Notes", "Transcription"],
    category: "Healthcare AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a2e24 0%, #1a4e3a 100%)",
    thumbnailUrl: "/project-thumbnails/talq.png",
    featured: true,
    caseStudy: {
      industry: "Healthcare Providers & Hospital Systems",
      status: "Piloting at AIIMS and private hospitals across India",
      problem:
        "Doctors spend a significant portion of consultation time on manual note-taking and post-visit documentation, reducing patient engagement and increasing burnout. In high-volume clinics, documentation can consume 25-40% of a clinician's working time, leading to rushed consultations, delayed records, and reliance on memory-based summaries. Manual documentation often results in loss of conversational nuance, symptom timelines, and clinical reasoning.",
      solution:
        "TalQ provides a doctor-in-the-loop conversation intelligence system that automatically captures and structures real doctor-patient consultations. It records consultations only when explicitly initiated by the doctor, transcribes conversations with medical vocabulary adaptation, and converts them into accurate, transcript-grounded SOAP notes. The system is designed strictly as a summarization and structuring layer, not a diagnostic tool. Doctors retain full control with the ability to review, edit, and finalize notes.",
      impact: [
        "30-50% reduction in documentation time per consultation, allowing doctors to focus more on patient interaction",
        "Improved consultation quality as clinicians no longer need to multitask between listening and writing",
        "Higher consistency and completeness of medical records with standardized SOAP notes",
        "Faster record finalization, reducing post-consultation backlog and improving operational throughput",
        "Reduced clinician burnout, contributing to better retention and sustainable operations",
      ],
      techStack: [
        "Live doctor-initiated recording with explicit start/stop control",
        "WebSocket streaming for clinic microphones, mobile & web apps",
        "AWS Transcribe (Healthcare) + Deepgram with automatic fallback",
        "Medical vocabulary adaptation via fine-tuned medical LLM",
        "Speaker diarization separating doctor and patient utterances",
        "LLM-based clinical summarization grounded strictly in transcript",
        "Hallucination controls via schema-enforced JSON, evidence grounding & confidence scoring",
        "Python FastAPI microservices with async pipelines, PII masking",
      ],
    },
  },
  // ── Client Projects (PDF order) ──
  {
    id: "project-3",
    title: "Enterprise AI Chatbot",
    description:
      "Intelligent conversational automation platform built for a major telecom operator, handling high-volume service queries across digital channels with multilingual support and seamless human agent handoff.",
    tags: ["NLP", "Chatbot", "Omnichannel", "Multilingual", "Automation"],
    category: "Customer Experience & Contact Center",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #1a1a3e 0%, #2a2a5e 100%)",
    thumbnailUrl: "/project-thumbnails/enterprise-chatbot.png",
    caseStudy: {
      client: "Major telecom operator (Indonesia)",
      industry: "Customer Experience & Contact Center Automation",
      problem:
        "Telecom operators receive massive volumes of service requests related to billing, service status, plan details, applications, grievances, and policy information. A significant portion of these interactions is repetitive and informational, overwhelming call centers and help desks. This results in long wait times, inconsistent responses, and poor service experience. Traditional support systems are constrained by working hours, agent capacity, and manual workflows.",
      solution:
        "An intelligent, conversational automation platform designed to serve telecom customers across digital channels. It uses natural language understanding to handle high-volume service queries related to accounts, services, applications, and policies in real time. Built as a scalable service automation layer, the chatbot integrates with telecom systems and CRMs to deliver accurate, context-aware responses with multilingual support and seamless human agent handoff.",
      impact: [
        "30-60% reduction in call center and helpdesk load by automating routine service requests",
        "Faster service resolution with significantly reduced wait times for customers",
        "24/7 service availability improving accessibility across geographies and time zones",
        "Lower operational costs by minimizing dependency on manual support staff",
        "Improved service transparency and trust through consistent, accurate, and timely responses",
      ],
      techStack: [
        "Omnichannel Support: Web, mobile apps, messaging platforms, IVR-to-text, government portals",
        "Multilingual: Automatic language detection with regional language and transliteration support",
        "NLP Pipeline: Intent detection, entity extraction, multi-turn context management",
        "Structured knowledge base linking services, workflows, policies with human-in-the-loop learning",
        "API integration with telecom infrastructure, CRMs, and service databases",
        "Modular API-first microservices with high availability, auto-scaling, PII masking & encryption",
      ],
    },
  },
  {
    id: "project-4",
    title: "Floorplan Annotation Platform",
    description:
      "Browser-based instant-annotation platform for PDF floorplans with AI-assisted room label suggestions, built for Stanford & MIT-backed construction tech company. Converts static floor plans into structured, analysis-ready datasets.",
    tags: ["CV", "PDF Processing", "Auto-Classification", "React.js", "AEC"],
    category: "Computer Vision",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #2e1a0a 0%, #4e2a1a 100%)",
    thumbnailUrl: "/project-thumbnails/floorplan.png",
    status: "Confidential Project",
    caseStudy: {
      client: "Stanford & MIT-backed construction tech company (San Francisco)",
      industry: "Architecture, Engineering & Construction Technology",
      problem:
        "Architecture, engineering, and construction teams rely heavily on manual annotation of PDF floor plans — a process that is slow, repetitive, and prone to inconsistencies. Large projects often involve hundreds of plans, where manual labeling can take hours per floor plan, delaying downstream design, analysis, and execution workflows. Manual labeling introduces variability in room names, boundaries, and spatial definitions, reducing data reliability for BIM workflows, construction planning, and spatial analytics.",
      solution:
        "The Floorplan Annotation Platform provides a browser-based, instant-annotation system that lets teams annotate uploaded PDF floorplans without preprocessing or backend setup. Users can create, edit, and manage room-level annotations in real time, supported by assisted room label suggestions that improve speed and consistency. Designed as a data preparation and annotation layer, the platform converts static floor plans into structured, analysis-ready datasets.",
      impact: [
        "50-70% reduction in floor plan annotation time, accelerating project onboarding and design review cycles",
        "Improved labeling consistency and accuracy, reducing downstream rework in BIM, CAD, and construction planning",
        "Faster turnaround for large projects, with support for bulk annotation of 100+ floorplans simultaneously",
        "Lower operational overhead, eliminating the need for specialized tools, preprocessing pipelines, or backend infrastructure",
        "Higher data quality for downstream systems, enabling reliable spatial analytics and digital twins",
      ],
      techStack: [
        "Frontend-Only Architecture: Pure React.js, all processing client-side",
        "PDF Annotation Engine: Multi-page PDF support with real-time bounding box creation & editing",
        "Assisted Labeling: Automatic room classification based on spatial and layout cues",
        "Human-in-the-Loop: Annotators can accept, override, or correct all suggestions",
        "Optimized for high-volume annotation with fast rendering",
      ],
    },
  },
  {
    id: "project-5",
    title: "Intelligent Traffic Management System",
    description:
      "AI-driven traffic management solution combining vehicle tracking, re-identification, and pattern recognition across multiple junction points. Transforming existing CCTV infrastructure into a real-time traffic intelligence layer.",
    tags: ["Object Tracking", "Re-ID", "Pattern Analysis", "Traffic AI", "LSTM", "Forecasting"],
    category: "Computer Vision & AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 100%)",
    videoUrl: "/Project_video_files/Vehicle Tracking & Re-Identification.mp4",
    featured: true,
    caseStudy: {
      client: "State Government in partnership with educational institution",
      industry: "Transportation Planning, Smart City Infrastructure",
      status: "Bengaluru Mobility Challenge 2024 Recognition",
      problem:
        "Urban traffic management remains largely reactive, dependent on manual monitoring and static signal plans derived from historical averages. Such systems are unable to respond dynamically to real-time fluctuations caused by peak demand, incidents, or localized disruptions. Most cities lack granular, continuous traffic data that captures vehicle movements, turning patterns, and inter-junction flows. Despite extensive deployment of CCTV and Safe City camera networks, their use is largely confined to passive surveillance and post-incident analysis.",
      solution:
        "The Intelligent Traffic Management System introduces an AI-driven, data-centric approach to urban traffic control by transforming existing CCTV infrastructure into a real-time traffic intelligence layer. The system continuously analyzes live video feeds to detect, track, and re-identify vehicles across multiple junctions, enabling a dynamic understanding of traffic flow. By combining short-term traffic forecasting with turning movement prediction, the solution enables proactive signal planning and congestion mitigation.",
      impact: [
        "Shift from reactive to proactive traffic management — anticipate congestion before it escalates through forecasting",
        "City-wide traffic intelligence at operational scale — near real-time visibility across multiple junctions simultaneously",
        "Data-driven infrastructure planning — origin-destination flow intelligence for road redesigns, flyovers, and policy interventions",
        "Reduced operational dependence on manual processes — AI-driven analytics improve consistency and scalability",
        "Validated real-world relevance — demonstrated through city-scale pilot deployment and national-level recognition",
      ],
      techStack: [
        "Live CCTV feeds from Safe City cameras",
        "Deep learning pipelines for vehicle detection, classification & multi-object tracking",
        "Robust vehicle Re-ID across non-overlapping camera views",
        "LSTMs and time-series models for short-horizon traffic volume prediction",
        "Modular research-to-production design for cloud or edge-assisted deployment",
        "Designed for city-scale deployment (9,000+ CCTV cameras)",
      ],
    },
  },
  {
    id: "project-6",
    title: "Lobo AI — Personalized Podcast MVP",
    description:
      "AI-powered personalized audio intelligence platform for stock market investors. Users select stocks and receive daily audio briefings with news, summaries, and contextual insights before the market opens.",
    tags: ["NLP", "Generative AI", "TTS", "Backend Automation", "FinTech"],
    category: "AI + Audio Content",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #2e0a1a 0%, #4e1a2a 100%)",
    videoUrl: "/Project_video_files/Lobo AI – Personalized Podcast MVP.mp4",
    link: { name: "Live", url: "https://joinlobo.com", external: true },
    featured: true,
    caseStudy: {
      client: "San Francisco-based investment platform",
      industry: "Financial Services, FinTech",
      problem:
        "Stock market investors are exposed to an overwhelming volume of news, reports, and updates spread across multiple platforms. Filtering this information to identify what is relevant to their specific portfolio is time-consuming and cognitively taxing. Critical stock-specific updates are often missed. Most financial insights are delivered in text-heavy formats that require focused screen time, limiting accessibility during commutes or multitasking.",
      solution:
        "Lobo AI is an AI-powered personalized audio intelligence platform for stock market investors. Users select up to 20 stocks and automatically receive daily, stock-specific audio briefings that include relevant news updates, summaries, and contextual insights. Built as a personalization and content delivery layer, Lobo AI converts large volumes of financial text data into customized, voice-based briefings tailored to each user's portfolio. All curated news and insights are delivered before the stock market opens.",
      impact: [
        "Pre-market readiness — consolidated view of all relevant stock-specific news before trading begins",
        "Significant reduction in information overload — filtered market news covering only selected stocks",
        "Improved decision-making efficiency — investors start the trading day informed and confident",
        "Higher engagement and retention — audio-first delivery integrates into morning routines",
        "Faster reaction to market developments — timely, summarized updates delivered ahead of market hours",
      ],
      techStack: [
        "User-selected stocks (up to 20), real-time financial news feeds, exchange announcements",
        "Entity recognition mapping news to user-selected stocks; relevance ranking & deduplication",
        "NLP models for news classification, extractive & abstractive summarization",
        "Text-to-Speech optimized for financial content clarity and pacing",
        "Event-driven ingestion pipeline, batch processing for pre-market compilation",
        "Scalable: stateless backend services and scalable job queues",
      ],
    },
  },
  {
    id: "project-7",
    title: "Prediction Market Platforms",
    description:
      "Two enterprise prediction market platforms enabling users to stake tokens on event outcomes across sports, crypto, finance, weather, and entertainment with AI-powered multi-language support and automated payout pipelines.",
    tags: ["Web3", "React Native", "Next.js", "TypeScript", "MongoDB"],
    category: "Prediction Markets & Gamified Forecasting",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #2e1a2e 0%, #4e2a4e 100%)",
    thumbnailUrl: "/project-thumbnails/prediction-markets.png",
    caseStudy: {
      client: "Two enterprise clients (under NDA)",
      industry: "Prediction Markets & Gamified Forecasting",
      problem:
        "Decision-makers, researchers, and analysts often lack scalable methods to quantify what a diverse group of informed participants believes will happen in the future. Traditional forecasting relies on expert reports, polls, or heuristics that are slow, biased, and costly. Many token-based platforms struggle to maintain active participation beyond the initial onboarding phase. Without interactive use cases, token utility diminishes and user retention drops.",
      solution:
        "Both platforms provide structured, gamified environments where users stake tokens on predicted outcomes. Platform A enables users to stake on price ranges for assets (crypto, stocks, forex, commodities), with collective stake distribution surfacing crowd-sourced confidence levels. Platform B focuses on binary Yes/No predictions across sports, weather, entertainment, and crypto with AI-powered multi-language support, automated payout pipelines, and third-party token integration.",
      impact: [
        "Emergent probability signals — crowd-sourced confidence levels providing insight into collective expectations",
        "Increased token utility and engagement — users have compelling reasons to earn, hold, and stake tokens",
        "Global accessibility — multi-language support (English, Japanese, Mongolian) expands participant base",
        "Operational efficiency — automated event scheduling, outcome resolution, and payout processing",
        "Trust through transparency — proportional payout logic, refund guarantees, and audit logging",
        "Gamification that retains — streak tracking, leaderboards, and win rate statistics",
      ],
      techStack: [
        "Backend: Node.js/Express with TypeScript, MongoDB (Mongoose ODM), BullMQ + Redis",
        "Admin Dashboard: React/Next.js with TanStack Query, Tailwind CSS, ApexCharts/Recharts",
        "Zod schema validation, JWT authentication, MongoDB transactions for atomic operations",
        "Platform A: React Native (Expo) mobile app, price-range pool logic, Firebase Cloud Messaging",
        "Platform B: Next.js 15 web app with Turbopack, binary Yes/No markets, OpenAI-powered translations",
      ],
    },
  },
  // ── Remaining projects ──
  {
    id: "project-8",
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
    id: "project-9",
    title: "Supply Chain Optimization",
    description:
      "AI-driven supply chain optimization platform leveraging forecasting and analytics to streamline operations and reduce costs.",
    tags: ["Optimization", "Forecasting", "Analytics"],
    category: "Supply Chain AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #0a1a2e 0%, #1a2a4e 100%)",
    thumbnailUrl: "/project-thumbnails/supply-chain.png",
    status: "Confidential Project",
  },
  {
    id: "project-10",
    title: "Quantum Neural Networks",
    description:
      "Research project exploring the intersection of quantum computing and neural networks for next-generation AI architectures.",
    tags: ["Quantum Computing", "Neural Networks", "Research"],
    category: "Quantum AI",
    filterGroup: "ai",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #2a1a4e 100%)",
    thumbnailUrl: "/project-thumbnails/quantum-neural.png",
    status: "Confidential Project",
  },
  {
    id: "project-11",
    title: "Phitness — AI-Powered Fitness Betting",
    description:
      "Health tech platform combining AI-powered fitness tracking with gamification and betting mechanics to drive user engagement.",
    tags: ["AI", "Mobile App", "Gamification"],
    category: "Health Tech",
    filterGroup: "web",
    gradient: "linear-gradient(135deg, #0a2e2e 0%, #1a4e4e 100%)",
    thumbnailUrl: "/project-thumbnails/phitness.png",
    link: { name: "Demo", url: "https://phitness.netlify.app/", external: true },
  },
  {
    id: "project-12",
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
    id: "project-13",
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
    id: "project-14",
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

/* ───────────────────── Case Study Overlay ───────────────── */

function CaseStudyOverlay({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const cs = project.caseStudy!;

  // Lock Lenis + body scroll + capture wheel events
  useEffect(() => {
    const lenis = getLenisInstance();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      const l = getLenisInstance();
      l?.start();
      document.body.style.overflow = "";
    };
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12 md:px-8 md:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Content */}
      <motion.div
        data-lenis-prevent
        data-casestudy-overlay
        className="relative w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl bg-[#0c0c0c] border border-white/[0.06]"
        style={{ overscrollBehavior: "contain" }}
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} — Case Study`}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="sticky top-4 float-right mr-4 mt-4 z-20 w-9 h-9 rounded-full border border-white/10
            flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors bg-[#0c0c0c]/80 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* ─── Header ─── */}
        <div className="px-8 md:px-12 pt-10 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-accent/60">
              Case Study
            </span>
            <span className="w-px h-3 bg-white/10" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-white/50">
              {cs.industry}
            </span>
          </div>

          <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-[1.2] mb-3">
            {project.title}
          </h3>

          {(cs.client || cs.status) && (
            <div className="flex items-center gap-3 flex-wrap">
              {cs.client && (
                <span className="font-body text-sm text-white/55">{cs.client}</span>
              )}
              {cs.status && (
                <span className="px-2 py-0.5 rounded border border-accent/20 text-accent/60 text-[10px] font-mono tracking-wider">
                  {cs.status}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="w-full h-px bg-white/[0.04]" />

        {/* ─── Body ─── */}
        <div className="px-8 md:px-12 py-8 space-y-10">
          {/* Challenge */}
          <div>
            <h4 className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/50 mb-4">
              Challenge
            </h4>
            <p className="font-body text-[15px] text-white/70 leading-[1.75]">
              {cs.problem}
            </p>
          </div>

          {/* Approach */}
          <div>
            <h4 className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/50 mb-4">
              Approach
            </h4>
            <p className="font-body text-[15px] text-white/70 leading-[1.75]">
              {cs.solution}
            </p>
          </div>

          <div className="w-full h-px bg-white/[0.04]" />

          {/* Results + Stack — side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Results */}
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/50 mb-5">
                Results
              </h4>
              <ul className="space-y-3">
                {cs.impact.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 font-body text-[13px] text-white/65 leading-[1.65]"
                  >
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-accent/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stack */}
            <div>
              <h4 className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/50 mb-5">
                Stack
              </h4>
              <div className="space-y-2">
                {cs.techStack.map((tech, i) => (
                  <div
                    key={i}
                    className="font-mono text-[12px] text-white/60 leading-relaxed pl-3 border-l border-white/[0.08]"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="px-8 md:px-12 py-6 border-t border-white/[0.04]">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded border border-white/[0.08] text-white/40 text-[10px] font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.link && (
              <a
                href={project.link.url}
                target={project.link.external ? "_blank" : undefined}
                rel={project.link.external ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1.5 text-accent/70 hover:text-accent font-mono text-[11px] tracking-wider transition-colors"
              >
                {project.link.name}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6H9M9 6L7 4M9 6L7 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────── Grid Card ───────────────────── */

function GridCard({
  project,
  index,
  onClick,
  onCaseStudy,
}: {
  project: Project;
  index: number;
  onClick: () => void;
  onCaseStudy: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) scale(1.02)`;
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.currentTarget.style.transform =
        "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
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
        onMouseEnter={handleMouseEnter}
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

        {/* Video background for projects with video — paused by default, plays on hover */}
        {mounted && project.videoUrl && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            src={project.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {/* Thumbnail image for non-video projects */}
        {mounted && !project.videoUrl && project.thumbnailUrl && (
          <img
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            src={project.thumbnailUrl}
            alt=""
            loading="lazy"
          />
        )}

        {/* Grid pattern fallback (only for cards with no video and no thumbnail) */}
        {!project.videoUrl && !project.thumbnailUrl && (
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
        )}

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
          <div className="flex flex-wrap gap-1.5 mb-3">
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

          {/* Case Study button — visible on hover if caseStudy exists */}
          {project.caseStudy && (
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10
                text-accent text-[11px] font-mono tracking-wider uppercase
                opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0
                transition-all duration-300 hover:bg-accent/20 hover:border-accent/50 z-10 relative"
              onClick={(e) => {
                e.stopPropagation();
                onCaseStudy();
              }}
              aria-label={`View case study for ${project.title}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent">
                <path d="M2 3h8M2 6h5M2 9h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              View Case Study
            </button>
          )}
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
  onCaseStudy,
}: {
  project: Project;
  navProjects: Project[];
  onClose: () => void;
  onNavigate: (id: string) => void;
  onCaseStudy: (id: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentIndex = navProjects.findIndex((p) => p.id === project.id);
  const prevProject =
    currentIndex > 0 ? navProjects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < navProjects.length - 1
      ? navProjects[currentIndex + 1]
      : null;

  // Lock Lenis + body scroll + capture wheel events
  useEffect(() => {
    const lenis = getLenisInstance();
    lenis?.stop();
    document.body.style.overflow = "hidden";
    return () => {
      const l = getLenisInstance();
      l?.start();
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12 md:px-8 md:py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Content card */}
      <motion.div
        data-lenis-prevent
        className="relative w-full max-w-5xl max-h-[80vh] overflow-y-auto rounded-2xl border border-white/[0.06] bg-[#0c0c0c]"
        style={{ overscrollBehavior: "contain" }}
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 30, stiffness: 260 }}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center
            text-white/40 hover:text-white hover:border-white/25 transition-colors bg-[#0c0c0c]/80 backdrop-blur-sm"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/10
              flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors bg-[#0c0c0c]/80 backdrop-blur-sm"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full border border-white/10
              flex items-center justify-center text-white/40 hover:text-white hover:border-white/25 transition-colors bg-[#0c0c0c]/80 backdrop-blur-sm"
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

        {/* Video or thumbnail hero */}
        {project.videoUrl ? (
          <video
            ref={videoRef}
            className="w-full aspect-video object-cover rounded-t-2xl"
            src={project.videoUrl}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : project.thumbnailUrl ? (
          <div className="w-full aspect-video rounded-t-2xl relative overflow-hidden bg-[#111]">
            <img
              className="w-full h-full object-cover opacity-70"
              src={project.thumbnailUrl}
              alt=""
            />
          </div>
        ) : (
          <div
            className="w-full aspect-video rounded-t-2xl relative overflow-hidden bg-[#111]"
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-8xl font-bold text-white/[0.03]">
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
        <div className="relative p-6 md:p-10">
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

            <div className="flex items-center gap-3 shrink-0">
              {project.caseStudy && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); setTimeout(() => onCaseStudy(project.id), 100); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/30 text-accent font-medium text-sm hover:bg-accent/10 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 3.5h12M2 3.5v10a1 1 0 001 1h10a1 1 0 001-1v-10M5.5 1v2.5M10.5 1v2.5M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  View Case Study
                </button>
              )}
              {project.link && (
                <a
                  href={project.link.url}
                  target={project.link.external ? "_blank" : undefined}
                  rel={
                    project.link.external ? "noopener noreferrer" : undefined
                  }
                  className="inline-flex items-center gap-2 text-accent font-medium text-sm hover:gap-3 transition-all duration-300"
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
  const [caseStudyId, setCaseStudyId] = useState<string | null>(null);

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.filterGroup === activeFilter);

  const selectedProject = selectedId
    ? projects.find((p) => p.id === selectedId) ?? null
    : null;

  const caseStudyProject = caseStudyId
    ? projects.find((p) => p.id === caseStudyId) ?? null
    : null;

  const handleNavigate = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleCaseStudyClose = useCallback(() => {
    setCaseStudyId(null);
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
                onCaseStudy={() => setCaseStudyId(project.id)}
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
            onCaseStudy={(id) => { setSelectedId(null); setCaseStudyId(id); }}
          />
        )}
      </AnimatePresence>

      {/* Case Study Overlay */}
      <AnimatePresence>
        {caseStudyProject && caseStudyProject.caseStudy && (
          <CaseStudyOverlay
            project={caseStudyProject}
            onClose={handleCaseStudyClose}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
