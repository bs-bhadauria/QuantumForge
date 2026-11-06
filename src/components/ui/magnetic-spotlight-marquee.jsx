"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { Sparkles, Atom, Cpu, Binary, Layers, Terminal, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

export const DEFAULT_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    title: "Cryogenic Dilution Core",
    tag: "15 mK Hardware",
    formula: "H = ∑ ω_i a†a + g(a†b + ab†)",
    icon: Atom,
  },
  {
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    title: "Qubit Matrix Processor",
    tag: "Transmon Architecture",
    formula: "U_circuit = ∏ U_k(θ, ϕ)",
    icon: Cpu,
  },
  {
    url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=800&auto=format&fit=crop",
    title: "Optical Entanglement Lattice",
    tag: "EPR Pairs (|Φ⁺⟩)",
    formula: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    icon: Activity,
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    title: "Statevector Wavefunction",
    tag: "Aer C++ Simulation",
    formula: "|ψ(t)⟩ = e^{-iHt/ℏ} |ψ(0)⟩",
    icon: Binary,
  },
  {
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    title: "Deterministic CI Engine",
    tag: "Zero-Queue Fast Feedback",
    formula: "F(ρ, σ) = (Tr√(√ρ σ √ρ))²",
    icon: Terminal,
  },
  {
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    title: "Clifford+T Decomposition",
    tag: "Fault-Tolerant Synthesis",
    formula: "T = diag(1, e^{iπ/4})",
    icon: Layers,
  },
];

export function MagneticSpotlightMarquee({
  title = ["QuantumForge"],
  subtitle = ["SIMULATE FASTER", "PROTOTYPE DEEPER"],
  paragraphs = [
    [
      "QuantumForge is an interactive quantum simulation and algorithmic prototyping studio powered by Qiskit Aer, specializing in deterministic statevector analysis and Pauli gate decomposition."
    ],
    [
      "We prioritize developer experience and verified quantum accuracy. Our studio spans interactive circuit composing, Bloch sphere telemetry, and OpenQASM 3.0 exports."
    ]
  ],
  images = DEFAULT_IMAGES,
  footerText = "We navigate in no-nonsense environments pushing the boundaries of quantum simulation. Whether you're researching fault-tolerant quantum algorithms or prototyping variational circuits, QuantumForge ensures bit-exact reproducible execution.",
  navEmail = "aer@quantumforge.dev",
  navLinks = "Circuit Studio, Algorithm Library, Documentation, IBM Aer",
  className,
}) {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse Coordinates for Magnetic Spotlight
  const mouseX = useMotionValue(600);
  const mouseY = useMotionValue(350);

  // Spring physics for smooth spotlight momentum
  const smoothX = useSpring(mouseX, { damping: 24, stiffness: 180 });
  const smoothY = useSpring(mouseY, { damping: 24, stiffness: 180 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // Infinite Marquee Track List (doubled for seamless loop)
  const marqueeItems = [...images, ...images];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative w-full overflow-hidden rounded-3xl bg-[#03060c] border border-outline-variant/50 pt-10 pb-12 px-6 sm:px-10 text-white select-none transition-colors",
        className
      )}
    >
      {/* 1. MAGNETIC SPOTLIGHT OVERLAY */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl z-30 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${smoothX}px ${smoothY}px,
              rgba(0, 242, 254, 0.18),
              rgba(255, 255, 255, 0.06) 35%,
              transparent 75%
            )
          `,
          opacity: isHovered ? 1 : 0.4,
          mixBlendMode: "screen",
        }}
      />

      {/* Floating magnetic cursor follow dot */}
      <motion.div
        className="pointer-events-none absolute z-40 w-4 h-4 rounded-full bg-cyan-400/80 blur-[2px] shadow-[0_0_20px_#00f2fe]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Background Subtle Quantum Dot Matrix */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* 2. TOP DISPLAY TITLE: "QuantumForge" */}
      <div className="relative z-10 w-full flex items-center justify-center overflow-hidden mb-6 sm:mb-8">
        <h1 className="font-serif italic text-white text-[13vw] sm:text-[11vw] lg:text-[9.5rem] leading-[0.9] tracking-tight text-center font-normal drop-shadow-[0_4px_30px_rgba(255,255,255,0.12)]">
          {title.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </h1>
      </div>

      {/* 3. INFINITE HORIZONTAL MARQUEE OF QUANTUM CARDS */}
      <div className="relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] my-4">
        <motion.div
          className="flex gap-6 w-max cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            ease: "linear",
            duration: 36,
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((item, index) => {
            const Icon = item.icon || Atom;
            return (
              <div
                key={`${item.title}-${index}`}
                className="group relative w-[240px] sm:w-[280px] h-[320px] sm:h-[360px] rounded-3xl overflow-hidden shrink-0 border border-white/10 bg-[#070c18] shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:border-cyan-400/60 hover:shadow-[0_12px_36px_rgba(0,242,254,0.22)]"
              >
                {/* Background Image with Dark Vignette */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.75] contrast-[1.1] transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                {/* Ambient Card Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03060c] via-black/30 to-black/40 z-10" />

                {/* Specular Spotlight highlight on hover */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />

                {/* Card Top Pill */}
                <div className="relative z-20 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono text-cyan-300">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.tag}</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Card Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <div className="font-mono text-[11px] text-cyan-400/90 mb-1 tracking-wider">
                    {item.formula}
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl leading-snug group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* 4. CONTENT GRID BELOW MARQUEE (BUILD FASTER / QUANTUMFORGE SPEC) */}
      <div className="relative z-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-10 pt-8 border-t border-white/10">
        {/* Left Column: Bold Tagline Stack */}
        <div className="md:col-span-4">
          <div className="font-extrabold text-2xl sm:text-4xl text-white tracking-tight uppercase leading-[0.95] flex flex-col font-display">
            {subtitle.map((word, wi) => (
              <span key={wi} className={wi % 2 === 1 ? "text-cyan-400 drop-shadow-[0_0_16px_rgba(0,242,254,0.3)]" : "text-white"}>
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Center Column: First Paragraph Block */}
        <div className="md:col-span-4">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            {paragraphs[0] ? paragraphs[0].join(" ") : ""}
          </p>
        </div>

        {/* Right Column: Second Paragraph Block */}
        <div className="md:col-span-4">
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
            {paragraphs[1] ? paragraphs[1].join(" ") : ""}
          </p>
        </div>
      </div>

      {/* 5. BOTTOM PHILOSOPHY FOOTER TEXT */}
      {footerText && (
        <div className="relative z-20 max-w-4xl mx-auto text-center mt-12 pt-8 border-t border-white/5">
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
            {footerText}
          </p>
        </div>
      )}
    </div>
  );
}

export function SpotlightMarqueeDemo() {
  return <MagneticSpotlightMarquee />;
}

export default MagneticSpotlightMarquee;

