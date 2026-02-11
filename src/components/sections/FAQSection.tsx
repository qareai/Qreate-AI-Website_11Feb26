"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What all services does Qreate AI offer?",
    answer:
      "Comprehensive AI/ML solutions including Computer Vision, Reinforcement Learning, ETL Pipelining, and Audio/Speech processing. Development stack covers React frontends, FastAPI backends, and cloud deployment on GCP/AWS.",
  },
  {
    question: "How long does a typical software development project take?",
    answer:
      "Simple integrations: 2-4 weeks, comprehensive AI applications: 8-16 weeks. Detailed timelines provided during initial consultation.",
  },
  {
    question: "What does the broader process look like?",
    answer:
      "Three key phases: Ideation (understanding vision and goals), Development (designing and building solution), and Launch (deploying and providing ongoing support). Close collaboration maintained throughout.",
  },
  {
    question: "What kind of quality assurance do we have? Do we offer maintenance?",
    answer:
      "Comprehensive testing protocols and quality assurance measures throughout development. Ongoing maintenance and support services provided to ensure optimal performance and technology updates.",
  },
];

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-4">
          <span className="font-mono text-xs text-accent/60">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-display text-base md:text-lg font-medium text-text-primary group-hover:text-accent transition-colors duration-300">
            {faq.question}
          </span>
        </span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-text-secondary shrink-0 ml-4"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            d="M10 4V16M4 10H16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="font-body text-sm md:text-base text-text-primary/70 leading-relaxed pb-6 pl-10">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} id="faq" className="relative z-10 py-24 md:py-32 bg-background">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="font-mono text-accent text-xs tracking-widest uppercase mb-4 block"
          >
            Questions
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary"
          >
            <span className="text-gradient">FAQs</span>
          </motion.h2>
        </div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {faqs.map((faq, index) => (
            <FAQItem key={index} faq={faq} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
