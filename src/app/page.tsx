import { HeroSection } from "@/components/hero/HeroSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { FeaturedWorkSection } from "@/components/sections/FeaturedWorkSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { TeamBackgroundSection } from "@/components/sections/StatsSection";
import { MapSection } from "@/components/sections/MapSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QreateAI",
  url: "https://qreateai.com",
  logo: "https://qreateai.com/og-image.png",
  description:
    "Building the future with cutting-edge AI technology. Custom ML, NLP, computer vision, and predictive analytics solutions engineered for enterprise impact.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "team@qareai.com",
    contactType: "sales",
  },
  sameAs: [
    "https://linkedin.com/company/qreateai",
    "https://x.com/qreateai",
    "https://github.com/qreateai",
  ],
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "QreateAI Services",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Service",
        name: "AI/ML Services",
        description:
          "From LLM fine-tuning and computer vision to NLP, text processing, and audio/speech AI — custom models trained for specific domains and use cases.",
        provider: { "@type": "Organization", name: "QreateAI" },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Service",
        name: "Development Stack",
        description:
          "Full-stack development with modern frameworks. React and Vite frontends, FastAPI and Python backends, Firebase and Redis databases, GCP and AWS deployments.",
        provider: { "@type": "Organization", name: "QreateAI" },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Service",
        name: "Specialized Solutions",
        description:
          "Agentic AI workflows, data analytics with ETL pipelines, workflow automation, and custom AI models tailored to specific business needs.",
        provider: { "@type": "Organization", name: "QreateAI" },
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen relative noise-overlay">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd),
        }}
      />

      {/* Hero Section with Animated Text */}
      <HeroSection />

      {/* Services Section with 3D Blocks */}
      <ServicesSection />

      {/* About — Pull Quote + Approach */}
      <AboutSection />

      {/* Featured Work */}
      <FeaturedWorkSection />

      {/* Design & Engineering Partners */}
      <PartnersSection />

      {/* Global Reach — Stats + Map */}
      <MapSection />

      {/* Meet the Founders */}
      <TeamSection />

      {/* Team Background — Institution Logos */}
      <TeamBackgroundSection />

      {/* Our Process */}
      <ProcessSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA — Converging Particles */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
