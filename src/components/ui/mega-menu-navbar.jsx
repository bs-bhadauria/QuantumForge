"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  Cpu,
  Layers,
  Activity,
  Binary,
  Code2,
  FileCode,
  Sparkles,
  Zap,
  ShieldCheck,
  Database,
  ArrowRight,
  Sun,
  Moon,
  Atom,
  Compass,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Dna,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { AnimatedButton } from "./AnimatedButton";

// Default QuantumForge Features for the 2-column Mega Menu
export const DEFAULT_QUANTUM_FEATURES = [
  {
    title: "Circuit Composer",
    description: "Visual quantum drag-and-drop circuit canvas with real-time DAG transformation.",
    href: "#simulator",
    icon: Layers,
    badge: "Interactive",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    title: "Q-DNA Storage Studio",
    description: "Quantum-optimized biological data encoding with 50% GC balance and homopolymer suppression.",
    href: "#dna",
    icon: Dna,
    badge: "New",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    title: "Qiskit Aer Execution Engine",
    description: "Ultra-fast local C++ statevector simulation engine with zero cloud queue wait times.",
    href: "#capabilities",
    icon: Cpu,
    badge: "v0.3.0",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    title: "Bloch Sphere 3D Telemetry",
    description: "Real-time statevector projection, qubit spherical coordinates (θ, φ), and phase evolution.",
    href: "#capabilities",
    icon: Activity,
  },
  {
    title: "OpenQASM 3.0 Standard",
    description: "Direct syntax parsing, Pauli decomposition, and bi-directional AST circuit serialization.",
    href: "#architecture",
    icon: Binary,
    badge: "Standard",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    title: "Clifford+T Gate Synthesis",
    description: "Fault-tolerant unitary approximation and hardware-efficient gate mapping.",
    href: "#capabilities",
    icon: Atom,
  },
  {
    title: "IBM Quantum Cloud Sync",
    description: "Seamless export ready for execution on physical IBM Heron and Eagle superconducting QPUs.",
    href: "https://qiskit.org",
    icon: ExternalLink,
  },
];

// Default Pre-verified Quantum Algorithms
export const DEFAULT_QUANTUM_USE_CASES = [
  {
    title: "Bell State (|Φ⁺⟩ & |Ψ⁻⟩)",
    description: "Maximally entangled two-qubit Einstein-Podolsky-Rosen state; foundational entanglement resource.",
    href: "#algorithms",
    icon: Sparkles,
    badge: "Foundations",
  },
  {
    title: "Grover's 2-Qubit Search",
    description: "Quadratic O(√N) speedup finding an unstructured database target (|11⟩).",
    href: "#algorithms",
    icon: Zap,
    badge: "Search",
  },
  {
    title: "VQE: Molecular Hydrogen (H₂)",
    description: "Hardware-efficient ansatz parameterized for ground-state electronic energy calculation.",
    href: "#algorithms",
    icon: Atom,
    badge: "Chemistry",
  },
  {
    title: "Quantum Teleportation Protocol",
    description: "Transfers unknown state of Q0 to Q2 using pre-shared EPR entanglement and classical feedforward.",
    href: "#algorithms",
    icon: Compass,
    badge: "Protocol",
  },
];

// Default Grouped Resources
export const DEFAULT_QUANTUM_RESOURCE_GROUPS = [
  {
    title: "Developer & Schema Specs",
    links: [
      {
        title: "FastAPI Documentation (/docs)",
        description: "Interactive Swagger UI and REST endpoints for circuit simulation.",
        href: "#docs",
        icon: FileCode,
      },
      {
        title: "JSON Artifact Schema",
        description: "Deterministic structured run telemetry, fidelity matrices, and shot counts.",
        href: "#architecture",
        icon: Code2,
      },
      {
        title: "SQLite Database Runs",
        description: "Local historical persistence of execution shots and statevectors.",
        href: "#history",
        icon: Database,
      },
    ],
  },
  {
    title: "Quality & Standards",
    links: [
      {
        title: "Continuous Integration Benchmarks",
        description: "97/97 passing deterministic unit tests with zero memory leaks.",
        href: "#benchmarks",
        icon: CheckCircle2,
      },
      {
        title: "OpenQASM 3.0 Specification",
        description: "Official intermediate representation for quantum programming.",
        href: "https://openqasm.com/",
        icon: ExternalLink,
      },
    ],
  },
];

export function MegaMenuNavbar({
  brandName = "QuantumForge",
  brandVersion = "v0.3.0",
  engineSubtitle = "Qiskit Aer Execution Engine",
  features = DEFAULT_QUANTUM_FEATURES,
  useCases = DEFAULT_QUANTUM_USE_CASES,
  resourceGroups = DEFAULT_QUANTUM_RESOURCE_GROUPS,
  activeView = "landing",
  onNavigate,
  onLaunchStudio,
  theme = "dark",
  onToggleTheme,
  className,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (menuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLinkClick = (href, view) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    if (view && onNavigate) {
      onNavigate(view);
      return;
    }

    if (href?.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[#070b13]/85 backdrop-blur-xl border-b border-outline-variant/60 px-4 sm:px-8 h-16 flex items-center justify-between transition-colors",
        className
      )}
    >
      {/* 1. BRAND LOGO & ENGINE SUBTITLE */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (onNavigate) onNavigate("landing");
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-container border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.25)] transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-lg" data-icon="grain">grain</span>
          </div>
          <div>
            <div className="font-headline-sm text-sm font-bold text-white flex items-center gap-2">
              <span>{brandName}</span>
              {brandVersion && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant text-cyan-300">
                  {brandVersion}
                </span>
              )}
            </div>
            {engineSubtitle && (
              <div className="font-label-code-sm text-[10px] text-slate-400 hidden sm:block font-mono">
                {engineSubtitle}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* 2. DESKTOP NAVIGATION WITH MEGA MENUS */}
      <nav className="hidden lg:flex items-center gap-1 font-sans text-sm">
        {/* Direct Link: Overview */}
        <a
          href="#hero"
          onClick={() => handleLinkClick("#hero")}
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          Overview
        </a>

        {/* MEGA MENU 1: FEATURES */}
        <div
          className="relative"
          onMouseEnter={() => handleMouseEnter("features")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors",
              activeDropdown === "features"
                ? "text-cyan-400 bg-cyan-950/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
          >
            <span>Features</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === "features" && "rotate-180")} />
          </button>

          <AnimatePresence>
            {activeDropdown === "features" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] rounded-2xl bg-[#0a0f1d]/95 backdrop-blur-2xl border border-outline-variant/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50"
              >
                <div className="grid grid-cols-2 gap-3">
                  {features.map((item, idx) => {
                    const Icon = item.icon || Layers;
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(item.href);
                        }}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-cyan-500/20"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface-container border border-outline-variant/80 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:text-cyan-300 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className={cn("text-[9px] font-mono px-1.5 py-0.2 rounded border font-medium", item.badgeColor || "bg-cyan-500/10 text-cyan-400 border-cyan-500/30")}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Bottom CTA within Features Dropdown */}
                <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs text-slate-400 px-2">
                  <span>Powered by native Qiskit Aer C++ primitives</span>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      if (onLaunchStudio) onLaunchStudio();
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 group cursor-pointer"
                  >
                    <span>Open Composer Studio</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MEGA MENU 2: ALGORITHM LIBRARY */}
        <div
          className="relative"
          onMouseEnter={() => handleMouseEnter("algorithms")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors",
              activeDropdown === "algorithms"
                ? "text-cyan-400 bg-cyan-950/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
          >
            <span>Algorithm Library</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === "algorithms" && "rotate-180")} />
          </button>

          <AnimatePresence>
            {activeDropdown === "algorithms" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] rounded-2xl bg-[#0a0f1d]/95 backdrop-blur-2xl border border-outline-variant/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50"
              >
                <div className="space-y-2">
                  {useCases.map((item, idx) => {
                    const Icon = item.icon || Sparkles;
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(item.href);
                        }}
                        className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-cyan-500/20"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface-container border border-outline-variant/80 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 group-hover:border-cyan-500/50 group-hover:text-cyan-300 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs sm:text-sm group-hover:text-cyan-300 transition-colors">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-container-high border border-outline-variant text-slate-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs px-2">
                  <span className="text-slate-400">11 Pre-verified quantum templates</span>
                  <a
                    href="#algorithms"
                    onClick={() => handleLinkClick("#algorithms")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    <span>View all algorithms</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MEGA MENU 3: RESOURCES & SPECS */}
        <div
          className="relative"
          onMouseEnter={() => handleMouseEnter("resources")}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors",
              activeDropdown === "resources"
                ? "text-cyan-400 bg-cyan-950/40"
                : "text-slate-300 hover:text-white hover:bg-white/5"
            )}
          >
            <span>Resources</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === "resources" && "rotate-180")} />
          </button>

          <AnimatePresence>
            {activeDropdown === "resources" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] rounded-2xl bg-[#0a0f1d]/95 backdrop-blur-2xl border border-outline-variant/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50"
              >
                <div className="grid grid-cols-2 gap-5">
                  {resourceGroups.map((group, gi) => (
                    <div key={gi}>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400/90 font-semibold mb-2.5 px-2">
                        {group.title}
                      </div>
                      <div className="space-y-1">
                        {group.links.map((link, li) => {
                          const Icon = link.icon || BookOpen;
                          return (
                            <a
                              key={li}
                              href={link.href}
                              onClick={(e) => {
                                if (link.href.startsWith("#")) {
                                  e.preventDefault();
                                  handleLinkClick(link.href);
                                }
                              }}
                              target={link.href.startsWith("http") ? "_blank" : undefined}
                              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                              className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 shrink-0 mt-0.5 transition-colors" />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                                  {link.title}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">
                                  {link.description}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Direct Link: Benchmarks */}
        <a
          href="#benchmarks"
          onClick={() => handleLinkClick("#benchmarks")}
          className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          Benchmarks
        </a>
      </nav>

      {/* 3. RIGHT SECTION: Status Pill, Theme Toggle & CTA */}
      <div className="flex items-center gap-3">
        {/* Backend Online status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Aer Backend Online</span>
        </div>

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        )}

        {/* Launch Studio CTA with AnimatedButton */}
        <AnimatedButton
          onClick={() => {
            if (onLaunchStudio) onLaunchStudio();
          }}
          className="hidden sm:inline-flex px-3.5 py-1.5 text-xs shadow-[0_0_16px_rgba(0,242,254,0.3)] hover:scale-102"
        >
          <span>Launch Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </AnimatedButton>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-9 h-9 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 4. MOBILE DRAWER WITH EXPANDABLE ACCORDIONS */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-[#070b13]/98 backdrop-blur-2xl border-b border-outline-variant/80 p-5 shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <div className="space-y-4">
              {/* Mobile Quick Overview */}
              <a
                href="#hero"
                onClick={() => handleLinkClick("#hero")}
                className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-white/5"
              >
                Overview
              </a>

              {/* Mobile Accordion 1: Features */}
              <div className="border border-outline-variant/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === "features" ? null : "features")}
                  className="w-full px-4 py-3 bg-surface-container/50 flex items-center justify-between text-left text-sm font-semibold text-white"
                >
                  <span>Features</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileExpandedSection === "features" && "rotate-180")} />
                </button>
                {mobileExpandedSection === "features" && (
                  <div className="p-3 space-y-2 bg-black/40">
                    {features.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(item.href);
                        }}
                        className="block p-2 rounded-lg text-xs text-slate-300 hover:text-cyan-300"
                      >
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion 2: Algorithm Library */}
              <div className="border border-outline-variant/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === "algorithms" ? null : "algorithms")}
                  className="w-full px-4 py-3 bg-surface-container/50 flex items-center justify-between text-left text-sm font-semibold text-white"
                >
                  <span>Algorithm Library</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileExpandedSection === "algorithms" && "rotate-180")} />
                </button>
                {mobileExpandedSection === "algorithms" && (
                  <div className="p-3 space-y-2 bg-black/40">
                    {useCases.map((item, idx) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(item.href);
                        }}
                        className="block p-2 rounded-lg text-xs text-slate-300 hover:text-cyan-300"
                      >
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion 3: Resources */}
              <div className="border border-outline-variant/40 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobileExpandedSection(mobileExpandedSection === "resources" ? null : "resources")}
                  className="w-full px-4 py-3 bg-surface-container/50 flex items-center justify-between text-left text-sm font-semibold text-white"
                >
                  <span>Resources &amp; Specs</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileExpandedSection === "resources" && "rotate-180")} />
                </button>
                {mobileExpandedSection === "resources" && (
                  <div className="p-3 space-y-3 bg-black/40">
                    {resourceGroups.map((group, gi) => (
                      <div key={gi}>
                        <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold mb-1">
                          {group.title}
                        </div>
                        {group.links.map((link, li) => (
                          <a
                            key={li}
                            href={link.href}
                            onClick={() => handleLinkClick(link.href)}
                            className="block py-1 text-xs text-slate-300 hover:text-cyan-300"
                          >
                            {link.title}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Benchmarks Link */}
              <a
                href="#benchmarks"
                onClick={() => handleLinkClick("#benchmarks")}
                className="block px-3 py-2 rounded-lg text-slate-200 font-medium hover:bg-white/5"
              >
                Benchmarks
              </a>

              {/* Mobile Studio CTA */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLaunchStudio) onLaunchStudio();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.35)]"
                >
                  <span>Launch Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function MegaMenuNavbarDemo() {
  return <MegaMenuNavbar />;
}

export default MegaMenuNavbar;

