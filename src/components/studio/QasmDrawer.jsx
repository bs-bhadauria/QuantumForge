import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Code2, ChevronRight, Copy, Check } from 'lucide-react';

export default function QasmDrawer() {
  const { qasmDrawerOpen, setQasmDrawerOpen, openQasmCode } = useQuantum();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(openQasmCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[420px] bg-slate-900 text-slate-100 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl border-l border-slate-700/80 ${
        qasmDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Drawer Header */}
      <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-cyan-400" />
          <span className="font-display text-sm font-bold tracking-wide text-white">
            OpenQASM 3.0 Live Sync
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
            Synced
          </span>
        </div>
        <button
          onClick={() => setQasmDrawerOpen(false)}
          className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          title="Close Drawer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Target & Copy Bar */}
      <div className="p-4 flex items-center justify-between bg-slate-900/90 border-b border-slate-800 font-mono text-xs text-slate-400">
        <span>
          Target: <span className="text-cyan-300 font-mono">Qiskit Aer Matrix-Q32</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Syntax highlighted code body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed bg-[#0a0f1d]">
        {openQasmCode.split('\n').map((line, index) => {
          let lineContent = <span className="text-slate-300">{line}</span>;

          if (line.startsWith('OPENQASM')) {
            lineContent = (
              <>
                <span className="text-indigo-400 font-semibold">OPENQASM</span>{' '}
                <span className="text-emerald-400">3.0</span>;
              </>
            );
          } else if (line.startsWith('include')) {
            lineContent = (
              <>
                <span className="text-indigo-400 font-semibold">include</span>{' '}
                <span className="text-amber-300">"stdgates.inc"</span>;
              </>
            );
          } else if (line.startsWith('qubit') || line.startsWith('bit')) {
            lineContent = (
              <span className="text-cyan-400 font-medium">
                {line}
              </span>
            );
          } else if (line.includes('cx') || line.includes('cz') || line.includes('swap')) {
            lineContent = <span className="text-amber-400 font-semibold">{line}</span>;
          } else if (line.includes('ry') || line.includes('rx') || line.includes('rz')) {
            lineContent = <span className="text-purple-400 font-semibold">{line}</span>;
          } else if (line.includes('measure')) {
            lineContent = <span className="text-pink-400 font-semibold">{line}</span>;
          } else if (line.startsWith('h ') || line.startsWith('x ') || line.startsWith('y ') || line.startsWith('z ')) {
            lineContent = <span className="text-cyan-300 font-bold">{line}</span>;
          }

          return (
            <div key={index} className="flex items-center text-slate-500 py-0.5 hover:bg-slate-800/40 px-2 rounded">
              <span className="w-7 text-slate-600 select-none text-[11px]">{index + 1}</span>
              {lineContent}
            </div>
          );
        })}
      </div>

      {/* Footer Status */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live Parsing Engine AST
        </span>
        <span className="font-mono text-slate-500">Depth: {openQasmCode.split('\n').length} lines</span>
      </div>
    </div>
  );
}

