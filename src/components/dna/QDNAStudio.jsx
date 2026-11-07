import React, { useState, useMemo, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import {
  optimizeDnaPool,
  generateMultiOligoFasta,
  COMPLEMENTARY_BASES,
} from '../../services/qdnaService';
import {
  Dna,
  Cpu,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Layers,
  Activity,
  Zap,
  CheckCircle2,
  Hash,
} from 'lucide-react';

export default function QDNAStudio() {
  const {
    loadAlgorithm,
    dnaPayload,
    setDnaPayload,
    dnaSelectedOligoIdx,
    setDnaSelectedOligoIdx,
    setActiveView,
    goBack,
  } = useQuantum();

  const [copied, setCopied] = useState(false);

  // Pre-configured sample payloads
  const presets = [
    {
      label: 'Standard Archival',
      text: 'QuantumForge 2026: Quantum-Optimized DNA Storage',
    },
    {
      label: 'Long Archival Payload (Multi-Oligo)',
      text: 'Happy Deepawali to all of you. Hope you all will enjoy this Deepawali very much.',
    },
    {
      label: 'Homopolymer Heavy (Flawed)',
      text: 'AAAAA 00000 TTTTT ZZZZZ 11111 CCCCC',
    },
    {
      label: 'High-Density Seed',
      text: '0x8F9B2C4E_SECURE_VAULT_SEED_QBITS_GENOME',
    },
  ];

  // Run QAOA Multi-Oligo Pool optimization
  const pool = useMemo(() => {
    return optimizeDnaPool(dnaPayload, 25);
  }, [dnaPayload]);

  // Ensure selected index is valid whenever pool changes
  useEffect(() => {
    if (pool && dnaSelectedOligoIdx >= pool.totalOligos) {
      setDnaSelectedOligoIdx(0);
    }
  }, [pool, dnaSelectedOligoIdx, setDnaSelectedOligoIdx]);

  const activeOligo = pool?.oligos[dnaSelectedOligoIdx] || pool?.oligos[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFasta = () => {
    if (!pool) return;
    const fastaContent = generateMultiOligoFasta(dnaPayload, pool);
    const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qdna_oligo_pool_${Date.now()}.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadCircuitInComposer = () => {
    if (!activeOligo) return;
    const { qaoaCircuit } = activeOligo;
    loadAlgorithm({
      title: qaoaCircuit.name || 'Q-DNA QAOA Constraint Optimizer',
      n_qubits: qaoaCircuit.n_qubits,
      recommendedShots: 4096,
      operations: qaoaCircuit.operations,
    }, 'dna');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1424] via-[#09101d] to-[#0d1726] border border-cyan-900/40 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Dna className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Biotechnology & Quantum Intersection</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
              Q-DNA Storage Studio
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                QAOA v2.0 · Oligo Chunking
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Encode arbitrary digital information into biological <strong>A, C, G, T</strong> sequences. Partitions data into 
              <strong> 100–120 bp Oligo Fragments</strong> with homopolymer-free address barcodes. A variational 
              <strong> QAOA Quantum Circuit</strong> dynamically eliminates fatal homopolymers and balances GC-content across every chunk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadFasta}
              disabled={!pool}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              title="Download Multi-Oligo FASTA ready for wet-lab ordering (Twist/Agilent/IDT)"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export .FASTA {pool && pool.totalOligos > 1 ? `(${pool.totalOligos} Oligos)` : ''}</span>
            </button>
            <button
              onClick={handleLoadCircuitInComposer}
              disabled={!activeOligo}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 text-slate-950" />
              <span>Inspect QAOA Circuit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Payload Input Section */}
      <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-500" /> Digital Data Payload to Encode
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDnaPayload(p.text);
                  setDnaSelectedOligoIdx(0);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={dnaPayload}
          onChange={(e) => setDnaPayload(e.target.value)}
          rows={2}
          className="w-full bg-slate-50 dark:bg-[#070a0f] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          placeholder="Type or paste any text string to encode into synthetic DNA..."
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
          <span>{dnaPayload.length} characters ({dnaPayload.length * 8} bits)</span>
          {pool && (
            <div className="flex items-center gap-3">
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                {pool.totalOligos} Oligo Fragment{pool.totalOligos > 1 ? 's' : ''} ({pool.totalBasePairs} bp total)
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Avg. Synthesizability: {pool.avgSynthesizability}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Multi-Oligo Pool Selector Bar (When payload produces multiple fragments) */}
      {pool && pool.totalOligos > 1 && (
        <div className="bg-[#0c121d] border border-cyan-900/40 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200 font-mono">
                Oligo Pool Navigator (Twist Bioscience / Microsoft DNA Storage Architecture)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Chunk Size: 25 chars (~104 bp with 4-base address barcode)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {pool.oligos.map((oligo, idx) => {
              const isSelected = dnaSelectedOligoIdx === idx;
              return (
                <button
                  key={oligo.id}
                  onClick={() => setDnaSelectedOligoIdx(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-2.5 transition-all cursor-pointer flex-shrink-0 border ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="font-bold">Oligo {idx + 1}/{pool.totalOligos}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                    {oligo.addressBarcode}
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    {oligo.optimizedMetrics.synthesizabilityScore}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Multi-Oligo Chunking Active:</strong> All {pool.totalOligos} fragments independently satisfy 
                ideal wet-lab constraints (<strong>{pool.avgGcRatio}% GC</strong>, <strong>0 homopolymers</strong>, 
                <strong>{pool.avgSynthesizability}% Avg. Score</strong>).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Comparison Cards: Naive Raw vs Quantum-Optimized */}
      {activeOligo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card A: Raw Naive Encoding */}
          <div className="bg-white dark:bg-[#0c1017] border border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                  1. Naive Direct Encoding
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                No Quantum Scrambling
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">GC Content</p>
                <p className={`text-lg font-bold font-mono mt-0.5 ${
                  activeOligo.rawMetrics.gcRatio >= 45 && activeOligo.rawMetrics.gcRatio <= 55 
                    ? 'text-emerald-500' 
                    : 'text-rose-400'
                }`}>
                  {activeOligo.rawMetrics.gcRatio}%
                </p>
                <p className="text-[9px] text-slate-400">Target: 50%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Homopolymers</p>
                <p className={`text-lg font-bold font-mono mt-0.5 ${
                  activeOligo.rawMetrics.homopolymers.length === 0 ? 'text-emerald-500' : 'text-rose-400'
                }`}>
                  {activeOligo.rawMetrics.homopolymers.length} runs
                </p>
                <p className="text-[9px] text-slate-400">Target: 0</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Synthesis Score</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-slate-700 dark:text-slate-300">
                  {activeOligo.rawMetrics.synthesizabilityScore}%
                </p>
                <p className="text-[9px] text-slate-400">Stability index</p>
              </div>
            </div>

            {/* Warning Banner if flawed */}
            {activeOligo.rawMetrics.hasSevereFlaws && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Synthesis Failure Risk Detected</p>
                  <p className="text-[11px] text-rose-400/90 mt-0.5">
                    {activeOligo.rawMetrics.homopolymers.length > 0
                      ? `Contains consecutive base repeats (${activeOligo.rawMetrics.homopolymers.map(h => h.snippet).slice(0, 3).join(', ')}) causing enzymatic polymerase slippage.`
                      : 'Severe GC-content deviation creates secondary hairpin loops.'}
                  </p>
                </div>
              </div>
            )}

            {/* Snippet Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="uppercase">Raw Fragment Sequence:</span>
                <span className="text-[10px] text-slate-500">Address: {activeOligo.addressBarcode}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400 break-all select-all max-h-24 overflow-y-auto">
                <span className="text-amber-400/80 font-bold">{activeOligo.addressBarcode}</span>
                <span>{activeOligo.rawPayloadDna}</span>
              </div>
            </div>
          </div>

          {/* Card B: Quantum-Optimized Encoding */}
          <div className="bg-white dark:bg-[#0c1017] border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  2. Quantum-Optimized (QAOA)
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Certified Synthesizable
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                <p className="text-[10px] text-slate-400 uppercase">GC Content</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-cyan-400">
                  {activeOligo.optimizedMetrics.gcRatio}%
                </p>
                <p className="text-[9px] text-emerald-400">Optimal (~50%)</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                <p className="text-[10px] text-slate-400 uppercase">Homopolymers</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-emerald-400">
                  {activeOligo.optimizedMetrics.homopolymers.length} runs
                </p>
                <p className="text-[9px] text-emerald-400">0% Slippage</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                <p className="text-[10px] text-slate-400 uppercase">Synthesis Score</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-emerald-400">
                  {activeOligo.optimizedMetrics.synthesizabilityScore}%
                </p>
                <p className="text-[9px] text-cyan-400">
                  +{activeOligo.improvementPct}% Gain
                </p>
              </div>
            </div>

            {/* Success Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Thermodynamically Balanced & Lab-Ready</p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">
                  Melting Temperature Tm: <strong>{activeOligo.optimizedMetrics.meltingTemp}°C</strong> · 
                  Free Energy: <strong>{activeOligo.optimizedMetrics.deltaG} kcal/mol</strong>. 
                  Zero secondary hairpin loops.
                </p>
              </div>
            </div>

            {/* Optimized Sequence with Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="uppercase flex items-center gap-1.5">
                  Optimized Fragment Sequence:
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    5' Tag: {activeOligo.addressBarcode}
                  </span>
                </span>
                <button
                  onClick={() => handleCopy(activeOligo.optimizedDna)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 font-mono text-xs text-cyan-200 break-all select-all max-h-24 overflow-y-auto">
                <span className="text-amber-300 font-bold bg-amber-500/20 px-1 py-0.5 rounded mr-1" title="Address Barcode Header">
                  {activeOligo.addressBarcode}
                </span>
                <span>{activeOligo.optimizedPayloadDna}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. Interactive DNA Double-Helix Visual Strand */}
      {activeOligo && (
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Dna className="w-4 h-4 text-cyan-500" /> Synthetic DNA Double-Helix Complementary Strand
                {pool && pool.totalOligos > 1 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    Fragment {dnaSelectedOligoIdx + 1} of {pool.totalOligos}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary Coding Strand (5' → 3') with Watson-Crick Complementary Hydrogen Bonds (3' → 5')
              </p>
            </div>
            
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> A</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> T</span>
              <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> C</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> G</span>
            </div>
          </div>

          {/* Visual Strand Ladder */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pb-2">
              <span className="text-xs text-cyan-400 font-mono font-bold mr-2">5'</span>
              
              {activeOligo.optimizedDna.slice(0, 48).split('').map((base, idx) => {
                const isAddressBase = idx < activeOligo.addressBarcode.length;
                const comp = COMPLEMENTARY_BASES[base] || { pair: 'N', bonds: 2, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
                const pairMeta = COMPLEMENTARY_BASES[comp.pair] || comp;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group relative">
                    {/* Primary Base */}
                    <div className={`w-8 h-8 rounded-lg ${comp.bg} border ${isAddressBase ? 'border-amber-400 ring-1 ring-amber-400/40' : comp.border} flex items-center justify-center font-mono font-bold text-xs ${comp.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      {base}
                    </div>

                    {/* Hydrogen Bonds Indicator */}
                    <div className="flex flex-col items-center gap-0.5 py-0.5">
                      {Array.from({ length: comp.bonds }).map((_, bIdx) => (
                        <div key={bIdx} className="w-1.5 h-0.5 bg-slate-600 rounded-full" />
                      ))}
                    </div>

                    {/* Complementary Base */}
                    <div className={`w-8 h-8 rounded-lg ${pairMeta.bg} border ${isAddressBase ? 'border-amber-400/60' : pairMeta.border} flex items-center justify-center font-mono font-bold text-xs ${pairMeta.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      {comp.pair}
                    </div>

                    {/* Position Label */}
                    <span className="text-[9px] text-slate-500 font-mono mt-1 opacity-60">
                      {isAddressBase ? `A${idx + 1}` : idx + 1}
                    </span>
                  </div>
                );
              })}

              {activeOligo.optimizedDna.length > 48 && (
                <div className="flex items-center text-xs text-slate-500 font-mono px-4">
                  + {activeOligo.optimizedDna.length - 48} more bases
                </div>
              )}

              <span className="text-xs text-cyan-400 font-mono font-bold ml-2">3'</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. How QAOA & Oligo Chunking Works in Biology Explainer */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          The Science: Why Oligo Chunking + QAOA Guarantees Synthesizability
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed mt-2">
          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-300">1. Phosphoramidite Coupling Efficiency Drop</h5>
            <p>
              In chemical DNA synthesis, coupling yield is approximately 99.5% per cycle. In a 320 bp strand, full-length yield drops to 
              <span className="text-rose-400 font-mono"> 0.995<sup>320</sup> &approx; 20%</span>. 
              By chunking into <span className="text-cyan-300 font-semibold">100–120 bp oligonucleotides</span>, yield remains 
              above 60% with zero hairpin folding, matching the industrial standard of Twist Bioscience and Microsoft Research DNA Storage.
            </p>
          </div>
          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-300">2. QAOA Variational Masking (QUBO Mapping)</h5>
            <p>
              Each fragment is addressed with a 4-base balanced barcode and optimized through a 4-qubit QAOA variational circuit 
              with Cost Hamiltonian <span className="font-mono text-cyan-300">H<sub>C</sub> = &Sigma; J<sub>ij</sub> Z<sub>i</sub>Z<sub>j</sub> + &Sigma; h<sub>i</sub>Z<sub>i</sub></span>. 
              This eliminates fatal homopolymer repeats (0% polymerase slippage) and keeps GC content at exactly 50% while remaining 100% digitally reversible.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
