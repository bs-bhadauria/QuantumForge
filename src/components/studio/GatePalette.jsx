import React from 'react';
import { useQuantum } from '../../context/QuantumContext';
import ParamPopover from './ParamPopover';
import { Gauge } from 'lucide-react';

export default function GatePalette({ selectedPaletteGate, onSelectPaletteGate, onDragStartGate }) {
  const { setPopoverVisible, popoverVisible } = useQuantum();

  const handleDragStart = (e, gateName) => {
    e.dataTransfer.setData('text/plain', gateName);
    if (onDragStartGate) onDragStartGate(gateName);
  };

  const handleGateClick = (gateName) => {
    if (['Ry', 'Rx', 'Rz', 'U3'].includes(gateName)) {
      setPopoverVisible(!popoverVisible);
    }
    if (onSelectPaletteGate) {
      // Toggle if already selected
      if (selectedPaletteGate === gateName) {
        onSelectPaletteGate(null);
      } else {
        onSelectPaletteGate(gateName);
      }
    }
  };

  return (
    <div className="relative z-30 px-6 pb-4 pt-1 w-full flex justify-center">
      <div className="relative bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3.5 flex flex-wrap items-center gap-6 max-w-4xl transition-all">
        {/* Floating Param Popover */}
        <ParamPopover />

        {/* Group 1: Unitaries */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
            Unitaries (Drag / Click)
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { name: 'H', label: 'H', style: 'bg-sky-50 dark:bg-cyan-950/40 border-sky-300 dark:border-cyan-500/50 text-sky-700 dark:text-cyan-300' },
              { name: 'X', label: 'X', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
              { name: 'Y', label: 'Y', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
              { name: 'Z', label: 'Z', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
              { name: 'S', label: 'S', style: 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600/50 text-purple-700 dark:text-purple-300' },
              { name: 'T', label: 'T', style: 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-600/50 text-purple-700 dark:text-purple-300' },
            ].map((gate) => {
              const isSelected = selectedPaletteGate === gate.name;
              return (
                <button
                  key={gate.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, gate.name)}
                  onClick={() => handleGateClick(gate.name)}
                  className={`w-8 h-8 rounded-lg border font-mono text-xs font-bold transition-all shadow-xs active:scale-90 gate-interactive cursor-grab flex items-center justify-center ${gate.style} ${
                    isSelected ? 'ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-slate-900 scale-105' : ''
                  }`}
                  title={`${gate.name} Gate - Click to select or drag onto wire`}
                >
                  {gate.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        {/* Group 2: Rotations */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
            Rotations
          </span>
          <div className="flex items-center gap-1.5">
            {[
              { name: 'Rx', label: 'Rx(θ)', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
              { name: 'Ry', label: 'Ry(θ)', style: 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 dark:border-purple-500 text-purple-800 dark:text-purple-300 font-bold' },
              { name: 'Rz', label: 'Rz(θ)', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
              { name: 'U3', label: 'U3', style: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200' },
            ].map((gate) => {
              const isSelected = selectedPaletteGate === gate.name;
              return (
                <button
                  key={gate.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, gate.name)}
                  onClick={() => handleGateClick(gate.name)}
                  className={`px-2.5 h-8 rounded-lg border font-mono text-xs transition-all shadow-xs active:scale-90 gate-rot-hover cursor-grab flex items-center justify-center ${gate.style} ${
                    isSelected ? 'ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-slate-900 scale-105' : ''
                  }`}
                  title={`${gate.name} Gate - Click to adjust angle θ or select`}
                >
                  {gate.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        {/* Group 3: Entanglers */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
            Entanglers
          </span>
          <div className="flex items-center gap-1.5">
            {['CX', 'CZ', 'SWAP', 'CCX'].map((gate) => {
              const isSelected = selectedPaletteGate === gate;
              return (
                <button
                  key={gate}
                  draggable
                  onDragStart={(e) => handleDragStart(e, gate)}
                  onClick={() => handleGateClick(gate)}
                  className={`px-2.5 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-600/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold transition-all shadow-xs active:scale-90 gate-entangle-hover cursor-grab flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-900 scale-105 shadow-[0_0_12px_rgba(245,158,11,0.6)]' : ''
                  }`}
                  title={`${gate} Entangler - Click to connect Control & Target qubits`}
                >
                  {gate}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        {/* Group 4: Measure / Sync */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
            Measure / Sync
          </span>
          <div className="flex items-center gap-1.5">
            {['M', 'Barrier'].map((gate) => {
              const isSelected = selectedPaletteGate === gate;
              return (
                <button
                  key={gate}
                  draggable
                  onDragStart={(e) => handleDragStart(e, gate)}
                  onClick={() => handleGateClick(gate)}
                  className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-400 text-pink-600 dark:text-pink-400 font-mono flex items-center justify-center transition-all shadow-xs active:scale-90 gate-interactive cursor-grab ${
                    isSelected ? 'ring-2 ring-pink-500 ring-offset-1 dark:ring-offset-slate-900 scale-105' : ''
                  }`}
                  title={`${gate === 'M' ? 'Z-Basis Measurement' : 'Hardware Barrier'}`}
                >
                  {gate === 'M' ? <Gauge className="w-4 h-4" /> : '|'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
