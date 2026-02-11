"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticLink } from "@/components/ui/MagneticLink";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Work", href: "#work" },
  { name: "Global", href: "#global" },
  { name: "Team", href: "#team" },
  { name: "Contact", href: "#cta-section" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 transition-all duration-500 ${
          isScrolled
            ? "backdrop-blur-md bg-background/80 border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1 z-50">
            <span className="font-display text-2xl font-bold text-text-primary">
              Qreate
            </span>
            <span className="font-display text-2xl font-bold text-accent">
              AI
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <MagneticLink
                key={link.name}
                href={link.href}
                className="text-text-secondary hover:text-text-primary transition-colors duration-300 text-sm tracking-wide uppercase font-medium"
              >
                {link.name}
              </MagneticLink>
            ))}
            <MagneticLink
              href="#contact"
              className="px-6 py-2.5 bg-accent text-background rounded-full font-semibold text-sm hover:glow-accent transition-all duration-300"
            >
              Get Started
            </MagneticLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={{
                rotate: isMobileMenuOpen ? 45 : 0,
                y: isMobileMenuOpen ? 6 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="block w-6 h-0.5 bg-text-primary origin-center"
            />
            <motion.span
              animate={{
                opacity: isMobileMenuOpen ? 0 : 1,
                scaleX: isMobileMenuOpen ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="block w-6 h-0.5 bg-text-primary"
            />
            <motion.span
              animate={{
                rotate: isMobileMenuOpen ? -45 : 0,
                y: isMobileMenuOpen ? -6 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="block w-6 h-0.5 bg-text-primary origin-center"
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Background gradient orbs */}
              <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent-secondary/10 blur-[80px]" />

              <nav className="flex flex-col items-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-4xl font-bold text-text-primary hover:text-accent transition-colors duration-300"
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.a
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{
                    duration: 0.4,
                    delay: navLinks.length * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-6 px-8 py-4 bg-accent text-background rounded-full font-semibold text-lg"
                >
                  Get Started
                </motion.a>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
