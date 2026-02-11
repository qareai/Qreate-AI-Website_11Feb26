"use client";

import Image from "next/image";

/* ─── Team Background Logo Marquee Section ─── */

interface InstitutionLogo {
  name: string;
  filename: string;
}

const institutionLogos: InstitutionLogo[] = [
  { name: "National University of Singapore", filename: "National University of Singapore.png" },
  { name: "National Taiwan University", filename: "National Taiwan University.png" },
  { name: "IIIT Delhi", filename: "IIIT Delhi.png" },
  { name: "Indian Institute of Science", filename: "Indian Institute of Science.png" },
  { name: "Samsung Research", filename: "Samsung Research.png" },
  { name: "Hyperverge", filename: "Hyperverge.png" },
  { name: "University of South Carolina", filename: "University of South Carolina.png" },
];

export function TeamBackgroundSection() {
  return (
    <section className="relative z-10 py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 mb-8">
          <p className="font-display text-sm md:text-base text-text-primary/60 uppercase tracking-wider text-center">
            Team Background
          </p>
          <p className="font-body text-xs text-text-primary/40 text-center mt-2">
            Bringing together expertise from world-class institutions and leading tech companies
          </p>
        </div>

        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />

          <div className="marquee-container">
            <div className="marquee-track">
              {/* Double the logos for seamless loop */}
              {[...institutionLogos, ...institutionLogos].map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="flex items-center justify-center mx-8 md:mx-12 select-none"
                  style={{ width: "120px", height: "40px", flexShrink: 0 }}
                >
                  <Image
                    src={`/team_background_images/${item.filename}`}
                    alt={item.name}
                    width={120}
                    height={40}
                    className="max-h-full max-w-full object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
