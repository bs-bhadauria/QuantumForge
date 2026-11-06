import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Cpu, Play, Eye, Sparkles } from 'lucide-react';

export default function AlgorithmCard({ algo, onInspect }) {
  const { loadAlgorithm } = useQuantum();

  return (
    <article
      data-category={algo.category}
      className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/50 shadow-sm hover:shadow-[0_4px_20px_rgba(0,240,255,0.08)] transition-all group"
    >
      <div>
        {/* Category Pill and Metrics */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] tracking-wider uppercase font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
            {algo.category}
          </span>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span>{algo.n_qubits}Q</span>
            <span>·</span>
            <span>D:{algo.depth}</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{algo.fidelity}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors mb-2">
          {algo.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {algo.description}
        </p>

        {/* Dirac preview */}
        <div className="p-2 rounded bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 font-mono text-xs text-cyan-700 dark:text-cyan-300 truncate font-semibold mb-4">
          {algo.math}
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 gap-2">
        <button
          onClick={() => onInspect(algo)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
        <button
          onClick={() => loadAlgorithm(algo)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-display text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Load</span>
        </button>
      </div>
    </article>
  );
}

