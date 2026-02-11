"use client";

import { useRef, useState, ReactNode, CSSProperties } from "react";
import { motion } from "framer-motion";

interface MagneticLinkProps {
  children: ReactNode;
  href?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export function MagneticLink({
  children,
  href = "#",
  className = "",
  style,
  onClick,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.3;
    const deltaY = (e.clientY - centerY) * 0.3;

    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      className={`relative inline-block ${className}`}
      style={style}
    >
      {children}
    </motion.a>
  );
}
