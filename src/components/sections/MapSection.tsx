"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";

/* ───────────────────── Map Data ───────────────────── */

// Grid: 72 cols × 36 rows, 5° resolution
const LAND: [number, number, number][] = [
  [1,24,31],
  [2,16,22],[2,24,32],[2,46,48],[2,55,57],
  [3,2,7],[3,10,32],[3,39,42],[3,44,71],
  [4,3,7],[4,10,28],[4,31,33],[4,37,42],[4,44,71],
  [5,2,8],[5,10,25],[5,31,33],[5,37,70],
  [6,4,8],[6,10,25],[6,34,70],
  [7,7,25],[7,34,70],
  [8,10,24],[8,34,70],
  [9,11,22],[9,34,65],
  [10,12,21],[10,34,65],
  [11,13,20],[11,33,65],
  [12,14,20],[12,33,60],
  [13,16,19],[13,33,47],[13,50,60],
  [14,18,19],[14,33,47],[14,51,58],[14,60,61],
  [15,19,19],[15,33,45],[15,51,52],[15,55,58],[15,60,61],
  [16,20,22],[16,33,46],[16,51,52],[16,55,61],
  [17,21,26],[17,33,46],[17,56,60],[17,63,64],
  [18,21,29],[18,34,46],[18,56,61],[18,62,64],
  [19,21,29],[19,39,46],[19,57,61],[19,63,64],
  [20,22,29],[20,38,46],[20,60,64],
  [21,23,29],[21,38,46],
  [22,25,28],[22,41,46],[22,59,63],
  [23,24,28],[23,39,43],[23,45,46],[23,59,67],
  [24,22,26],[24,40,42],[24,59,67],
  [25,22,25],[25,63,67],[25,70,71],
  [26,22,23],[26,65,65],[26,70,71],
  [27,21,23],
  [28,22,23],
];

const USA: [number, number, number][] = [
  [8,11,23],[9,11,22],[10,12,21],[11,13,20],[12,16,20],
];
const INDIA: [number, number, number][] = [
  [11,50,54],[12,50,55],[13,50,55],[14,51,54],[15,51,53],[16,51,52],
];
const INDONESIA: [number, number, number][] = [
  [16,55,57],[17,56,60],[18,56,61],[19,57,64],[20,60,64],
];
const SINGAPORE_POS = { row: 16, col: 57 };

interface Dot { col: number; row: number; country?: string }

function buildDots(): Dot[] {
  const m = new Map<string, Dot>();
  for (const [r, s, e] of LAND)
    for (let c = s; c <= e; c++) m.set(`${r}-${c}`, { row: r, col: c });
  const tag = (segs: [number, number, number][], id: string) => {
    for (const [r, s, e] of segs)
      for (let c = s; c <= e; c++) {
        const k = `${r}-${c}`;
        const d = m.get(k);
        if (d) d.country = id;
        else m.set(k, { row: r, col: c, country: id });
      }
  };
  tag(USA, "usa");
  tag(INDIA, "india");
  tag(INDONESIA, "indonesia");
  const sk = `${SINGAPORE_POS.row}-${SINGAPORE_POS.col}`;
  const sd = m.get(sk);
  if (sd) sd.country = "singapore";
  else m.set(sk, { ...SINGAPORE_POS, country: "singapore" });
  return Array.from(m.values());
}

const ALL_DOTS = buildDots();

interface CityInfo {
  id: string;
  name: string;
  country: string;
  countryKey: string;
  lat: number;
  lng: number;
}

const cities: CityInfo[] = [
  { id: "nyc", name: "New York", country: "USA", countryKey: "usa", lat: 40.7128, lng: -74.006 },
  { id: "sf", name: "San Francisco", country: "USA", countryKey: "usa", lat: 37.7749, lng: -122.4194 },
  { id: "delhi", name: "New Delhi", country: "India", countryKey: "india", lat: 28.6139, lng: 77.209 },
  { id: "sg", name: "Singapore", country: "Singapore", countryKey: "singapore", lat: 1.3521, lng: 103.8198 },
  { id: "jkt", name: "Jakarta", country: "Indonesia", countryKey: "indonesia", lat: -6.2088, lng: 106.8456 },
];

/* City positions mapped to nearest existing grid dot in their country */
const CITY_GRID: Record<string, { row: number; col: number }> = {
  nyc: { row: 10, col: 21 },
  sf: { row: 10, col: 12 },
  delhi: { row: 12, col: 51 },
  sg: { row: 16, col: 57 },
  jkt: { row: 19, col: 57 },
};

const CITY_DOT_KEYS = new Set(
  Object.values(CITY_GRID).map((p) => `${p.row}-${p.col}`)
);

/* ───────────────────── Hooks ──────────────────────── */

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!start || started.current) return;
    started.current = true;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);

  return count;
}

function StatsDisplay({ isVisible }: { isVisible: boolean }) {
  const partnerships = useCountUp(30, 1800, isVisible);
  const industries = useCountUp(7, 1800, isVisible);
  const continents = useCountUp(2, 1500, isVisible);
  const countries = useCountUp(4, 1500, isVisible);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Primary stats row */}
      <p className="font-display text-3xl md:text-5xl lg:text-6xl text-text-primary/80 font-semibold tracking-tight">
        <span className="text-accent font-bold tabular-nums">{partnerships}+</span>{" "}
        Partnerships
        <span className="mx-2 md:mx-3 text-text-primary/30">·</span>
        <span className="text-accent font-bold tabular-nums">{industries}+</span>{" "}
        Industries
      </p>

      {/* Geographic reach row */}
      <p className="font-display text-3xl md:text-5xl lg:text-6xl text-text-primary/80 font-semibold tracking-tight">
        Across{" "}
        <span className="text-accent font-bold tabular-nums">{continents}</span>{" "}
        Continents
        <span className="mx-2 md:mx-3 text-text-primary/30">·</span>
        <span className="text-accent font-bold tabular-nums">{countries}</span>{" "}
        Countries
      </p>
    </div>
  );
}

/* ───────────────────── Dot Map ─────────────────────── */

function DotMap({ activeCountry, onHoverCountry }: {
  activeCountry: string | null;
  onHoverCountry: (key: string | null) => void;
}) {
  return (
    <svg viewBox="0 0 725 365" className="w-full h-auto">
      {ALL_DOTS.map((d) => {
        const isHighlighted = d.country != null;
        const isActive = d.country === activeCountry;
        const dotKey = `${d.row}-${d.col}`;
        const isCityDot = CITY_DOT_KEYS.has(dotKey);

        return (
          <g key={dotKey}>
            {/* Pulse ring on city dots */}
            {isCityDot && (
              <circle
                cx={d.col * 10 + 5}
                cy={d.row * 10 + 5}
                r="5"
                fill="none"
                stroke="#4af2c8"
                strokeWidth="1"
                opacity={isActive ? 0.8 : 0.4}
              >
                <animate attributeName="r" from="5" to="18" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" from={isActive ? "0.8" : "0.4"} to="0" dur="3s" repeatCount="indefinite" />
              </circle>
            )}
            {/* Dot */}
            <circle
              cx={d.col * 10 + 5}
              cy={d.row * 10 + 5}
              r={isCityDot ? 3.5 : isActive ? 3.2 : isHighlighted ? 2.8 : 2}
              fill={isHighlighted ? "#4af2c8" : "#ffffff"}
              opacity={isCityDot ? 1 : isActive ? 0.95 : isHighlighted ? 0.5 : 0.25}
              className="transition-all duration-200"
              style={isHighlighted ? { cursor: "pointer" } : undefined}
              onMouseEnter={isHighlighted ? () => onHoverCountry(d.country!) : undefined}
              onMouseLeave={isHighlighted ? () => onHoverCountry(null) : undefined}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────────── Combined Section ───────────────── */

export function MapSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const handleCardHover = useCallback((cityId: string | null) => {
    setActiveCity(cityId);
    if (cityId) {
      const city = cities.find((c) => c.id === cityId);
      setActiveCountry(city?.countryKey ?? null);
    } else {
      setActiveCountry(null);
    }
  }, []);

  const handleMapHover = useCallback((countryKey: string | null) => {
    setActiveCountry(countryKey);
    setActiveCity(null);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.4 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="global"
      className="relative z-10 py-24 md:py-32 overflow-hidden"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 bg-surface" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(74, 242, 200, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(167, 139, 250, 0.04) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-mono text-accent text-xs tracking-widest uppercase mb-10 md:mb-14 block text-center"
        >
          Operations
        </motion.span>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 md:mb-20"
        >
          <StatsDisplay isVisible={isInView} />
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <DotMap activeCountry={activeCountry} onHoverCountry={handleMapHover} />

          {/* Ambient glow */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-10"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(74,242,200,0.2) 0%, transparent 70%)",
            }}
          />
        </motion.div>

        {/* City cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mt-10"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {cities.map((city) => {
            const isActive = city.id === activeCity;
            return (
              <motion.div
                key={city.id}
                variants={cardVariants}
                className={`group relative p-4 md:p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-accent/40 bg-accent/10"
                    : "border-white/10 bg-surface/50 hover:border-accent/20 hover:bg-accent/5"
                }`}
                onMouseEnter={() => handleCardHover(city.id)}
                onMouseLeave={() => handleCardHover(null)}
              >
                <div
                  className={`w-2 h-2 rounded-full mb-3 transition-all duration-200 ${
                    isActive ? "bg-accent shadow-[0_0_8px_rgba(74,242,200,0.6)]" : "bg-accent/40"
                  }`}
                />
                <h3 className="font-display text-base md:text-lg font-semibold text-text-primary">
                  {city.name}
                </h3>
                <p className="font-mono text-[11px] text-text-primary/50 uppercase tracking-wider mt-1">
                  {city.country}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
