import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { ScrollBackground } from "@/components/layout/ScrollBackground";
import { PageTransition } from "@/components/layout/PageTransition";
import { Navbar } from "@/components/layout/Navbar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Scene3D } from "@/components/canvas/Scene3D";

// Display font - bold, geometric
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Body font - General Sans from local file (Fontshare)
// Note: Download General Sans from https://www.fontshare.com/fonts/general-sans
// and place the files in src/app/fonts/
const generalSans = localFont({
  src: [
    {
      path: "./fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

// Mono font - for code/tech accents
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qreateai.com"),
  title: {
    default: "QreateAI - Next Generation AI Solutions",
    template: "%s | QreateAI",
  },
  description:
    "Building the future with cutting-edge AI technology. Custom ML, NLP, computer vision, and predictive analytics solutions engineered for enterprise impact.",
  keywords: [
    "AI",
    "Machine Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Predictive Analytics",
    "Enterprise AI",
    "AI Solutions",
    "QreateAI",
  ],
  authors: [{ name: "QreateAI" }],
  creator: "QreateAI",
  publisher: "QreateAI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "QreateAI",
    title: "QreateAI - Next Generation AI Solutions",
    description:
      "Custom ML, NLP, computer vision, and predictive analytics solutions engineered for enterprise impact.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QreateAI - Next Generation AI Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QreateAI - Next Generation AI Solutions",
    description:
      "Custom ML, NLP, computer vision, and predictive analytics solutions engineered for enterprise impact.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${generalSans.variable} ${jetbrainsMono.variable} font-body antialiased bg-background text-text-primary`}
        suppressHydrationWarning
      >
        <SmoothScrollProvider>
          <ScrollBackground />
          <Scene3D />
          <CustomCursor />
          <Navbar />
          <PageTransition>{children}</PageTransition>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
