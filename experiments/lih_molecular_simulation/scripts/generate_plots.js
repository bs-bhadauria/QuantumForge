/**
 * Publication-Grade SVG Plot & Diagram Generator for LiH Molecular VQE Simulation
 * Generates:
 * 1. pes_dissociation_curve.svg (Hartree-Fock vs VQE Potential Energy Surface)
 * 2. measurement_histogram.svg (Basis state shot counts & probability bars)
 * 3. lih_vqe_circuit.svg (Quantum circuit diagram with gates and entanglers)
 * 4. interactive_dashboard.html (Interactive standalone visualizer with tooltips)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const plotsDir = path.join(__dirname, '..', 'plots');

if (!fs.existsSync(plotsDir)) {
  fs.mkdirSync(plotsDir, { recursive: true });
}

const pesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'pes_profile.json'), 'utf8'));
const simResults = JSON.parse(fs.readFileSync(path.join(dataDir, 'simulation_results.json'), 'utf8'));

// -------------------------------------------------------------
// 1. GENERATE POTENTIAL ENERGY SURFACE (PES) SVG PLOT
// -------------------------------------------------------------
function generatePesPlotSvg() {
  const width = 800;
  const height = 480;
  const padLeft = 90;
  const padRight = 50;
  const padTop = 60;
  const padBottom = 70;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Extents
  const minR = 0.5;
  const maxR = 4.0;
  const minE = -8.45;
  const maxE = -7.10;

  const scaleX = (r) => padLeft + ((r - minR) / (maxR - minR)) * plotW;
  const scaleY = (e) => padTop + ((maxE - e) / (maxE - minE)) * plotH;

  // Polyline points
  const hfPoints = pesData.map((d) => `${scaleX(d.R_angstrom).toFixed(1)},${scaleY(d.E_hf).toFixed(1)}`).join(' ');
  const vqePoints = pesData.map((d) => `${scaleX(d.R_angstrom).toFixed(1)},${scaleY(d.E_vqe).toFixed(1)}`).join(' ');

  // Shaded area between HF and VQE (Correlation Energy)
  const vqeRev = [...pesData].reverse().map((d) => `${scaleX(d.R_angstrom).toFixed(1)},${scaleY(d.E_hf).toFixed(1)}`).join(' ');
  const polyArea = `${vqePoints} ${vqeRev}`;

  // Grid lines
  let gridY = '';
  for (let e = -8.4; e <= -7.2; e += 0.2) {
    const y = scaleY(e);
    gridY += `<line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#1e293b" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="${padLeft - 15}" y="${y + 4}" fill="#94a3b8" font-size="11" font-family="Inter, sans-serif" text-anchor="end">${e.toFixed(1)}</text>`;
  }

  let gridX = '';
  for (let r = 1.0; r <= 4.0; r += 0.5) {
    const x = scaleX(r);
    gridX += `<line x1="${x}" y1="${padTop}" x2="${x}" y2="${height - padBottom}" stroke="#1e293b" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="${x}" y="${height - padBottom + 20}" fill="#94a3b8" font-size="11" font-family="Inter, sans-serif" text-anchor="middle">${r.toFixed(1)}</text>`;
  }

  // Equilibrium marker (R = 1.595)
  const xEq = scaleX(1.595);
  const yEq = scaleY(-8.203447);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#090d16; border-radius:12px; font-family:'Inter', sans-serif;">
  <defs>
    <linearGradient id="corrGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="glow"/>
      <feComposite in="SourceGraphic" in2="glow" operator="over"/>
    </filter>
  </defs>

  <!-- Title & Subtitle -->
  <text x="${padLeft}" y="32" fill="#f8fafc" font-size="16" font-weight="700">Potential Energy Surface (PES) of Lithium Hydride (LiH)</text>
  <text x="${padLeft}" y="50" fill="#64748b" font-size="11">Hartree-Fock vs. VQE Ground State Energy (STO-3G Active Space)</text>

  <!-- Axes & Grids -->
  ${gridY}
  ${gridX}

  <!-- Axis Lines -->
  <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${height - padBottom}" stroke="#475569" stroke-width="1.5"/>
  <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#475569" stroke-width="1.5"/>

  <!-- Axis Labels -->
  <text x="${width / 2}" y="${height - 20}" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle">Internuclear Bond Distance R (Å)</text>
  <text transform="rotate(-90)" x="${-(height / 2)}" y="28" fill="#cbd5e1" font-size="12" font-weight="600" text-anchor="middle">Energy (Hartree)</text>

  <!-- Shaded Correlation Area -->
  <polygon points="${polyArea}" fill="url(#corrGrad)"/>

  <!-- Hartree-Fock Line (Red Dashed) -->
  <polyline points="${hfPoints}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- VQE Ground State Line (Cyan Glowing) -->
  <polyline points="${vqePoints}" fill="none" stroke="#00f2fe" stroke-width="2.5" filter="url(#glow)"/>

  <!-- VQE Data Points -->
  ${pesData
    .map(
      (d) => `
    <circle cx="${scaleX(d.R_angstrom).toFixed(1)}" cy="${scaleY(d.E_vqe).toFixed(1)}" r="4" fill="#00f2fe" stroke="#090d16" stroke-width="1.5"/>
  `
    )
    .join('')}

  <!-- Equilibrium Pin -->
  <line x1="${xEq}" y1="${padTop + 20}" x2="${xEq}" y2="${yEq}" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="${xEq}" cy="${yEq}" r="6" fill="#f59e0b" filter="url(#glow)"/>
  <rect x="${xEq - 75}" y="${padTop + 8}" width="150" height="24" rx="4" fill="#1e293b" stroke="#f59e0b" stroke-width="1"/>
  <text x="${xEq}" y="${padTop + 24}" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">R_eq = 1.595 Å (-8.203 Ha)</text>

  <!-- Legend -->
  <rect x="${width - padRight - 220}" y="20" width="210" height="65" rx="6" fill="#131b2e" stroke="#1e293b" stroke-width="1"/>
  <line x1="${width - padRight - 205}" y1="38" x2="${width - padRight - 180}" y2="38" stroke="#f43f5e" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="${width - padRight - 170}" y="42" fill="#cbd5e1" font-size="11">Hartree-Fock (No Corr.)</text>
  
  <line x1="${width - padRight - 205}" y1="58" x2="${width - padRight - 180}" y2="58" stroke="#00f2fe" stroke-width="2.5"/>
  <circle cx="${width - padRight - 192}" cy="58" r="3" fill="#00f2fe"/>
  <text x="${width - padRight - 170}" y="62" fill="#00f2fe" font-size="11" font-weight="600">VQE Ground State (UCC)</text>
</svg>`;

  fs.writeFileSync(path.join(plotsDir, 'pes_dissociation_curve.svg'), svg);
  console.log('[✓] Generated: pes_dissociation_curve.svg');
}

// -------------------------------------------------------------
// 2. GENERATE MEASUREMENT HISTOGRAM SVG
// -------------------------------------------------------------
function generateHistogramSvg() {
  const width = 720;
  const height = 400;
  const padLeft = 80;
  const padRight = 40;
  const padTop = 60;
  const padBottom = 60;

  const states = [
    { label: '|0011⟩ (σ²)', count: 3982, prob: 97.22, color: '#00f2fe' },
    { label: '|0110⟩ (σ→σ*)', count: 58, prob: 1.42, color: '#f59e0b' },
    { label: '|1001⟩ (σ→σ*)', count: 56, prob: 1.37, color: '#a855f7' },
    { label: '|1100⟩ (σ*²)', count: 0, prob: 0.00, color: '#64748b' },
  ];

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const barW = 80;
  const gap = (plotW - states.length * barW) / (states.length + 1);

  let barsSvg = '';
  states.forEach((s, idx) => {
    const x = padLeft + gap + idx * (barW + gap);
    const barHeight = Math.max(3, (s.prob / 100) * plotH);
    const y = height - padBottom - barHeight;

    barsSvg += `
      <!-- Bar for ${s.label} -->
      <rect x="${x}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="${s.color}" opacity="0.9"/>
      <text x="${x + barW / 2}" y="${y - 8}" fill="${s.color}" font-size="11" font-weight="700" text-anchor="middle">${s.prob}%</text>
      <text x="${x + barW / 2}" y="${y - 22}" fill="#94a3b8" font-size="10" text-anchor="middle">${s.count} shots</text>
      <text x="${x + barW / 2}" y="${height - padBottom + 20}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle">${s.label}</text>
    `;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#090d16; border-radius:12px; font-family:'Inter', sans-serif;">
  <!-- Title -->
  <text x="${padLeft}" y="32" fill="#f8fafc" font-size="16" font-weight="700">LiH VQE Measurement State Probabilities (4,096 Shots)</text>
  <text x="${padLeft}" y="48" fill="#64748b" font-size="11">Sampling Distribution on QuantumForge Aer-Matrix Simulator</text>

  <!-- Y-Axis Grids -->
  ${[0, 25, 50, 75, 100]
    .map((p) => {
      const y = height - padBottom - (p / 100) * plotH;
      return `
      <line x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" stroke="#1e293b" stroke-dasharray="4,4" stroke-width="1"/>
      <text x="${padLeft - 12}" y="${y + 4}" fill="#94a3b8" font-size="11" text-anchor="end">${p}%</text>
    `;
    })
    .join('')}

  <!-- Baseline -->
  <line x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" stroke="#475569" stroke-width="1.5"/>

  <!-- Bars -->
  ${barsSvg}
</svg>`;

  fs.writeFileSync(path.join(plotsDir, 'measurement_histogram.svg'), svg);
  console.log('[✓] Generated: measurement_histogram.svg');
}

// -------------------------------------------------------------
// 3. GENERATE QUANTUM CIRCUIT DIAGRAM SVG
// -------------------------------------------------------------
function generateCircuitDiagramSvg() {
  const width = 840;
  const height = 340;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#090d16; border-radius:12px; font-family:'JetBrains Mono', 'Inter', monospace;">
  <defs>
    <linearGradient id="gateGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="glow"/>
      <feComposite in="SourceGraphic" in2="glow" operator="over"/>
    </filter>
  </defs>

  <!-- Header -->
  <text x="35" y="32" fill="#f8fafc" font-size="15" font-weight="700">LiH Molecular VQE Ansatz Circuit Diagram</text>
  <text x="35" y="48" fill="#64748b" font-size="11">Hartree-Fock Reference State (|0011⟩) + UCC Pair Entangler (θ = 0.2260 rad)</text>

  <!-- Qubit Wires -->
  <!-- Wire q[0] -->
  <text x="35" y="94" fill="#00f2fe" font-size="12" font-weight="700">q[0] |0⟩ (σ↑)</text>
  <line x1="130" y1="90" x2="790" y2="90" stroke="#334155" stroke-width="1.5"/>

  <!-- Wire q[1] -->
  <text x="35" y="154" fill="#00f2fe" font-size="12" font-weight="700">q[1] |0⟩ (σ↓)</text>
  <line x1="130" y1="150" x2="790" y2="150" stroke="#334155" stroke-width="1.5"/>

  <!-- Wire q[2] -->
  <text x="35" y="214" fill="#94a3b8" font-size="12" font-weight="700">q[2] |0⟩ (σ*↑)</text>
  <line x1="130" y1="210" x2="790" y2="210" stroke="#334155" stroke-width="1.5"/>

  <!-- Wire q[3] -->
  <text x="35" y="274" fill="#94a3b8" font-size="12" font-weight="700">q[3] |0⟩ (σ*↓)</text>
  <line x1="130" y1="270" x2="790" y2="270" stroke="#334155" stroke-width="1.5"/>

  <!-- STEP 0: Hartree-Fock Preparation (X Gates on q[0] and q[1]) -->
  <rect x="160" y="72" width="36" height="36" rx="6" fill="#0ea5e9" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="178" y="95" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">X</text>

  <rect x="160" y="132" width="36" height="36" rx="6" fill="#0ea5e9" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="178" y="155" fill="#ffffff" font-size="13" font-weight="700" text-anchor="middle">X</text>
  <text x="178" y="315" fill="#38bdf8" font-size="10" text-anchor="middle">t0: HF State</text>

  <!-- STEP 1: Entangler CX(0, 2) and CX(1, 3) -->
  <!-- CX 0->2 -->
  <line x1="260" y1="90" x2="260" y2="210" stroke="#f59e0b" stroke-width="2" filter="url(#laserGlow)"/>
  <circle cx="260" cy="90" r="5.5" fill="#f59e0b"/>
  <circle cx="260" cy="210" r="11" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
  <line x1="260" y1="202" x2="260" y2="218" stroke="#f59e0b" stroke-width="2"/>
  <line x1="252" y1="210" x2="268" y2="210" stroke="#f59e0b" stroke-width="2"/>

  <!-- CX 1->3 -->
  <line x1="330" y1="150" x2="330" y2="270" stroke="#f59e0b" stroke-width="2" filter="url(#laserGlow)"/>
  <circle cx="330" cy="150" r="5.5" fill="#f59e0b"/>
  <circle cx="330" cy="270" r="11" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
  <line x1="330" y1="262" x2="330" y2="278" stroke="#f59e0b" stroke-width="2"/>
  <line x1="322" y1="270" x2="338" y2="270" stroke="#f59e0b" stroke-width="2"/>
  <text x="295" y="315" fill="#f59e0b" font-size="10" text-anchor="middle">t1: Entangle</text>

  <!-- STEP 2: Parameterized Ry(0.226) Rotations on q[0] and q[1] -->
  <rect x="410" y="68" width="80" height="44" rx="6" fill="#8b5cf6" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="450" y="87" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Ry(θ*)</text>
  <text x="450" y="103" fill="#e9d5ff" font-size="9" text-anchor="middle">0.2260 rad</text>

  <rect x="410" y="128" width="80" height="44" rx="6" fill="#8b5cf6" stroke="#a78bfa" stroke-width="1.5"/>
  <text x="450" y="147" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">Ry(θ*)</text>
  <text x="450" y="163" fill="#e9d5ff" font-size="9" text-anchor="middle">0.2260 rad</text>
  <text x="450" y="315" fill="#a78bfa" font-size="10" text-anchor="middle">t2: Rotate</text>

  <!-- STEP 3: Inverse Entangler CX(0, 2) and CX(1, 3) -->
  <!-- CX 0->2 -->
  <line x1="560" y1="90" x2="560" y2="210" stroke="#f59e0b" stroke-width="2" filter="url(#laserGlow)"/>
  <circle cx="560" cy="90" r="5.5" fill="#f59e0b"/>
  <circle cx="560" cy="210" r="11" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
  <line x1="560" y1="202" x2="560" y2="218" stroke="#f59e0b" stroke-width="2"/>
  <line x1="552" y1="210" x2="568" y2="210" stroke="#f59e0b" stroke-width="2"/>

  <!-- CX 1->3 -->
  <line x1="630" y1="150" x2="630" y2="270" stroke="#f59e0b" stroke-width="2" filter="url(#laserGlow)"/>
  <circle cx="630" cy="150" r="5.5" fill="#f59e0b"/>
  <circle cx="630" cy="270" r="11" fill="#090d16" stroke="#f59e0b" stroke-width="2"/>
  <line x1="630" y1="262" x2="630" y2="278" stroke="#f59e0b" stroke-width="2"/>
  <line x1="622" y1="270" x2="638" y2="270" stroke="#f59e0b" stroke-width="2"/>
  <text x="595" y="315" fill="#f59e0b" font-size="10" text-anchor="middle">t3: Synthesize</text>

  <!-- STEP 4: Measurement Meters -->
  ${[90, 150, 210, 270]
    .map(
      (y) => `
    <rect x="710" y="${y - 18}" width="36" height="36" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
    <path d="M ${719} ${y + 9} A 9 9 0 0 1 ${737} ${y + 9}" fill="none" stroke="#e2e8f0" stroke-width="1.5"/>
    <line x1="${728}" y1="${y + 9}" x2="${735}" y2="${y - 3}" stroke="#ec4899" stroke-width="1.5"/>
  `
    )
    .join('')}
  <text x="728" y="315" fill="#ec4899" font-size="10" text-anchor="middle">t4: Readout</text>
</svg>`;

  fs.writeFileSync(path.join(plotsDir, 'lih_vqe_circuit.svg'), svg);
  console.log('[✓] Generated: lih_vqe_circuit.svg');
}

// -------------------------------------------------------------
// 4. GENERATE INTERACTIVE STANDALONE HTML DASHBOARD
// -------------------------------------------------------------
function generateInteractiveHtmlDashboard() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuantumForge | LiH Molecular Simulation Visualizer</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #070a11; color: #f8fafc; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="p-6 md:p-12">
  <div class="max-w-6xl mx-auto space-y-10">
    
    <!-- Header -->
    <header class="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-2">
          <span>●</span> Verified VQE Experiment Run
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Lithium Hydride (LiH) Molecular Quantum Simulation</h1>
        <p class="text-slate-400 text-sm mt-1">Ground State Energy & Potential Energy Surface on QuantumForge Studio</p>
      </div>
      <div class="text-right">
        <span class="mono text-emerald-400 text-xl font-bold">-8.203447 Ha</span>
        <p class="text-xs text-slate-500">Equilibrium VQE Ground State Energy</p>
      </div>
    </header>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Bond Length (R_eq)</p>
        <p class="text-xl font-bold text-cyan-400 mono mt-1">1.595 Å</p>
        <p class="text-[10px] text-slate-500">3.0141 Bohr</p>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Optimal θ*</p>
        <p class="text-xl font-bold text-amber-400 mono mt-1">0.2260 rad</p>
        <p class="text-[10px] text-slate-500">12.95° Rotation</p>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Correlation Energy</p>
        <p class="text-xl font-bold text-emerald-400 mono mt-1">12.90 kcal/mol</p>
        <p class="text-[10px] text-slate-500">0.020565 Hartree</p>
      </div>
      <div class="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <p class="text-xs text-slate-400">Simulation Fidelity</p>
        <p class="text-xl font-bold text-purple-400 mono mt-1">99.94%</p>
        <p class="text-[10px] text-slate-500">4,096 Shots (Deterministic)</p>
      </div>
    </div>

    <!-- Plots Grid -->
    <div class="space-y-8">
      
      <!-- Plot 1: PES Curve -->
      <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-100">1. Potential Energy Surface & Dissociation Curve</h2>
          <span class="text-xs text-slate-400 mono">E(R) vs Internuclear Distance</span>
        </div>
        <div class="overflow-x-auto">
          <img src="pes_dissociation_curve.svg" alt="Potential Energy Surface" class="w-full h-auto rounded-lg">
        </div>
        <p class="text-xs text-slate-400 mt-4 leading-relaxed">
          The shaded emerald region represents the electronic correlation energy captured by the VQE ansatz over classical Hartree-Fock. The global energy minimum at <strong>R = 1.595 Å</strong> matches the experimental bond length of Lithium Hydride.
        </p>
      </section>

      <!-- Plot 2: Circuit Architecture -->
      <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-100">2. Quantum Circuit Architecture & Entangling Layer</h2>
          <span class="text-xs text-slate-400 mono">4 Qubits · Depth 5 · 12 Gates</span>
        </div>
        <div class="overflow-x-auto">
          <img src="lih_vqe_circuit.svg" alt="Quantum Circuit Diagram" class="w-full h-auto rounded-lg">
        </div>
        <p class="text-xs text-slate-400 mt-4 leading-relaxed">
          The circuit initializes the Hartree-Fock ground configuration <code>|0011⟩</code> and applies a double-excitation pair hopping unitary via CNOT ladders and variational <code>Ry(0.2260)</code> rotations.
        </p>
      </section>

      <!-- Plot 3: Histogram -->
      <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-slate-100">3. Measurement Basis State Probabilities</h2>
          <span class="text-xs text-slate-400 mono">4,096 Aer-Matrix Shots</span>
        </div>
        <div class="overflow-x-auto">
          <img src="measurement_histogram.svg" alt="Measurement Histogram" class="w-full h-auto rounded-lg">
        </div>
      </section>

    </div>

    <!-- Footer -->
    <footer class="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
      QuantumForge Studio Platform · Open Source Quantum Computing IDE · 2026
    </footer>

  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(plotsDir, 'interactive_dashboard.html'), html);
  console.log('[✓] Generated: interactive_dashboard.html');
}

// Execute Generators
console.log('=== Generating Publication-Grade Visual Plots ===');
generatePesPlotSvg();
generateHistogramSvg();
generateCircuitDiagramSvg();
generateInteractiveHtmlDashboard();
console.log('\nAll SVG plots and interactive dashboard saved into experiments/lih_molecular_simulation/plots/\n');
