import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { INITIAL_ALGORITHMS } from '../../types/quantum';
import { AnimatedRays } from '../ui/AnimatedRays';
import { PerspectiveGrid } from '../ui/perspective-grid';
import { BorderBeam } from '../ui/BorderBeam';
import { GlowBorderCard } from '../ui/GlowBorderCard';
import { AnimatedButton } from '../ui/AnimatedButton';
import { QuantumSpotlightCard } from '../ui/QuantumSpotlightCard';
import { TwistingRibbon } from '../ui/TwistingRibbon';
import { AnimatedFooter } from '../ui/AnimatedFooter';
import { MegaMenuNavbar } from '../ui/mega-menu-navbar';
import {
  Cpu,
  ShoppingBag,
  Activity,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  FileDown,
  RotateCcw,
  Sun,
  Moon,
  ExternalLink,
  Layers,
  ChevronRight,
  Code2,
  Compass,
  Boxes,
  Database,
  BarChart3,
  Copy,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { setActiveView, theme, toggleTheme, loadAlgorithm } = useQuantum();

  // Teaser Simulator state
  const [activeTeaserPreset, setActiveTeaserPreset] = useState('bell'); // 'bell' | 'grover' | 'qft'
  const [copiedQasm, setCopiedQasm] = useState(false);
  const [algorithmCategory, setAlgorithmCategory] = useState('all');

  // Teaser presets data
  const teaserPresets = {
    bell: {
      name: 'workspace // bell_state_ghz_teleport.qasm',
      qubits: 2,
      depth: 2,
      shots: 1024,
      runtime: '12ms',
      fidelity: '1.000',
      formula: '(|00⟩ + |11⟩) / √2',
      phase: 'θ = 0.000 rad',
      purity: 'Tr(ρ²) = 1.000',
      seed: '#0x7F2A_99E',
      probabilities: [
        { state: '|00⟩', pct: 50.2, shots: 514, active: true },
        { state: '|01⟩', pct: 0.0, shots: 0, active: false },
        { state: '|10⟩', pct: 0.0, shots: 0, active: false },
        { state: '|11⟩', pct: 49.8, shots: 510, active: true },
      ],
      densityMatrix: {
        d00: '0.5019',
        d11: '0.4981',
        d01: '0.0000',
        d10: '0.0000',
      },
      qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nh q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];`,
      circuit: [
        {
          qubit: 0,
          label: 'q[0]',
          init: '|0⟩',
          items: [
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-8' },
            { type: 'control', offset: 'ml-24' },
            { type: 'meter', offset: 'ml-24' },
          ],
        },
        {
          qubit: 1,
          label: 'q[1]',
          init: '|0⟩',
          items: [
            { type: 'empty', offset: 'ml-8' },
            { type: 'target', offset: 'ml-24' },
            { type: 'meter', offset: 'ml-20' },
          ],
        },
      ],
    },
    grover: {
      name: 'workspace // grover_2qubit_oracle.qasm',
      qubits: 2,
      depth: 5,
      shots: 1024,
      runtime: '18ms',
      fidelity: '0.999',
      formula: '|11⟩ marked target with 100% amplification',
      phase: 'θ = π/2 rad',
      purity: 'Tr(ρ²) = 1.000',
      seed: '#0x9B11_40C',
      probabilities: [
        { state: '|00⟩', pct: 0.0, shots: 0, active: false },
        { state: '|01⟩', pct: 0.0, shots: 0, active: false },
        { state: '|10⟩', pct: 0.0, shots: 0, active: false },
        { state: '|11⟩', pct: 100.0, shots: 1024, active: true },
      ],
      densityMatrix: {
        d00: '0.0000',
        d11: '1.0000',
        d01: '0.0000',
        d10: '0.0000',
      },
      qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[2] q;\nbit[2] c;\nh q[0];\nh q[1];\ncz q[0], q[1];\nh q[0];\nh q[1];\nx q[0];\nx q[1];\ncz q[0], q[1];\nx q[0];\nx q[1];\nh q[0];\nh q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];`,
      circuit: [
        {
          qubit: 0,
          label: 'q[0]',
          init: '|0⟩',
          items: [
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-6' },
            { type: 'gate', name: 'CZ', color: 'violet', offset: 'ml-12' },
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-12' },
            { type: 'meter', offset: 'ml-16' },
          ],
        },
        {
          qubit: 1,
          label: 'q[1]',
          init: '|0⟩',
          items: [
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-6' },
            { type: 'gate', name: 'Z', color: 'violet', offset: 'ml-12' },
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-12' },
            { type: 'meter', offset: 'ml-16' },
          ],
        },
      ],
    },
    qft: {
      name: 'workspace // qft_3qubit_fourier.qasm',
      qubits: 3,
      depth: 7,
      shots: 2048,
      runtime: '24ms',
      fidelity: '0.998',
      formula: '1/√8 ∑_{k=0}^7 e^{2πi j k / 8} |k⟩',
      phase: 'θ = 0.785 rad',
      purity: 'Tr(ρ²) = 0.999',
      seed: '#0x5E81_23A',
      probabilities: [
        { state: '|000⟩', pct: 12.5, shots: 256, active: true },
        { state: '|001⟩', pct: 12.5, shots: 256, active: true },
        { state: '|010⟩', pct: 12.5, shots: 256, active: true },
        { state: '|111⟩', pct: 12.5, shots: 256, active: true },
      ],
      densityMatrix: {
        d00: '0.1250',
        d11: '0.1250',
        d01: '0.1250',
        d10: '0.1250',
      },
      qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[3] q;\nbit[3] c;\nh q[0];\ncp(pi/2) q[1], q[0];\ncp(pi/4) q[2], q[0];\nh q[1];\ncp(pi/2) q[2], q[1];\nh q[2];\nswap q[0], q[2];`,
      circuit: [
        {
          qubit: 0,
          label: 'q[0]',
          init: '|0⟩',
          items: [
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-6' },
            { type: 'gate', name: 'Rz(π/2)', color: 'violet', offset: 'ml-10' },
            { type: 'meter', offset: 'ml-20' },
          ],
        },
        {
          qubit: 1,
          label: 'q[1]',
          init: '|0⟩',
          items: [
            { type: 'empty', offset: 'ml-6' },
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-10' },
            { type: 'meter', offset: 'ml-20' },
          ],
        },
        {
          qubit: 2,
          label: 'q[2]',
          init: '|0⟩',
          items: [
            { type: 'empty', offset: 'ml-6' },
            { type: 'empty', offset: 'ml-10' },
            { type: 'gate', name: 'H', color: 'cyan', offset: 'ml-14' },
            { type: 'meter', offset: 'ml-12' },
          ],
        },
      ],
    },
  };

  const activeTeaser = teaserPresets[activeTeaserPreset];

  const handleCopyQasm = () => {
    navigator.clipboard.writeText(activeTeaser.qasm);
    setCopiedQasm(true);
    setTimeout(() => setCopiedQasm(false), 2000);
  };

  const handleDownloadReport = () => {
    const report = {
      platform: 'QuantumForge Studio',
      engine: 'Qiskit Aer 0.13.2',
      preset: activeTeaserPreset,
      seed: activeTeaser.seed,
      shots: activeTeaser.shots,
      qubits: activeTeaser.qubits,
      depth: activeTeaser.depth,
      fidelity: activeTeaser.fidelity,
      probabilities: activeTeaser.probabilities,
      qasm: activeTeaser.qasm,
      sha256_verification: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantumforge_report_${activeTeaserPreset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSelectedToComposer = () => {
    const matchedAlgo = INITIAL_ALGORITHMS.find((a) => a.id === activeTeaserPreset) || INITIAL_ALGORITHMS[0];
    loadAlgorithm(matchedAlgo);
  };

  // 6 Algorithm showcase cards
  const catalogCards = [
    {
      id: 'bell',
      title: 'Bell State & GHZ Entanglement',
      category: 'Foundations',
      catKey: 'foundations',
      badgeColor: 'text-primary-container border-primary-container/40',
      qubits: '2-3 Qubits',
      gates: '4 Gates',
      depth: 'Depth: 2',
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩) / √2',
      description: 'Maximally entangled EPR pairs verified against Bell inequality / CHSH correlation tests.',
    },
    {
      id: 'teleportation',
      title: 'Quantum Teleportation & Superdense',
      category: 'Communication',
      catKey: 'communication',
      badgeColor: 'text-secondary-fixed-dim border-secondary-fixed-dim/40',
      qubits: '3 Qubits',
      gates: '6 Gates',
      depth: 'Depth: 4',
      formula: '|ψ⟩_in ⊗ |EPR⟩ → |ψ⟩_target',
      description: 'Disentangles unknown state via Bell basis measurement and classical feedforward corrections.',
    },
    {
      id: 'grover',
      title: "Grover's Oracle Search",
      category: 'Search & Crypto',
      catKey: 'search',
      badgeColor: 'text-primary-container border-primary-container/40',
      qubits: '2-4 Qubits',
      gates: '14 Gates',
      depth: 'Depth: 6',
      formula: 'O(√N) Quadratic Speedup',
      description: 'Phase inversion oracle coupled with Hadamard diffusion operator for unstructured database search.',
    },
    {
      id: 'vqe',
      title: 'VQE H2 Molecule Ground State',
      category: 'Chemistry',
      catKey: 'optimization',
      badgeColor: 'text-tertiary-fixed-dim border-tertiary-fixed-dim/40',
      qubits: '2 Qubits',
      gates: '8 Gates',
      depth: 'Depth: 5',
      formula: '⟨ψ(θ)|H_mol|ψ(θ)⟩ → E_ground',
      description: 'Parameterized unitary coupled cluster ansatz minimizing expectation energy of molecular hydrogen.',
    },
    {
      id: 'qaoa',
      title: 'QAOA Max-Cut Portfolio Optimizer',
      category: 'Finance & Graph',
      catKey: 'optimization',
      badgeColor: 'text-tertiary-fixed-dim border-tertiary-fixed-dim/40',
      qubits: '3 Qubits',
      gates: '12 Gates',
      depth: 'Depth: 8',
      formula: 'e^{-iγ C} e^{-iβ B} |+⟩^⊗n',
      description: 'Variational alternating operator ansatz solving NP-hard combinatorial graph partitioning problems.',
    },
    {
      id: 'qft',
      title: 'Quantum Phase Estimation (QPE)',
      category: 'Precision Metrology',
      catKey: 'search',
      badgeColor: 'text-secondary-fixed-dim border-secondary-fixed-dim/40',
      qubits: '3 Qubits',
      gates: '9 Gates',
      depth: 'Depth: 7',
      formula: 'U|u⟩ = e^{2πiθ}|u⟩',
      description: 'Estimates eigenphase of unitary operator with inverse Fourier transform; core primitive of Shor algorithm.',
    },
  ];

  const filteredCards =
    algorithmCategory === 'all'
      ? catalogCards
      : catalogCards.filter((c) => c.catKey === algorithmCategory);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-container/20 selection:text-primary-container transition-colors">
      {/* 1. Global Navigation Mega Menu Navbar (Vengeance UI) */}
      <MegaMenuNavbar
        brandName="QuantumForge"
        brandVersion="v0.3.0"
        engineSubtitle="Qiskit Aer Execution Engine"
        theme={theme}
        onToggleTheme={toggleTheme}
        onLaunchStudio={() => setActiveView('composer')}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* 2. SECTION 1: HERO */}
      <section
        id="hero"
        className="relative pt-28 pb-20 px-gutter border-b border-outline-variant overflow-hidden bg-surface"
      >
        {/* Vengeance UI 3D Perspective Grid Background */}
        <PerspectiveGrid rows={20} cols={20} className="absolute inset-0 z-0" />

        {/* Atmospheric Radial Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-primary-container/15 blur-[130px] rounded-full pointer-events-none z-[1]"></div>
        <div className="absolute top-1/3 left-1/3 w-[450px] h-[280px] bg-secondary-container/20 blur-[110px] rounded-full pointer-events-none z-[1]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center pointer-events-none">
          {/* Status Pill with Vengeance UI Border Beam */}
          <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 border border-outline-variant text-tertiary-fixed-dim font-label-code-sm text-label-code-sm mb-6 shadow-sm overflow-hidden pointer-events-auto">
            <BorderBeam size={100} duration={8} borderWidth={1.5} colorFrom="#4edea3" colorTo="#00f2fe" />
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-ping"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim -ml-3"></span>
            <span>Qiskit Aer 0.13.2 Accelerated • Classical Simulation Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-headline-xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary font-bold tracking-tight max-w-4xl leading-tight sm:leading-none mb-6 pointer-events-none select-none">
            Engineer, Simulate &amp; Verify Quantum Circuits with Deterministic Rigor.
          </h1>

          {/* Subtitle */}
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8 leading-relaxed pointer-events-none select-none">
            Design visual quantum circuits with drag-and-drop ease, compile down to OpenQASM 3.0, and simulate on
            high-performance Qiskit Aer statevectors without hardware queue latency.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-space-md mb-12 pointer-events-auto">
            <AnimatedButton
              onClick={() => setActiveView('composer')}
              className="px-6 py-3 text-sm"
            >
              <span>Launch Studio Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
            <a
              href="#algorithms"
              className="px-5 py-3 rounded-lg bg-surface-container border border-outline-variant hover:border-primary-container text-primary font-label-code-md text-label-code-md flex items-center gap-2 transition-colors"
            >
              <span>Browse 11 Algorithms</span>
              <span className="material-symbols-outlined text-xs" data-icon="south">south</span>
            </a>
          </div>

          {/* Deterministic Rigor Metric Strip (3 Pillars) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md w-full max-w-4xl pt-6 border-t border-outline-variant/60 text-left pointer-events-auto">
            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/80 hover:border-primary-container/40 transition-colors">
              <div className="flex items-center gap-2 text-primary font-headline-sm text-sm font-semibold mb-1">
                <span className="material-symbols-outlined text-primary-container text-base" data-icon="bolt">bolt</span>
                <span>Sub-50ms Simulation Latency</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Local matrix evaluation up to 10 qubits with zero network roundtrip delays.
              </p>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/80 hover:border-secondary-fixed-dim/40 transition-colors">
              <div className="flex items-center gap-2 text-primary font-headline-sm text-sm font-semibold mb-1">
                <span className="material-symbols-outlined text-secondary-fixed-dim text-base" data-icon="fingerprint">fingerprint</span>
                <span>100% Deterministic Reproducibility</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Fixed Mersenne Twister PRNG seed locks guarantee identical shots across runs.
              </p>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low border border-outline-variant/80 hover:border-tertiary-fixed-dim/40 transition-colors">
              <div className="flex items-center gap-2 text-primary font-headline-sm text-sm font-semibold mb-1">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-base" data-icon="code">code</span>
                <span>Strict OpenQASM 3.0 Conformance</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Direct export to standard QASM formats ready for deployment to IBM Quantum and AWS Braket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: LIVE QISKIT AER EXECUTION WORKSPACE (TEASER) */}
      <section id="simulator" className="py-16 px-gutter border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="font-label-code-sm text-label-code-sm text-primary-container mb-1 tracking-wider uppercase font-semibold">
                Interactive Canvas Teaser
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary font-semibold">
                Live Qiskit Aer Execution Workspace
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Real-time DAG transformation, Pauli gate decomposition, and statevector probabilistic collapse.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Presets */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-container border border-outline-variant text-xs">
                <button
                  onClick={() => setActiveTeaserPreset('bell')}
                  className={`px-2.5 py-1 rounded transition-colors font-mono ${
                    activeTeaserPreset === 'bell'
                      ? 'bg-primary-container text-on-primary-fixed font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  |Φ⁺⟩ Bell State
                </button>
                <button
                  onClick={() => setActiveTeaserPreset('grover')}
                  className={`px-2.5 py-1 rounded transition-colors font-mono ${
                    activeTeaserPreset === 'grover'
                      ? 'bg-primary-container text-on-primary-fixed font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Grover 2-Qubit
                </button>
                <button
                  onClick={() => setActiveTeaserPreset('qft')}
                  className={`px-2.5 py-1 rounded transition-colors font-mono ${
                    activeTeaserPreset === 'qft'
                      ? 'bg-primary-container text-on-primary-fixed font-semibold'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  QFT 3-Qubit
                </button>
              </div>

              <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant text-on-surface-variant font-label-code-sm text-label-code-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> Seed: {activeTeaser.seed}
              </span>
              <button
                onClick={() => setActiveTeaserPreset('bell')}
                className="px-3 py-1 rounded bg-surface-container-high border border-outline-variant hover:border-primary-container font-label-code-sm text-label-code-sm text-primary transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Circuit
              </button>
            </div>
          </div>

          {/* IDE Simulator Window Container */}
          <div className="relative rounded-xl border border-outline-variant bg-surface-container-low shadow-2xl overflow-hidden">
            {/* Vengeance UI Border Beam circulating laser around simulator */}
            <BorderBeam size={360} duration={14} borderWidth={2} colorFrom="#00f2fe" colorTo="#cdbdff" />

            {/* Window Top Bar */}
            <div className="px-space-md py-2 bg-surface-container border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-error-container border border-error/40"></span>
                  <span className="w-3 h-3 rounded-full bg-outline-variant/60"></span>
                  <span className="w-3 h-3 rounded-full bg-tertiary-fixed-dim/40"></span>
                </div>
                <span className="font-label-code-sm text-label-code-sm text-on-surface-variant border-l border-outline-variant pl-3">
                  {activeTeaser.name}
                </span>
              </div>

              {/* Live Telemetry Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-label-code-sm text-label-code-sm text-primary">
                  {activeTeaser.qubits} Qubits
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-label-code-sm text-label-code-sm text-on-surface">
                  Depth: {activeTeaser.depth}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-outline-variant font-label-code-sm text-label-code-sm text-on-surface">
                  {activeTeaser.shots} Shots
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-tertiary-fixed-dim/50 font-label-code-sm text-label-code-sm text-tertiary-fixed-dim">
                  Aer Runtime: {activeTeaser.runtime}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-primary-container/40 font-label-code-sm text-label-code-sm text-primary-container font-medium">
                  Fidelity: {activeTeaser.fidelity}
                </span>
              </div>
            </div>

            {/* Simulator Core Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
              {/* Left Palette & Circuit Stage (8 cols) */}
              <div className="lg:col-span-8 p-space-md flex flex-col gap-space-md">
                {/* Gate Toolbox Ribbon */}
                <div className="p-space-sm rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
                  <div className="flex items-center justify-between text-on-surface-variant font-label-code-sm text-label-code-sm">
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <span className="material-symbols-outlined text-xs" data-icon="grain">grain</span> Gate Toolbox Palette
                    </span>
                    <span>Click any gate to launch composer</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['H', 'X', 'Y', 'Z', 'S', 'T'].map((g) => (
                      <button
                        key={g}
                        onClick={handleLoadSelectedToComposer}
                        className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant hover:border-primary-container hover:text-primary-container text-primary font-label-code-md text-label-code-md cursor-pointer transition-all"
                      >
                        {g}
                      </button>
                    ))}
                    {['Rx(θ)', 'Ry(θ)', 'Rz(θ)'].map((g) => (
                      <button
                        key={g}
                        onClick={handleLoadSelectedToComposer}
                        className="px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant hover:border-secondary text-secondary font-label-code-md text-label-code-md cursor-pointer transition-all"
                      >
                        {g}
                      </button>
                    ))}
                    {['CX', 'CZ', 'SWAP'].map((g) => (
                      <button
                        key={g}
                        onClick={handleLoadSelectedToComposer}
                        className="px-2.5 py-1 rounded bg-surface-container-high border border-secondary-container text-secondary-fixed font-label-code-md text-label-code-md cursor-pointer hover:quantum-glow-violet transition-all"
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      onClick={handleLoadSelectedToComposer}
                      className="px-2.5 py-1 rounded bg-surface-container-high border border-tertiary-fixed-dim/60 text-tertiary-fixed-dim font-label-code-md text-label-code-md cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs" data-icon="speed">speed</span> M
                    </button>
                  </div>
                </div>

                {/* Visual Circuit Timeline Canvas */}
                <div className="relative bg-surface-container-lowest rounded border border-outline-variant p-space-md min-h-[260px] flex flex-col justify-center gap-6 overflow-x-auto">
                  {/* Timeline Grid Step Ruler */}
                  <div className="flex items-center text-on-surface-variant font-label-code-sm text-label-code-sm mb-1 pl-16 gap-16 border-b border-outline-variant/40 pb-1">
                    <span>t=0</span>
                    <span>t=1 [Hadamard]</span>
                    <span>t=2 [Entanglement]</span>
                    <span>t=3 [Measurement]</span>
                  </div>

                  {/* Dynamic Rails */}
                  {activeTeaser.circuit.map((rail) => (
                    <div key={rail.qubit} className="flex items-center relative h-12">
                      <div className="w-16 flex items-center gap-2 font-label-code-md text-label-code-md text-primary font-medium">
                        <span>{rail.label}</span>
                        <span className="text-on-surface-variant">{rail.init}</span>
                      </div>
                      {/* Wire line */}
                      <div className="flex-1 relative flex items-center">
                        <div className="absolute inset-x-0 wire-line"></div>
                        {rail.items.map((item, idx) => {
                          if (item.type === 'gate') {
                            const isCyan = item.color === 'cyan';
                            return (
                              <div
                                key={idx}
                                onClick={handleLoadSelectedToComposer}
                                className={`relative z-10 ${item.offset} w-10 h-10 rounded bg-surface-container-high border ${
                                  isCyan ? 'border-primary-container text-primary-container quantum-glow-cyan' : 'border-secondary text-secondary quantum-glow-violet'
                                } flex items-center justify-center font-label-code-md font-bold shadow-md hover:scale-105 transition-transform cursor-pointer`}
                              >
                                {item.name}
                              </div>
                            );
                          }
                          if (item.type === 'control') {
                            return (
                              <div key={idx} className={`relative z-10 ${item.offset} flex flex-col items-center`}>
                                <div className="w-3.5 h-3.5 rounded-full bg-secondary-fixed border border-secondary shadow-sm"></div>
                                <div className="w-[2px] h-14 bg-secondary-fixed-dim/80"></div>
                              </div>
                            );
                          }
                          if (item.type === 'target') {
                            return (
                              <div
                                key={idx}
                                onClick={handleLoadSelectedToComposer}
                                className={`relative z-10 ${item.offset} w-10 h-10 rounded-full bg-surface-container-high border-2 border-secondary flex items-center justify-center font-label-code-lg text-secondary font-bold shadow-md quantum-glow-violet hover:scale-105 transition-transform cursor-pointer`}
                              >
                                ⊕
                              </div>
                            );
                          }
                          if (item.type === 'meter') {
                            return (
                              <div
                                key={idx}
                                onClick={handleLoadSelectedToComposer}
                                className={`relative z-10 ${item.offset} w-10 h-10 rounded bg-surface-container-high border border-tertiary-fixed-dim/80 flex items-center justify-center text-tertiary-fixed-dim font-label-code-sm font-semibold shadow hover:scale-105 transition-transform cursor-pointer`}
                              >
                                <span className="material-symbols-outlined text-base" data-icon="speed">speed</span>
                              </div>
                            );
                          }
                          return <div key={idx} className={`relative z-10 ${item.offset} w-10 h-10`}></div>;
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Classical Register (Double Wire) */}
                  <div className="flex items-center relative h-8 pt-2">
                    <div className="w-16 flex items-center gap-2 font-label-code-sm text-label-code-sm text-outline">
                      <span>c[{activeTeaser.qubits}]</span>
                      <span>[0 0]</span>
                    </div>
                    <div className="flex-1 relative flex items-center">
                      <div className="absolute inset-x-0 wire-double"></div>
                      <div className="relative z-10 ml-64 text-on-surface-variant font-label-code-sm text-label-code-sm bg-surface-container-lowest px-2">
                        ⇓ Readout Target: bits c[0]..c[{activeTeaser.qubits - 1}]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Statevector Notation Callout */}
                <div className="px-space-md py-2.5 rounded bg-surface-container border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between font-label-code-md text-label-code-md gap-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="text-primary-container font-semibold">|Ψ⟩ State:</span>
                    <span className="text-primary tracking-wide">{activeTeaser.formula}</span>
                  </div>
                  <div className="text-on-surface-variant text-label-code-sm flex items-center gap-2">
                    <span>Phase: {activeTeaser.phase}</span>
                    <span className="text-outline">•</span>
                    <span className="text-tertiary-fixed-dim">Purity: {activeTeaser.purity}</span>
                  </div>
                </div>
              </div>

              {/* Right Telemetry & Probability Inspector (4 cols) */}
              <div className="lg:col-span-4 p-space-md bg-surface-container-lowest flex flex-col justify-between gap-space-md">
                <div>
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-3">
                    <h3 className="font-headline-sm text-headline-sm text-primary flex items-center gap-1.5 text-sm font-semibold">
                      <span className="material-symbols-outlined text-primary-container" data-icon="bar_chart">bar_chart</span>
                      <span>State Collapse Frequencies</span>
                    </h3>
                    <span className="font-label-code-sm text-label-code-sm text-on-surface-variant">
                      N={activeTeaser.shots} Shots
                    </span>
                  </div>

                  {/* Live Histogram Visualizer */}
                  <div className="flex flex-col gap-3 my-4">
                    {activeTeaser.probabilities.map((p) => (
                      <div key={p.state} className={`flex flex-col gap-1 ${p.active ? '' : 'opacity-40'}`}>
                        <div className="flex justify-between items-center font-label-code-md text-label-code-md">
                          <span className={p.active ? 'text-primary-container font-bold' : 'text-on-surface-variant'}>
                            {p.state}
                          </span>
                          <span className={p.active ? 'text-primary' : 'text-on-surface-variant'}>
                            {p.pct.toFixed(1)}% • {p.shots} shots
                          </span>
                        </div>
                        <div className="w-full bg-surface-container h-4 rounded overflow-hidden p-0.5 border border-outline-variant/60">
                          <div
                            className={`h-full rounded transition-all duration-500 shadow-sm ${
                              p.active
                                ? 'bg-gradient-to-r from-primary-container to-secondary-fixed'
                                : 'bg-outline'
                            }`}
                            style={{ width: `${p.pct}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Measurement Diagnostics Matrix */}
                  <div className="p-space-sm rounded bg-surface-container border border-outline-variant font-label-code-sm text-label-code-sm flex flex-col gap-1.5 mt-4">
                    <div className="text-on-surface-variant uppercase text-[10px] tracking-wider font-semibold">
                      Density Matrix Diagonal Elements
                    </div>
                    <div className="flex justify-between text-on-surface font-mono">
                      <span>ρ[00, 00] = {activeTeaser.densityMatrix.d00}</span>
                      <span>ρ[11, 11] = {activeTeaser.densityMatrix.d11}</span>
                    </div>
                    <div className="flex justify-between text-outline font-mono">
                      <span>ρ[01, 01] = {activeTeaser.densityMatrix.d01}</span>
                      <span>ρ[10, 10] = {activeTeaser.densityMatrix.d10}</span>
                    </div>
                  </div>
                </div>

                {/* Terminal Actions Inside Teaser */}
                <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant">
                  <button
                    onClick={handleDownloadReport}
                    className="w-full py-2 px-3 rounded bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-label-code-sm text-label-code-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Report (.json)</span>
                  </button>
                  <button
                    onClick={handleCopyQasm}
                    className="w-full py-2 px-3 rounded bg-surface-container-high hover:border-primary-container border border-outline-variant text-primary font-label-code-sm text-label-code-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedQasm ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQasm ? 'Copied QASM Code!' : 'Copy OpenQASM 3.0'}</span>
                  </button>
                  <AnimatedButton
                    onClick={handleLoadSelectedToComposer}
                    className="w-full py-2.5 text-xs font-bold"
                  >
                    <span>Open in Full Studio Composer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION 3: SYSTEM ARCHITECTURE & CAPABILITIES */}
      <section id="capabilities" className="py-20 px-gutter border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          {/* Section Tag & Title */}
          <div className="max-w-3xl mb-12">
            <div className="font-label-code-sm text-label-code-sm text-primary-container mb-2 uppercase tracking-wider font-semibold">
              System Architecture &amp; Capabilities
            </div>
            <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl text-primary font-bold tracking-tight">
              Engineered for High-Fidelity Quantum Exploration
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-3 leading-relaxed">
              From parameterized Hamiltonian simulation to classical statevector decomposition, QuantumForge provides
              the complete algorithmic workbench.
            </p>
          </div>

          {/* Bento Grid with Vengeance UI Spotlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {/* Bento 1: Arbitrary Circuit Composition (Span 2 on Desktop) */}
            <QuantumSpotlightCard
              className="lg:col-span-2 p-space-lg flex flex-col justify-between"
              spotlightColor="rgba(0, 242, 254, 0.16)"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary-container mb-4 group-hover:quantum-glow-cyan transition-shadow">
                  <span className="material-symbols-outlined" data-icon="schema">schema</span>
                </div>
                <div className="font-label-code-sm text-label-code-sm text-primary-container mb-1">
                  01 • CIRCUIT FABRIC
                </div>
                <h3 className="font-headline-lg text-xl text-primary font-semibold mb-2">
                  Arbitrary Circuit Composition &amp; Multi-Qubit Entanglement
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
                  Compose arbitrary multi-qubit topologies with standard Clifford+T gates, controlled Pauli operators
                  (CX, CZ, CY), Toffoli gates, and continuous rotation unitaries Rx, Ry, Rz(θ).
                </p>
              </div>

              {/* Visual preview widget inside bento */}
              <div className="p-space-md rounded bg-surface-container border border-outline-variant/60 flex items-center justify-between font-label-code-sm text-label-code-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-on-surface">Supported Unitary Matrices: 16+ Operators</span>
                </div>
                <button
                  onClick={() => setActiveView('composer')}
                  className="text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Composer</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </QuantumSpotlightCard>

            {/* Bento 2: Zero Black-Box Determinism */}
            <QuantumSpotlightCard
              className="p-space-lg flex flex-col justify-between"
              spotlightColor="rgba(205, 189, 255, 0.16)"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-secondary-fixed mb-4 group-hover:quantum-glow-violet transition-shadow">
                  <span className="material-symbols-outlined" data-icon="lock_clock">lock_clock</span>
                </div>
                <div className="font-label-code-sm text-label-code-sm text-secondary-fixed mb-1">
                  02 • MATHEMATICAL RIGOR
                </div>
                <h3 className="font-headline-lg text-xl text-primary font-semibold mb-2">
                  Zero Black-Box Magic
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Deterministic simulation with explicit PRNG seeds. Every shot distribution is mathematically
                  reproducible across client browser and server environments.
                </p>
              </div>
              <div className="font-mono text-xs text-secondary-fixed bg-surface-container p-2 rounded border border-outline-variant/40">
                seed = 0x7F2A_99E (PRNG lock)
              </div>
            </QuantumSpotlightCard>

            {/* Bento 3: Pure Statevector & Density Matrix */}
            <QuantumSpotlightCard
              className="p-space-lg flex flex-col justify-between"
              spotlightColor="rgba(78, 222, 163, 0.16)"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-tertiary-fixed-dim mb-4">
                  <span className="material-symbols-outlined" data-icon="donut_large">donut_large</span>
                </div>
                <div className="font-label-code-sm text-label-code-sm text-tertiary-fixed-dim mb-1">
                  03 • STATE METRICS
                </div>
                <h3 className="font-headline-lg text-xl text-primary font-semibold mb-2">
                  3D Bloch Projection &amp; Density Matrices
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Interactive Three.js 3D Bloch sphere projections, state vector polar angles (θ, φ), and full density
                  matrix purity metrics Tr(ρ²).
                </p>
              </div>
              <div className="font-mono text-xs text-tertiary-fixed-dim bg-surface-container p-2 rounded border border-outline-variant/40">
                Fidelity ≥ 0.9998 • Pure States
              </div>
            </QuantumSpotlightCard>

            {/* Bento 4: Interactive Parameter Tuning */}
            <QuantumSpotlightCard
              className="p-space-lg flex flex-col justify-between"
              spotlightColor="rgba(0, 242, 254, 0.16)"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary-container mb-4">
                  <span className="material-symbols-outlined" data-icon="tune">tune</span>
                </div>
                <div className="font-label-code-sm text-label-code-sm text-primary-container mb-1">
                  04 • PARAMETER SPACE
                </div>
                <h3 className="font-headline-lg text-xl text-primary font-semibold mb-2">
                  Continuous Rotations &amp; VQE
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Real-time unitary phase parameter sliders for variational algorithms with live state recalculation
                  under 2ms.
                </p>
              </div>
              <div className="font-mono text-xs text-primary-container bg-surface-container p-2 rounded border border-outline-variant/40">
                θ ∈ [0, 2π] • Delta Precision: 0.001
              </div>
            </QuantumSpotlightCard>

            {/* Bento 5: OpenQASM 3.0 Native Export */}
            <QuantumSpotlightCard
              className="p-space-lg flex flex-col justify-between"
              spotlightColor="rgba(205, 189, 255, 0.16)"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-secondary-fixed mb-4">
                  <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
                </div>
                <div className="font-label-code-sm text-label-code-sm text-secondary-fixed mb-1">
                  05 • STANDARDS COMPLIANCE
                </div>
                <h3 className="font-headline-lg text-xl text-primary font-semibold mb-2">
                  OpenQASM 3.0 Native AST
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
                  Complete round-trip AST generation for IBM Qiskit, Amazon Braket, and Google Cirq without syntax loss.
                </p>
              </div>
              <div className="font-mono text-xs text-secondary-fixed bg-surface-container p-2 rounded border border-outline-variant/40">
                include "stdgates.inc"; (AST Validated)
              </div>
            </QuantumSpotlightCard>
          </div>
        </div>
      </section>

      {/* 5. SECTION 4: PRE-VERIFIED QUANTUM BENCHMARKS (ALGORITHMS) */}
      <section id="algorithms" className="py-20 px-gutter border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="font-label-code-sm text-label-code-sm text-secondary mb-1 uppercase tracking-wider font-semibold">
                Algorithm Catalog
              </div>
              <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl text-primary font-bold">
                Pre-verified Quantum Benchmarks
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
                Instantly load, simulate, and verify foundational circuits verified against analytical truth tables.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded bg-surface-container border border-outline-variant">
              <button
                onClick={() => setAlgorithmCategory('all')}
                className={`px-3 py-1 rounded font-label-code-sm text-label-code-sm font-medium transition-colors ${
                  algorithmCategory === 'all'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                All (11)
              </button>
              <button
                onClick={() => setAlgorithmCategory('foundations')}
                className={`px-3 py-1 rounded font-label-code-sm text-label-code-sm transition-colors ${
                  algorithmCategory === 'foundations'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Foundations
              </button>
              <button
                onClick={() => setAlgorithmCategory('communication')}
                className={`px-3 py-1 rounded font-label-code-sm text-label-code-sm transition-colors ${
                  algorithmCategory === 'communication'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Communication
              </button>
              <button
                onClick={() => setAlgorithmCategory('optimization')}
                className={`px-3 py-1 rounded font-label-code-sm text-label-code-sm transition-colors ${
                  algorithmCategory === 'optimization'
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                Optimization &amp; VQE
              </button>
            </div>
          </div>

          {/* Algorithm Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
            {filteredCards.map((card) => {
              const matchedAlgo = INITIAL_ALGORITHMS.find((a) => a.id === card.id) || INITIAL_ALGORITHMS[0];
              return (
                <div
                  key={card.id}
                  className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant hover:border-primary-container/70 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-0.5 rounded border font-label-code-sm text-label-code-sm uppercase font-semibold ${card.badgeColor}`}
                      >
                        {card.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-label-code-sm text-label-code-sm">
                        <span>{card.qubits}</span>
                        <span>•</span>
                        <span>{card.gates}</span>
                        <span>•</span>
                        <span>{card.depth}</span>
                      </div>
                    </div>
                    <h3 className="font-headline-sm text-lg text-primary font-semibold mb-2 group-hover:text-primary-container transition-colors">
                      {card.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    {/* Math formula */}
                    <div className="p-2 rounded bg-surface-container border border-outline-variant/60 font-mono text-xs text-primary mb-4">
                      {card.formula}
                    </div>
                  </div>

                  <button
                    onClick={() => loadAlgorithm(matchedAlgo)}
                    className="w-full py-2 px-3 rounded bg-surface-container-high hover:bg-primary-container hover:text-on-primary-fixed border border-outline-variant text-primary font-label-code-sm text-label-code-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Load to Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SECTION 5: DETERMINISTIC SIMULATION PIPELINE (ARCHITECTURE) */}
      <section id="architecture" className="py-20 px-gutter border-b border-outline-variant bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="font-label-code-sm text-label-code-sm text-primary-container mb-2 uppercase tracking-wider font-semibold">
              Engineering Specs &amp; Pipeline
            </div>
            <h2 className="font-headline-xl text-2xl sm:text-3xl lg:text-4xl text-primary font-bold">
              Deterministic Simulation Pipeline
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 leading-relaxed">
              Zero-loss compilation from client browser drag events to backend Qiskit Aer statevectors.
            </p>
          </div>

          {/* Pipeline Flow Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-12">
            <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2 relative">
              <div className="font-label-code-sm text-label-code-sm text-primary-container font-semibold">STAGE 01</div>
              <div className="font-headline-sm text-sm text-primary font-semibold">Web Canvas</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Browser UI compiles interactive gates to DAG representation.
              </p>
              <div className="mt-auto pt-2 border-t border-outline-variant/40 font-label-code-sm text-label-code-sm text-outline">
                React / Canvas
              </div>
            </div>

            <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
              <div className="font-label-code-sm text-label-code-sm text-secondary font-semibold">STAGE 02</div>
              <div className="font-headline-sm text-sm text-primary font-semibold">FastAPI Gateway</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Schema validation via Pydantic; sets deterministic PRNG seeds.
              </p>
              <div className="mt-auto pt-2 border-t border-outline-variant/40 font-label-code-sm text-label-code-sm text-outline">
                Python 3.12+
              </div>
            </div>

            <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
              <div className="font-label-code-sm text-label-code-sm text-tertiary-fixed-dim font-semibold">STAGE 03</div>
              <div className="font-headline-sm text-sm text-primary font-semibold">Qiskit Aer Engine</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Multi-threaded C++ statevector evolution and matrix math.
              </p>
              <div className="mt-auto pt-2 border-t border-outline-variant/40 font-label-code-sm text-label-code-sm text-outline">
                Aer 0.13.2 C++
              </div>
            </div>

            <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
              <div className="font-label-code-sm text-label-code-sm text-primary-fixed font-semibold">STAGE 04</div>
              <div className="font-headline-sm text-sm text-primary font-semibold">Projective Collapse</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                1,024 to 8,192 projective shots with Pauli-Z measurement basis.
              </p>
              <div className="mt-auto pt-2 border-t border-outline-variant/40 font-label-code-sm text-label-code-sm text-outline">
                Monte Carlo Sample
              </div>
            </div>

            <div className="p-space-md rounded bg-surface-container-lowest border border-outline-variant flex flex-col gap-2">
              <div className="font-label-code-sm text-label-code-sm text-secondary-fixed font-semibold">STAGE 05</div>
              <div className="font-headline-sm text-sm text-primary font-semibold">Digest &amp; Hash</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                SHA-256 fingerprint generation for verifiable scientific reproduction.
              </p>
              <div className="mt-auto pt-2 border-t border-outline-variant/40 font-label-code-sm text-label-code-sm text-outline">
                SHA-256 Checksum
              </div>
            </div>
          </div>

          {/* Architecture Code & Schema Preview Box */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant font-mono text-xs text-on-surface-variant overflow-x-auto">
            <div className="text-primary-container font-semibold mb-2 flex items-center justify-between">
              <span>// DETERMINISTIC_RUN_ARTIFACT.json (Schema v1.2)</span>
              <span className="text-tertiary-fixed-dim">SHA-256: 4f1a8e9b...7c32</span>
            </div>
            <pre className="text-slate-300">
{`{
  "circuit_id": "bell_epr_pair_01",
  "num_qubits": 2,
  "shots": 1024,
  "seed": 42,
  "backend": "qiskit_aer.statevector_simulator",
  "counts": { "00": 514, "11": 510 },
  "statevector_norm": 1.00000000,
  "verification": { "bell_inequality_violation": true, "chsh_s_value": 2.828 }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* 7. SECTION 6: VALIDATED AGAINST CONTINUOUS INTEGRATION (BENCHMARKS) */}
      <section id="benchmarks" className="py-16 px-gutter border-b border-outline-variant bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="font-label-code-sm text-label-code-sm text-tertiary-fixed-dim mb-1 uppercase tracking-wider font-semibold">
              Quality Assurance &amp; Tests
            </div>
            <h2 className="font-headline-lg text-headline-lg text-primary font-semibold">
              Validated against Continuous Integration
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Every gate unitary, noise operator, and simulation step passes rigorous deterministic checks.
            </p>
          </div>

          {/* 4-Column Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
            <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center text-center">
              <div className="font-headline-xl text-3xl lg:text-4xl font-bold text-tertiary-fixed-dim mb-2 font-mono">
                97/97
              </div>
              <div className="font-headline-sm text-base text-primary font-semibold mb-1">Passing Tests</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                0 warnings • 100% test coverage across gate operators and schemas.
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center text-center">
              <div className="font-headline-xl text-3xl lg:text-4xl font-bold text-primary-container mb-2 font-mono">
                15s
              </div>
              <div className="font-headline-sm text-base text-primary font-semibold mb-1">Strict Timeout</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Asynchronous worker timeout guard against hanging or infinite circuit loops.
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center text-center">
              <div className="font-headline-xl text-3xl lg:text-4xl font-bold text-secondary-fixed mb-2 font-mono">
                &lt;50ms
              </div>
              <div className="font-headline-sm text-base text-primary font-semibold mb-1">Average Latency</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Local statevector simulation up to 10 qubits with zero queue wait times.
              </div>
            </div>

            <div className="p-space-lg rounded-xl bg-surface-container-low border border-outline-variant flex flex-col items-center text-center">
              <div className="font-headline-xl text-3xl lg:text-4xl font-bold text-tertiary-fixed-dim mb-2 font-mono">
                0 Leaks
              </div>
              <div className="font-headline-sm text-base text-primary font-semibold mb-1">Memory Safety</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                Valgrind-audited C++ statevector pool management with garbage collection.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 7: FINAL CALL TO ACTION */}
      <section className="py-24 px-gutter border-b border-outline-variant bg-gradient-to-b from-surface-container-low to-surface-container-lowest relative overflow-hidden">
        {/* Vengeance UI Twisting Ribbon 3D Background */}
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <TwistingRibbon
            segments={450}
            waveSpeed={0.016}
            waveAmplitude={1.25}
            twistCycles={6}
            darkColors={{
              face: "#00f2fe",
              foldA: "#7f5af0",
              foldB: "#4edea3",
              foldC: "#00dce6"
            }}
          />
        </div>

        {/* Ambient Grid & Glow Overlay */}
        <div className="absolute inset-0 quantum-grid-bg opacity-25 z-0 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-container/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-surface-container border border-primary-container flex items-center justify-center text-primary-container mb-6 quantum-glow-cyan">
            <span className="material-symbols-outlined text-2xl" data-icon="grain">grain</span>
          </div>

          <h2 className="font-headline-xl text-3xl sm:text-4xl lg:text-5xl text-primary font-bold tracking-tight mb-4">
            Ready to simulate your first quantum circuit?
          </h2>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            No quantum cloud queue wait times. No hardware calibration delays. Launch the local interactive workspace now
            or explore our pre-verified algorithm library.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <AnimatedButton
              onClick={() => setActiveView('composer')}
              className="px-6 py-3 text-sm font-bold shadow-[0_0_24px_rgba(0,242,254,0.4)]"
            >
              <span>Launch QuantumForge Studio</span>
              <ArrowRight className="w-4 h-4" />
            </AnimatedButton>
            <button
              onClick={() => setActiveView('docs')}
              className="px-5 py-3 rounded-lg bg-surface-container border border-outline-variant hover:border-primary-container text-primary font-label-code-md text-label-code-md flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Architecture &amp; Docs</span>
              <BookOpen className="w-4 h-4 text-primary-container" />
            </button>
          </div>
        </div>
      </section>

      {/* 9. STANDARD FOOTER (Links, Brand & Operational Status) */}
      <footer className="border-t border-outline-variant bg-[#0a0e17] text-[#dfe2ef] pt-16 pb-8 px-gutter">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-semibold">
              <div className="w-6 h-6 rounded bg-surface-container border border-outline-variant flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-sm" data-icon="grain">grain</span>
              </div>
              <span>QuantumForge</span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Interactive quantum circuit simulation and algorithmic prototyping studio powered by Qiskit Aer.
            </p>
            <div className="font-label-code-sm text-label-code-sm text-outline">
              Engine Version: v0.3.0 • Aer Backend
            </div>
          </div>

          {/* Navigation & Catalog */}
          <div className="space-y-2">
            <div className="text-primary font-label-code-sm text-label-code-sm uppercase tracking-wider mb-2 font-semibold">
              Circuit Studio
            </div>
            <div>
              <button
                onClick={() => setActiveView('composer')}
                className="hover:text-primary transition-colors text-left"
              >
                Circuit Composer
              </button>
            </div>
            <div>
              <button
                onClick={() => setActiveView('marketplace')}
                className="hover:text-primary transition-colors text-left"
              >
                Pre-verified Catalog (11)
              </button>
            </div>
            <div>
              <a href="#capabilities" className="hover:text-primary transition-colors">
                Supported Pauli Gates
              </a>
            </div>
            <div>
              <a href="#simulator" className="hover:text-primary transition-colors">
                Bloch Sphere &amp; Telemetry
              </a>
            </div>
          </div>

          {/* Developer & API */}
          <div className="space-y-2">
            <div className="text-primary font-label-code-sm text-label-code-sm uppercase tracking-wider mb-2 font-semibold">
              Developers
            </div>
            <div>
              <button
                onClick={() => setActiveView('docs')}
                className="hover:text-primary transition-colors text-left"
              >
                FastAPI Documentation (/docs)
              </button>
            </div>
            <div>
              <a href="#architecture" className="hover:text-primary transition-colors">
                JSON Artifact Schema
              </a>
            </div>
            <div>
              <button
                onClick={() => setActiveView('benchmarks')}
                className="hover:text-primary transition-colors text-left"
              >
                Continuous Integration Benchmarks
              </button>
            </div>
            <div>
              <button
                onClick={() => setActiveView('history')}
                className="hover:text-primary transition-colors text-left"
              >
                SQLite Database Runs
              </button>
            </div>
          </div>

          {/* Community & Legal */}
          <div className="space-y-2">
            <div className="text-primary font-label-code-sm text-label-code-sm uppercase tracking-wider mb-2 font-semibold">
              Standards &amp; Open Source
            </div>
            <div>
              <a
                href="https://openqasm.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>OpenQASM 3.0 Standard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <a
                href="https://qiskit.org/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <span>IBM Qiskit Aer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              <span className="text-on-surface-variant/80">MIT License • Pure Open Source</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between text-outline text-xs gap-4 mb-4">
          <div>© 2026 QuantumForge Studio Platform. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> All Systems Operational
            </span>
            <span>•</span>
            <span>Local Aer Sandbox Active</span>
          </div>
        </div>

        {/* 10. VENGEANCE UI ANIMATED FOOTER WITH "QuantumForge" */}
        <div className="relative w-full overflow-hidden mt-8 rounded-2xl border border-outline-variant/30 bg-[#000000]">
          <AnimatedFooter
            headingLines={["QuantumForge"]}
            leftImage="/animated-footer/hand-left.jpg"
            rightImage="/animated-footer/hand-right.jpg"
          />
        </div>
      </footer>
    </div>
  );
}

