"use client";

import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import { motion, useInView } from "framer-motion";
import * as THREE from "three";

// Neural network: nodes as spheres, connections as lines
function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate nodes in 3 layers (input, hidden, output)
  const { nodes, edges } = useMemo(() => {
    const n: THREE.Vector3[] = [];
    const e: [number, number][] = [];

    const layers = [
      { count: 4, x: -2 },
      { count: 5, x: 0 },
      { count: 3, x: 2 },
    ];

    let idx = 0;
    const layerIndices: number[][] = [];

    for (const layer of layers) {
      const ids: number[] = [];
      for (let i = 0; i < layer.count; i++) {
        const ySpread = (layer.count - 1) / 2;
        const y = (i - ySpread) * 0.9;
        const z = (Math.random() - 0.5) * 0.6;
        n.push(new THREE.Vector3(layer.x, y, z));
        ids.push(idx++);
      }
      layerIndices.push(ids);
    }

    // Connect adjacent layers
    for (let l = 0; l < layerIndices.length - 1; l++) {
      for (const from of layerIndices[l]) {
        for (const to of layerIndices[l + 1]) {
          e.push([from, to]);
        }
      }
    }

    return { nodes: n, edges: e };
  }, []);

  // Edge geometry
  const linePositions = useMemo(() => {
    const arr: number[] = [];
    for (const [a, b] of edges) {
      arr.push(nodes[a].x, nodes[a].y, nodes[a].z);
      arr.push(nodes[b].x, nodes[b].y, nodes[b].z);
    }
    return new Float32Array(arr);
  }, [nodes, edges]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x += 0.001;
    }
  });

  useEffect(() => {
    return () => {
      // Cleanup handled by R3F
    };
  }, []);

  return (
    <group ref={groupRef}>
      {/* Edges */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4af2c8" transparent opacity={0.15} />
      </lineSegments>

      {/* Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#4af2c8"
            emissive="#4af2c8"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function BackgroundScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-3, -3, -3]} intensity={0.3} color="#a78bfa" />
      <NeuralNetwork />
    </>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  // Wider margin to preload canvas before section is visible
  const isNearView = useInView(sectionRef, { once: true, margin: "200px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" as const },
    },
  };

  return (
    <section ref={sectionRef} id="about" className="relative z-10 py-24 md:py-40 overflow-hidden bg-background">
      {/* R3F Background — subtle torus knot (lazy-mounted, skipped on mobile) */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        {isNearView && !isMobile && (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            dpr={[1, 1.5]}
            gl={{ antialias: false, alpha: true }}
          >
            <Suspense fallback={null}>
              <BackgroundScene />
            </Suspense>
            <Preload all />
          </Canvas>
        )}
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <h2 className="sr-only">About QreateAI</h2>
        <motion.div
          className="grid md:grid-cols-2 gap-12 md:gap-20 items-start"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left — Pull Quote */}
          <motion.div variants={itemVariants}>
            <div className="md:sticky md:top-32">
              <span className="font-mono text-accent text-xs tracking-widest uppercase mb-6 block">
                Our Philosophy
              </span>
              <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-medium italic text-text-primary leading-snug">
                &ldquo;Too niche. Too bold. Too bad. We build it anyway.&rdquo;
              </blockquote>
              <div className="mt-8 h-px w-16 bg-accent/50" />
            </div>
          </motion.div>

          {/* Right — Approach Paragraphs */}
          <motion.div className="space-y-6" variants={containerVariants}>
            <motion.p
              className="font-body text-text-primary/70 text-base md:text-lg leading-relaxed"
              variants={itemVariants}
            >
              Qreate AI was founded by three co-founders who saw a gap in the market:
              companies needed cutting-edge AI and LLM-powered software solutions, but
              few teams had the breadth of expertise to deliver them end-to-end. From
              computer vision and NLP to full-stack development and agentic workflows,
              we bring it all under one roof.
            </motion.p>

            <motion.p
              className="font-body text-text-primary/70 text-base md:text-lg leading-relaxed"
              variants={itemVariants}
            >
              Our team brings together backgrounds from the National University of
              Singapore, National Taiwan University, IIIT Delhi, the Indian Institute
              of Science, Samsung Research, and Hyperverge. This diverse expertise lets
              us tackle problems that span modalities — vision, language, and
              intelligence — from early-stage startups to enterprises globally.
            </motion.p>

            <motion.p
              className="font-body text-text-primary/70 text-base md:text-lg leading-relaxed"
              variants={itemVariants}
            >
              With 10+ projects and partnerships under our belt, we&apos;ve built everything
              from intelligent traffic management systems and personalized podcast
              platforms to supply chain optimization tools and quantum neural network
              research. Whatever the challenge, our approach stays the same: understand
              deeply, build rigorously, and deliver solutions that work.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
