import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import CircuitBoard from './CircuitBoard';
import GatePalette from './GatePalette';
import TelemetryDrawer from './TelemetryDrawer';
import QasmDrawer from './QasmDrawer';
import {
  Play,
  RotateCcw,
  Zap,
  Trash2,
  Code,
  Minus,
  Plus,
  Dices,
  ChevronDown,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Edit2,
  Dna,
  ArrowLeft,
} from 'lucide-react';

export default function CircuitComposer() {
  const {
    circuitName,
    setCircuitName,
    nQubits,
    setNQubits,
    shots,
    setShots,
    seed,
    setSeed,
    runSimulation,
    isSimulating,
    clearCircuit,
    setQasmDrawerOpen,
    undo,
    redo,
    operations,
    previousView,
    setActiveView,
  } = useQuantum();

  const [selectedPaletteGate, setSelectedPaletteGate] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingTitle, setEditingTitle] = useState(false);

  const shotOptions = [1024, 2048, 4096, 8192];

  const handleIncQubits = () => {
    if (nQubits < 8) setNQubits(nQubits + 1);
  };

  const handleDecQubits = () => {
    if (nQubits > 1) setNQubits(nQubits - 1);
  };

  return (
    <div className="flex flex-col w-full text-slate-800 dark:text-slate-100 select-none min-h-[calc(100vh-4rem)]">
      {/* Q-DNA Origin Banner if inspecting from Q-DNA Studio */}
      {(previousView === 'dna' || circuitName?.includes('Q-DNA')) && (
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-cyan-950/60 border-b border-cyan-500/30 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-cyan-300">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>
              Inspecting QAOA Variational Circuit for <strong>Q-DNA Storage Studio</strong>
            </span>
          </div>
          <button
            onClick={() => setActiveView('dna')}
            className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Q-DNA Studio (State Preserved)</span>
          </button>
        </div>
      )}

      {/* Top Sub-header Control Bar (Fully Responsive) */}
      <section className="min-h-[48px] py-1.5 bg-white dark:bg-[#0B0E15] px-4 sm:px-6 flex flex-wrap items-center justify-between gap-y-2 gap-x-3 border-b border-slate-200 dark:border-slate-800 z-30 transition-colors shadow-2xs">
        {/* Title & Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 group cursor-pointer min-w-0">
            {editingTitle ? (
              <input
                type="text"
                value={circuitName}
                onChange={(e) => setCircuitName(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                autoFocus
                className="font-display text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-cyan-400 focus:outline-none max-w-[200px]"
              />
            ) : (
              <span
                onClick={() => setEditingTitle(true)}
                className="font-display text-xs sm:text-sm font-semibold tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px] md:max-w-xs block group-hover:text-cyan-500 transition-colors"
                title="Click to rename"
              >
                {circuitName}
              </span>
            )}
            <Edit2
              onClick={() => setEditingTitle(true)}
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:rotate-12 transition-all cursor-pointer shrink-0"
            />
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-xs shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">Qiskit Aer Ready</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">0.012s</span>
          </div>
        </div>

        {/* Steppers & Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          {/* Qubit Count Stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 shadow-2xs shrink-0">
            <button
              onClick={handleDecQubits}
              disabled={nQubits <= 1}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all cursor-pointer"
              title="Decrease Qubits"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 sm:px-2 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
              {nQubits} Qubits
            </span>
            <button
              onClick={handleIncQubits}
              disabled={nQubits >= 8}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all cursor-pointer"
              title="Increase Qubits"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Shots Select */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 gap-1 text-slate-600 dark:text-slate-300 text-xs shadow-2xs shrink-0">
            <Dices className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={shots}
              onChange={(e) => setShots(Number(e.target.value))}
              className="bg-transparent border-none text-xs font-mono font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {shotOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt.toLocaleString()} shots
                </option>
              ))}
            </select>
          </div>

          {/* Seed Field */}
          <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 gap-1 text-xs text-slate-600 dark:text-slate-300 shadow-2xs shrink-0">
            <span className="font-mono text-[10px] text-slate-400 uppercase font-semibold">seed</span>
            <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{seed}</span>
          </div>

          <div className="hidden sm:block h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-0.5 shrink-0"></div>

          {/* Auto-Transpile Button */}
          <button
            onClick={runSimulation}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all shadow-2xs shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-500" />
            <span>Auto-Transpile</span>
          </button>

          {/* Simulate Action Button */}
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="relative overflow-hidden px-3 sm:px-3.5 py-1 rounded-lg bg-[#00F0FF] dark:bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold flex items-center gap-1.5 shadow-[0_0_14px_rgba(0,240,255,0.35)] transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            title="Run Quantum Simulation (Shift+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSimulating ? 'Simulating...' : 'Simulate'}</span>
            <span className="font-mono text-[9px] opacity-75 ml-0.5 hidden sm:inline">⇧↵</span>
          </button>

          {/* Clear Canvas */}
          <button
            onClick={clearCircuit}
            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0 cursor-pointer"
            title="Clear Circuit"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* OpenQASM Drawer Toggle */}
          <button
            onClick={() => setQasmDrawerOpen(true)}
            className="px-2.5 py-1 rounded bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-cyan-300 flex items-center gap-1 font-mono text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
            title="Open OpenQASM 3.0 Code Drawer"
          >
            <Code className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">OpenQASM</span>
          </button>
        </div>
      </section>

      {/* Main Multi-Panel Workspace (Composer Canvas + Inspector Drawer) */}
      <div className="relative flex flex-1 w-full h-[calc(100vh-7rem)] overflow-hidden">
        {/* Central Quantum Circuit Composer Canvas */}
        <section className="relative flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0A0D14] overflow-hidden">
          {/* Floating HUD Controls */}
          <div className="absolute top-4 left-6 z-20 flex items-center gap-2">
            <div className="flex items-center bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-md p-1">
              <button
                onClick={undo}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={redo}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all"
                title="Reset Frame"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden md:flex bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-mono text-slate-600 dark:text-slate-400 items-center gap-2">
              <span className="text-slate-400">STEP CLK:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold font-mono">8.00 ns / step</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>ENTANGLED: 2 PAIRS</span>
              </span>
            </div>
          </div>

          {/* Interactive Circuit Matrix Board */}
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center top' }}
            className="flex-1 overflow-x-auto overflow-y-auto p-8 flex flex-col justify-start items-center transition-transform duration-200"
          >
            <CircuitBoard
              selectedPaletteGate={selectedPaletteGate}
              setSelectedPaletteGate={setSelectedPaletteGate}
            />
          </div>

          {/* Bottom Floating Gate Palette Dock */}
          <GatePalette
            selectedPaletteGate={selectedPaletteGate}
            onSelectPaletteGate={(gate) => setSelectedPaletteGate(gate)}
            onDragStartGate={(gate) => setSelectedPaletteGate(gate)}
          />

          {/* Slide-over OpenQASM Drawer */}
          <QasmDrawer />
        </section>

        {/* Right Telemetry & Execution Inspector Drawer */}
        <TelemetryDrawer />
      </div>
    </div>
  );
}

