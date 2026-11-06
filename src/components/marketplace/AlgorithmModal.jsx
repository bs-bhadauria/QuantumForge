import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { X, Copy, Check, Play, FileCode } from 'lucide-react';

export default function AlgorithmModal({ algo, onClose }) {
  const { loadAlgorithm } = useQuantum();
  const [copied, setCopied] = useState(false);

  if (!algo) return null;

  const handleCopyQasm = () => {
    navigator.clipboard.writeText(algo.qasm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoad = () => {
    loadAlgorithm(algo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{algo.categoryLabel || algo.category}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {algo.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              {algo.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dirac Mathematical Formulation */}
        <div className="bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
              Dirac State Vector Formulation
            </span>
            <div className="font-mono text-base font-bold text-cyan-700 dark:text-cyan-300 tracking-wide pt-1">
              {algo.math}
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
            <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              Von Neumann: {algo.entropy || '1.00'}
            </span>
            <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
              CHSH: {algo.chsh || '2√2'}
            </span>
          </div>
        </div>

        {/* Two-column interactive panel: Circuit SVG & Probability Histogram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Circuit SVG */}
          <div className="bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold">
                Hardware Gate Flow
              </span>
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                OpenQASM 3.0
              </span>
            </div>
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex items-center justify-center min-h-[140px] overflow-x-auto shadow-2xs">
              <svg className="w-full max-w-[340px] h-28" viewBox="0 0 340 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Q0 */}
                <text x="10" y="32" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">q[0]</text>
                <line x1="45" y1="28" x2="300" y2="28" stroke="#475569" strokeWidth="1.5" />
                {/* Q1 */}
                <text x="10" y="74" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600">q[1]</text>
                <line x1="45" y1="70" x2="300" y2="70" stroke="#475569" strokeWidth="1.5" />

                {/* H Gate */}
                <rect x="85" y="12" width="32" height="32" rx="4" fill="#00f0ff" fillOpacity="0.15" stroke="#00f0ff" strokeWidth="1.5" />
                <text x="96" y="32" fill="#00f0ff" fontFamily="JetBrains Mono" fontSize="12" fontWeight="700">H</text>

                {/* CX Gate */}
                <circle cx="165" cy="28" r="4.5" fill="#f59e0b" />
                <line x1="165" y1="28" x2="165" y2="70" stroke="#f59e0b" strokeWidth="1.8" />
                <circle cx="165" cy="70" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.8" />
                <line x1="165" y1="62" x2="165" y2="78" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="157" y1="70" x2="173" y2="70" stroke="#f59e0b" strokeWidth="1.5" />

                {/* Measurements */}
                <rect x="235" y="16" width="24" height="24" rx="4" fill="#db2777" fillOpacity="0.15" stroke="#db2777" strokeWidth="1" />
                <text x="242" y="32" fill="#db2777" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">M</text>

                <rect x="235" y="58" width="24" height="24" rx="4" fill="#db2777" fillOpacity="0.15" stroke="#db2777" strokeWidth="1" />
                <text x="242" y="74" fill="#db2777" fontFamily="JetBrains Mono" fontSize="10" fontWeight="700">M</text>
              </svg>
            </div>
            <div className="flex items-center justify-between font-mono text-xs text-slate-500 font-medium">
              <span>Coherence Cost: 48ns</span>
              <span>Two-Qubit Error: 0.04%</span>
            </div>
          </div>

          {/* Right: Ideal Output Histogram */}
          <div className="bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold">
                Ideal Measurement Distribution
              </span>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                4096 Shots · Aer C++
              </span>
            </div>

            <div className="flex items-end justify-around h-32 pt-2 pb-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              {algo.idealDistribution?.map((dist) => (
                <div key={dist.state} className="flex flex-col items-center gap-1 w-12">
                  <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                    {dist.prob}%
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      dist.prob > 0
                        ? dist.color === 'sky'
                          ? 'bg-gradient-to-t from-cyan-600 to-sky-400'
                          : 'bg-gradient-to-t from-purple-600 to-violet-400'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                    style={{ height: `${Math.max(4, dist.prob * 1.5)}px` }}
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-900 dark:text-slate-200">
                    {dist.state}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between font-mono text-xs text-slate-500 font-medium">
              <span>Fidelity: {algo.fidelity || '0.9998'}</span>
              <span>Target Basis: Computational |Z⟩</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleCopyQasm}
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs flex items-center gap-2 transition-colors font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy OpenQASM'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLoad}
              className="px-5 py-2 rounded-lg bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold shadow-[0_0_14px_rgba(0,240,255,0.35)] transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load to Visual Studio →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

