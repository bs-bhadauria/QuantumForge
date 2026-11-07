import React, { useState, useMemo } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import {
  textToBinary,
  optimizeDnaWithQAOA,
  generateFasta,
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
  ArrowRight,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';

export default function QDNAStudio() {
  const { loadAlgorithm } = useQuantum();

  const [inputPayload, setInputPayload] = useState('QuantumForge 2026: Quantum-Optimized DNA Storage');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('optimized'); // 'optimized' | 'raw' | 'circuit'

  // Pre-configured sample payloads
  const presets = [
    {
      label: 'Standard Archival',
      text: 'QuantumForge 2026: Quantum-Optimized DNA Storage',
    },
    {
      label: 'Homopolymer Heavy (Flawed)',
      text: 'AAAAA 00000 TTTTT ZZZZZ 11111',
    },
    {
      label: 'High-Density Key',
      text: '0x8F9B2C4E_SECURE_VAULT_SEED_QBITS',
    },
  ];

  // Run QAOA optimization on the current input
  const optimizationResult = useMemo(() => {
    if (!inputPayload.trim()) return null;
    const binary = textToBinary(inputPayload);
    return optimizeDnaWithQAOA(binary);
  }, [inputPayload]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFasta = () => {
    if (!optimizationResult) return;
    const fastaContent = generateFasta(
      inputPayload,
      optimizationResult.optimizedDna,
      optimizationResult.optimizedMetrics
    );
    const blob = new Blob([fastaContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qdna_sequence_${Date.now()}.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadCircuitInComposer = () => {
    if (!optimizationResult) return;
    const { qaoaCircuit } = optimizationResult;
    loadAlgorithm({
      title: "Q-DNA QAOA Constraint Optimizer",
      n_qubits: qaoaCircuit.n_qubits,
      recommendedShots: 4096,
      operations: qaoaCircuit.operations,
    });
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
                QAOA v1.0
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Encode arbitrary digital information into biological <strong>A, C, G, T</strong> sequences. A variational 
              <strong> QAOA Quantum Circuit</strong> dynamically eliminates fatal homopolymer repeats and balances GC-content 
              to guarantee physical synthesizability in wet-lab sequencing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadFasta}
              disabled={!optimizationResult}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export .FASTA</span>
            </button>
            <button
              onClick={handleLoadCircuitInComposer}
              disabled={!optimizationResult}
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
            <span className="text-[11px] text-slate-400">Sample Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setInputPayload(p.text)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={inputPayload}
          onChange={(e) => setInputPayload(e.target.value)}
          rows={2}
          className="w-full bg-slate-50 dark:bg-[#070a0f] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          placeholder="Type or paste any text string to encode into synthetic DNA..."
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{inputPayload.length} characters ({inputPayload.length * 8} bits)</span>
          <span>Target Strand Length: {inputPayload.length * 4} base pairs (bp)</span>
        </div>
      </div>

      {/* 3. Comparison Cards: Naive Raw vs Quantum-Optimized */}
      {optimizationResult && (
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
                  optimizationResult.rawMetrics.gcRatio >= 45 && optimizationResult.rawMetrics.gcRatio <= 55 
                    ? 'text-emerald-500' 
                    : 'text-rose-400'
                }`}>
                  {optimizationResult.rawMetrics.gcRatio}%
                </p>
                <p className="text-[9px] text-slate-400">Target: 50%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Homopolymers</p>
                <p className={`text-lg font-bold font-mono mt-0.5 ${
                  optimizationResult.rawMetrics.homopolymers.length === 0 ? 'text-emerald-500' : 'text-rose-400'
                }`}>
                  {optimizationResult.rawMetrics.homopolymers.length} runs
                </p>
                <p className="text-[9px] text-slate-400">Target: 0</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase">Synthesis Score</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-slate-700 dark:text-slate-300">
                  {optimizationResult.rawMetrics.synthesizabilityScore}%
                </p>
                <p className="text-[9px] text-slate-400">Stability index</p>
              </div>
            </div>

            {/* Warning Banner if flawed */}
            {optimizationResult.rawMetrics.hasSevereFlaws && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Synthesis Failure Risk Detected</p>
                  <p className="text-[11px] text-rose-400/90 mt-0.5">
                    {optimizationResult.rawMetrics.homopolymers.length > 0
                      ? `Contains consecutive base repeats (${optimizationResult.rawMetrics.homopolymers.map(h => h.snippet).slice(0, 3).join(', ')}) causing enzymatic polymerase slippage.`
                      : 'Severe GC-content deviation creates secondary hairpin loops.'}
                  </p>
                </div>
              </div>
            )}

            {/* Snippet Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Raw Sequence:</span>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#080c12] border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-400 break-all select-all max-h-24 overflow-y-auto">
                {optimizationResult.rawDna}
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
                  {optimizationResult.optimizedMetrics.gcRatio}%
                </p>
                <p className="text-[9px] text-emerald-400">Optimal (~50%)</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                <p className="text-[10px] text-slate-400 uppercase">Homopolymers</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-emerald-400">
                  {optimizationResult.optimizedMetrics.homopolymers.length} runs
                </p>
                <p className="text-[9px] text-emerald-400">0% Slippage</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40">
                <p className="text-[10px] text-slate-400 uppercase">Synthesis Score</p>
                <p className="text-lg font-bold font-mono mt-0.5 text-emerald-400">
                  {optimizationResult.optimizedMetrics.synthesizabilityScore}%
                </p>
                <p className="text-[9px] text-cyan-400">
                  +{optimizationResult.improvementPct}% Gain
                </p>
              </div>
            </div>

            {/* Success Banner */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Thermodynamically Balanced & Lab-Ready</p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">
                  Melting Temperature Tm: <strong>{optimizationResult.optimizedMetrics.meltingTemp}°C</strong> · 
                  Free Energy: <strong>{optimizationResult.optimizedMetrics.deltaG} kcal/mol</strong>. 
                  Zero secondary hairpin loops.
                </p>
              </div>
            </div>

            {/* Optimized Sequence with Copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="uppercase">Optimized Sequence:</span>
                <button
                  onClick={() => handleCopy(optimizationResult.optimizedDna)}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 font-mono text-xs text-cyan-200 break-all select-all max-h-24 overflow-y-auto">
                {optimizationResult.optimizedDna}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. Interactive DNA Double-Helix Visual Strand */}
      {optimizationResult && (
        <div className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Dna className="w-4 h-4 text-cyan-500" /> Synthetic DNA Double-Helix Complementary Strand
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Primary Coding Strand (5' → 3') with Watson-Crick Complementary Hydrogen Bonds (3' → 5')
              </p>
            </div>
            
            {/* Color Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> A (Adenine)</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> T (Thymine)</span>
              <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> C (Cytosine)</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> G (Guanine)</span>
            </div>
          </div>

          {/* Visual Strand Ladder */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pb-2">
              <span className="text-xs text-cyan-400 font-mono font-bold mr-2">5'</span>
              
              {optimizationResult.optimizedDna.slice(0, 48).split('').map((base, idx) => {
                const comp = COMPLEMENTARY_BASES[base] || { pair: 'N', bonds: 2, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
                const pairMeta = COMPLEMENTARY_BASES[comp.pair] || comp;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group relative">
                    {/* Primary Base */}
                    <div className={`w-8 h-8 rounded-lg ${comp.bg} border ${comp.border} flex items-center justify-center font-mono font-bold text-xs ${comp.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      {base}
                    </div>

                    {/* Hydrogen Bonds Indicator */}
                    <div className="flex flex-col items-center gap-0.5 py-0.5">
                      {Array.from({ length: comp.bonds }).map((_, bIdx) => (
                        <div key={bIdx} className="w-1.5 h-0.5 bg-slate-600 rounded-full" />
                      ))}
                    </div>

                    {/* Complementary Base */}
                    <div className={`w-8 h-8 rounded-lg ${pairMeta.bg} border ${pairMeta.border} flex items-center justify-center font-mono font-bold text-xs ${pairMeta.color} shadow-sm group-hover:scale-110 transition-transform`}>
                      {comp.pair}
                    </div>

                    {/* Position Label */}
                    <span className="text-[9px] text-slate-500 font-mono mt-1 opacity-60">
                      {idx + 1}
                    </span>
                  </div>
                );
              })}

              {optimizationResult.optimizedDna.length > 48 && (
                <div className="flex items-center text-xs text-slate-500 font-mono px-4">
                  + {optimizationResult.optimizedDna.length - 48} more bases
                </div>
              )}

              <span className="text-xs text-cyan-400 font-mono font-bold ml-2">3'</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. How QAOA Works in Biology Explainer */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          The Quantum Optimization Mechanism (QAOA Formulation)
        </h4>
        <p className="leading-relaxed">
          Synthetic biology machines synthesize DNA base-by-base using phosphoramidite chemical cycles. High GC variance or 
          repeated nucleotides (e.g. <code>AAAA</code>) cause secondary folding and enzyme detachment. QuantumForge maps 
          the biological constraints to a <strong>Cost Hamiltonian</strong> <span className="font-mono text-cyan-300">H<sub>C</sub> = &Sigma; J<sub>ij</sub> Z<sub>i</sub>Z<sub>j</sub> + &Sigma; h<sub>i</sub>Z<sub>i</sub></span>. 
          The 4-qubit QAOA circuit searches through candidate phase masks to find the optimal scrambling vector that 
          satisfies all chemical criteria while preserving 100% reversible digital reconstruction.
        </p>
      </div>

    </div>
  );
}

