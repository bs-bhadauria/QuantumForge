import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { Plus, X, Gauge, ArrowDown, Check } from 'lucide-react';

export default function CircuitBoard({ selectedPaletteGate, setSelectedPaletteGate }) {
  const {
    nQubits,
    operations,
    addGate,
    removeGate,
    updateEntanglerTarget,
    setActiveParamGate,
    setPopoverVisible,
    isSimulating,
  } = useQuantum();

  const boardRef = useRef(null);
  const slotRefs = useRef({});

  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [hoveredTargetGate, setHoveredTargetGate] = useState(null);
  const [targetDropdownOpen, setTargetDropdownOpen] = useState(null);

  // IBM Quantum Composer Option 1: 2-Step Pending Entangler State
  // { gate: 'CX', controlQubit: 0, step: 2 }
  const [pendingEntangler, setPendingEntangler] = useState(null);

  // Computed SVG bridge lines
  const [bridgeLines, setBridgeLines] = useState([]);

  const steps = [0, 1, 2, 3, 4, 5, 6, 7];

  // Entangling operations (CX, CZ, SWAP, CCX) memoized
  const entanglers = useMemo(
    () =>
      operations.filter(
        (op) =>
          ['CX', 'CZ', 'SWAP', 'CCX'].includes(op.gate) &&
          op.controlQubit !== undefined &&
          op.targetQubit !== undefined
      ),
    [operations]
  );

  // Cancel pending on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPendingEntangler(null);
        setTargetDropdownOpen(null);
        if (setSelectedPaletteGate) setSelectedPaletteGate(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedPaletteGate]);

  // Dynamically compute exact SVG bridge line coordinates from DOM slot elements
  const updateBridgeLines = useCallback(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    const bRect = boardEl.getBoundingClientRect();

    const lines = [];

    entanglers.forEach((ent, idx) => {
      const cQ = ent.controlQubit;
      const tQ = ent.targetQubit;
      const step = ent.step;

      const ctrlEl = slotRefs.current[`${cQ}-${step}`];
      const tgtEl = slotRefs.current[`${tQ}-${step}`];

      if (ctrlEl && tgtEl) {
        const cRect = ctrlEl.getBoundingClientRect();
        const tRect = tgtEl.getBoundingClientRect();

        // Exact sub-pixel center of both nodes relative to board container
        const x = (cRect.left + cRect.right) / 2 - bRect.left;
        const y1 = (cRect.top + cRect.bottom) / 2 - bRect.top;
        const y2 = (tRect.top + tRect.bottom) / 2 - bRect.top;

        lines.push({
          id: `ent-${idx}-${step}-${cQ}-${tQ}`,
          x,
          y1,
          y2,
          topY: Math.min(y1, y2),
          bottomY: Math.max(y1, y2),
          controlQubit: cQ,
          targetQubit: tQ,
          step,
          gate: ent.gate,
        });
      }
    });

    setBridgeLines((prev) => {
      if (
        prev.length === lines.length &&
        prev.every(
          (l, i) =>
            l.id === lines[i].id &&
            Math.abs(l.x - lines[i].x) < 0.5 &&
            Math.abs(l.topY - lines[i].topY) < 0.5 &&
            Math.abs(l.bottomY - lines[i].bottomY) < 0.5
        )
      ) {
        return prev; // Bail out to prevent re-renders!
      }
      return lines;
    });
  }, [entanglers]);

  // Recalculate safely after DOM updates
  useEffect(() => {
    const timer = setTimeout(updateBridgeLines, 40);
    return () => clearTimeout(timer);
  }, [updateBridgeLines, operations, nQubits]);

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;

    const observer = new ResizeObserver(() => {
      updateBridgeLines();
    });
    observer.observe(boardEl);
    window.addEventListener('resize', updateBridgeLines);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBridgeLines);
    };
  }, [updateBridgeLines]);

  // Handle Slot Click (Pure IBM Composer 2-step workflow for entanglers)
  const handleSlotClick = (qubitIndex, step) => {
    const isEntanglerSelected = ['CX', 'CZ', 'SWAP', 'CCX'].includes(selectedPaletteGate);

    // If we have an active pending control node for an entangler
    if (pendingEntangler) {
      if (pendingEntangler.step === step) {
        if (pendingEntangler.controlQubit === qubitIndex) {
          // Clicked same qubit -> Cancel pending
          setPendingEntangler(null);
          return;
        }
        // Step 2 Complete: connect Control -> Target
        addGate({
          gate: pendingEntangler.gate,
          controlQubit: pendingEntangler.controlQubit,
          targetQubit: qubitIndex,
          step,
        });
        setPendingEntangler(null);
        return;
      } else {
        // Clicked a different step -> Start new pending control at that step
        setPendingEntangler({
          gate: pendingEntangler.gate,
          controlQubit: qubitIndex,
          step,
        });
        return;
      }
    }

    // Step 1: If an entangler is selected from palette, click sets Control node
    if (isEntanglerSelected) {
      setPendingEntangler({
        gate: selectedPaletteGate,
        controlQubit: qubitIndex,
        step,
      });
      return;
    }

    // Single-qubit rotations
    if (['Ry', 'Rx', 'Rz', 'U3'].includes(selectedPaletteGate)) {
      addGate({ gate: selectedPaletteGate, qubit: qubitIndex, step, param: 0.785 });
      return;
    }

    // Standard unitary / measurement
    if (selectedPaletteGate) {
      addGate({ gate: selectedPaletteGate, qubit: qubitIndex, step });
    }
  };

  // Drag and Drop support
  const handleDrop = (e, qubitIndex, step) => {
    e.preventDefault();
    setDragOverSlot(null);
    const gate = e.dataTransfer.getData('text/plain') || selectedPaletteGate;
    if (!gate) return;

    if (['CX', 'CZ', 'SWAP', 'CCX'].includes(gate)) {
      // Default to connecting to next qubit (or previous if last), but instantly editable
      const target = qubitIndex < nQubits - 1 ? qubitIndex + 1 : Math.max(0, qubitIndex - 1);
      addGate({ gate, controlQubit: qubitIndex, targetQubit: target, step });
      setPendingEntangler(null);
    } else if (['Ry', 'Rx', 'Rz', 'U3'].includes(gate)) {
      addGate({ gate, qubit: qubitIndex, step, param: 0.785 });
    } else {
      addGate({ gate, qubit: qubitIndex, step });
    }
  };

  return (
    <div className="relative w-full max-w-[940px] select-none my-auto flex flex-col gap-2">
      {/* IBM Quantum Composer Status Hint Bar (when connecting entanglers) */}
      {pendingEntangler && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-mono shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold">
              {pendingEntangler.gate} Placement [Step 2 of 2]:
            </span>
            <span>
              Control set on <strong>q[{pendingEntangler.controlQubit}]</strong>. Now click any other qubit at column <strong>t{pendingEntangler.step}</strong> to set Target (⊕).
            </span>
          </div>
          <button
            onClick={() => setPendingEntangler(null)}
            className="px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/50 text-amber-900 dark:text-amber-100 font-bold transition-all"
          >
            Cancel (Esc)
          </button>
        </div>
      )}

      {/* Step Markers (t0 - t7) */}
      <div className="grid grid-cols-8 pl-24 pr-6 text-center font-mono text-xs text-slate-400 dark:text-slate-500 font-medium">
        {steps.map((s) => (
          <div
            key={s}
            className={`transition-colors cursor-default ${
              pendingEntangler?.step === s ? 'text-amber-500 font-bold' : 'hover:text-cyan-500'
            }`}
          >
            t{s}
          </div>
        ))}
      </div>

      {/* Main Matrix Visualizer Card */}
      <div
        ref={boardRef}
        className="relative flex flex-col gap-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Laser Scanning Beam Animation on Simulation */}
        {isSimulating && (
          <div
            id="sim-laser-beam"
            className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_16px_rgba(0,240,255,0.95)] z-40 pointer-events-none laser-beam-anim"
          />
        )}

        {/* ======================================================== */}
        {/* DYNAMIC SVG BRIDGE LINES (100% Sub-Pixel Accurate)     */}
        {/* ======================================================== */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            <filter id="cnot-laser-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="cnot-bridge-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Render each verified entangler bridge line */}
          {bridgeLines.map((line) => (
            <g key={line.id}>
              {/* Outer Glowing Aura */}
              <line
                x1={line.x}
                y1={line.topY}
                x2={line.x}
                y2={line.bottomY}
                stroke="#f59e0b"
                strokeWidth="5"
                strokeOpacity="0.35"
                strokeLinecap="round"
                filter="url(#cnot-laser-glow)"
              />
              {/* Crisp Core Laser Line */}
              <line
                x1={line.x}
                y1={line.topY}
                x2={line.x}
                y2={line.bottomY}
                stroke="url(#cnot-bridge-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Midpoint Quantum Entanglement Particle */}
              <circle
                cx={line.x}
                cy={(line.topY + line.bottomY) / 2}
                r="3"
                fill="#fef08a"
                stroke="#f59e0b"
                strokeWidth="1.5"
                filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.9))"
              />
            </g>
          ))}
        </svg>

        {/* Qubit Rails */}
        {Array.from({ length: nQubits }).map((_, qIdx) => {
          return (
            <div key={`qubit-${qIdx}`} className="relative flex items-center h-10 group">
              {/* Qubit Label */}
              <div className="w-20 flex-shrink-0 flex items-center justify-between pr-4">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                  q[{qIdx}] {qIdx === 2 && nQubits === 3 && <span className="text-[10px] text-slate-400 font-mono">anc</span>}
                </span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">|0⟩</span>
              </div>

              {/* Wire vector background line with photon packets */}
              <div className="absolute left-20 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-slate-700/80 overflow-hidden pointer-events-none">
                <div
                  className={`absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 ${
                    qIdx === 0
                      ? 'quantum-wire-pulse'
                      : qIdx === 1
                      ? 'quantum-wire-pulse-delay-1'
                      : 'quantum-wire-pulse-delay-2'
                  }`}
                />
                <div
                  className={`absolute top-0 left-0 w-2.5 h-full rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.9)] ${
                    qIdx === 0
                      ? 'quantum-wire-pulse'
                      : qIdx === 1
                      ? 'quantum-wire-pulse-delay-1'
                      : 'quantum-wire-pulse-delay-2'
                  }`}
                />
              </div>

              {/* Slots and Gates Grid */}
              <div className="relative z-20 w-full grid grid-cols-8 pl-2 pr-4 h-full items-center">
                {steps.map((step) => {
                  const slotKey = `${qIdx}-${step}`;

                  // Find gate on this slot
                  const gate = operations.find(
                    (op) =>
                      op.step === step &&
                      (op.qubit === qIdx ||
                        op.controlQubit === qIdx ||
                        op.controlQubit2 === qIdx ||
                        op.targetQubit === qIdx ||
                        (Array.isArray(op.controls) && op.controls.includes(qIdx)))
                  );

                  // Pending control check
                  const isPendingControl =
                    pendingEntangler &&
                    pendingEntangler.step === step &&
                    pendingEntangler.controlQubit === qIdx;

                  // Candidate target check (same step, different qubit)
                  const isCandidateTarget =
                    pendingEntangler &&
                    pendingEntangler.step === step &&
                    pendingEntangler.controlQubit !== qIdx;

                  // Render Pending Control Node
                  if (isPendingControl) {
                    return (
                      <div
                        key={step}
                        ref={(el) => (slotRefs.current[slotKey] = el)}
                        onClick={() => handleSlotClick(qIdx, step)}
                        className="flex justify-center"
                      >
                        <div
                          className="relative w-7 h-7 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.8)] scale-110"
                          title="Click to cancel control node"
                        >
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
                        </div>
                      </div>
                    );
                  }

                  // Render Candidate Target Slot in Step 2 mode
                  if (isCandidateTarget) {
                    return (
                      <div
                        key={step}
                        ref={(el) => (slotRefs.current[slotKey] = el)}
                        onClick={() => handleSlotClick(qIdx, step)}
                        className="flex justify-center"
                      >
                        <div
                          className="w-7 h-7 rounded-full border-2 border-dashed border-amber-400 bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-300 flex items-center justify-center cursor-pointer transition-all hover:scale-125 shadow-xs"
                          title={`Click to connect Target to q[${qIdx}]`}
                        >
                          <span className="font-bold text-xs">⊕</span>
                        </div>
                      </div>
                    );
                  }

                  // Render Placed Gate
                  if (gate) {
                    // Multi-Qubit Entangler (CX, CZ, SWAP, CCX)
                    if (['CX', 'CZ', 'SWAP', 'CCX'].includes(gate.gate)) {
                      // 1. CONTROL NODE (●)
                      const isControl =
                        gate.controlQubit === qIdx ||
                        gate.controlQubit2 === qIdx ||
                        (Array.isArray(gate.controls) && gate.controls.includes(qIdx));

                      if (isControl) {
                        return (
                          <div
                            key={step}
                            ref={(el) => (slotRefs.current[slotKey] = el)}
                            className="flex justify-center"
                          >
                            <div
                              className="relative group/gate w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center cursor-grab shadow-xs gate-interactive gate-entangle-hover"
                              title={`${gate.gate} Control on q[${qIdx}] → Target on q[${gate.targetQubit}]`}
                            >
                              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGate(qIdx, step);
                                }}
                                className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/gate:opacity-100 transition-opacity z-30"
                                title="Remove Entangler"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // 2. TARGET NODE (⊕ for CX/CCX, ■ for CZ, ✕ for SWAP)
                      if (gate.targetQubit === qIdx) {
                        const isDropdownOpen = targetDropdownOpen === `${qIdx}-${step}`;

                        return (
                          <div
                            key={step}
                            ref={(el) => (slotRefs.current[slotKey] = el)}
                            className="relative flex justify-center"
                            onMouseEnter={() => setHoveredTargetGate(`${qIdx}-${step}`)}
                            onMouseLeave={() => setHoveredTargetGate(null)}
                          >
                            <div
                              onClick={() => setTargetDropdownOpen(isDropdownOpen ? null : `${qIdx}-${step}`)}
                              className="relative group/gate w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-400 text-amber-500 flex items-center justify-center shadow-xs cursor-pointer gate-interactive gate-entangle-hover"
                              title={`${gate.gate} Target on q[${qIdx}] · Click to change target qubit`}
                            >
                              {gate.gate === 'SWAP' ? (
                                <span className="font-bold text-sm leading-none">✕</span>
                              ) : gate.gate === 'CZ' ? (
                                <span className="font-bold text-xs leading-none">Z</span>
                              ) : (
                                <span className="font-bold text-sm leading-none">⊕</span>
                              )}

                              {/* Remove Gate Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGate(qIdx, step);
                                }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/gate:opacity-100 transition-opacity z-30"
                                title="Remove Entangler"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* In-place Target Qubit Switcher Dropdown */}
                            {isDropdownOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-9 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-400/60 rounded-lg shadow-xl p-1.5 flex flex-col gap-1 min-w-[90px]"
                              >
                                <span className="font-mono text-[9px] uppercase text-amber-400 font-bold px-1">
                                  Set Target:
                                </span>
                                {Array.from({ length: nQubits }).map((_, targetOpt) => {
                                  if (targetOpt === gate.controlQubit) return null;
                                  return (
                                    <button
                                      key={targetOpt}
                                      onClick={() => {
                                        updateEntanglerTarget(gate.controlQubit, step, targetOpt);
                                        setTargetDropdownOpen(null);
                                      }}
                                      className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center justify-between transition-colors ${
                                        targetOpt === qIdx
                                          ? 'bg-amber-500 text-slate-950 font-bold'
                                          : 'text-slate-300 hover:bg-slate-800'
                                      }`}
                                    >
                                      <span>q[{targetOpt}]</span>
                                      {targetOpt === qIdx && <Check className="w-3 h-3" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }
                    }

                    // Rotations (Ry, Rx, Rz, U3)
                    if (['Ry', 'Rx', 'Rz', 'U3'].includes(gate.gate)) {
                      return (
                        <div
                          key={step}
                          ref={(el) => (slotRefs.current[slotKey] = el)}
                          className="flex justify-center"
                        >
                          <div
                            onClick={() => {
                              setActiveParamGate({ ...gate, qubit: qIdx, step });
                              setPopoverVisible(true);
                            }}
                            className="relative group/gate px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-600/60 text-purple-700 dark:text-purple-300 flex flex-col items-center justify-center cursor-pointer transition-all shadow-xs gate-interactive gate-rot-hover"
                            title="Click to tune θ rotation angle"
                          >
                            <span className="font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                              {gate.gate}
                            </span>
                            <span className="font-mono text-[9px] text-violet-600 dark:text-violet-400 font-semibold">
                              {gate.param ? Number(gate.param).toFixed(3) : '0.785'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeGate(qIdx, step);
                              }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/gate:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Measurement M
                    if (gate.gate === 'M') {
                      return (
                        <div
                          key={step}
                          ref={(el) => (slotRefs.current[slotKey] = el)}
                          className="flex justify-center"
                        >
                          <div
                            className="relative group/gate w-9 h-9 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-pink-400 text-pink-600 dark:text-pink-400 flex items-center justify-center cursor-pointer shadow-xs gate-interactive"
                            title="Z-Basis Projective Measurement"
                          >
                            <Gauge className="w-4 h-4" />
                            <button
                              onClick={() => removeGate(qIdx, step)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/gate:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Standard Unitary (H, X, Y, Z, S, T)
                    const isHadamard = gate.gate === 'H';
                    return (
                      <div
                        key={step}
                        ref={(el) => (slotRefs.current[slotKey] = el)}
                        className="flex justify-center"
                      >
                        <div
                          className={`relative group/gate w-9 h-9 rounded border font-mono text-sm font-bold flex items-center justify-center cursor-grab transition-all shadow-xs gate-interactive active:scale-90 ${
                            isHadamard
                              ? 'bg-sky-50 dark:bg-cyan-950/40 border-sky-300 dark:border-cyan-500/60 text-sky-700 dark:text-cyan-300'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                          title={`${gate.gate} Gate`}
                        >
                          <span>{gate.gate}</span>
                          <button
                            onClick={() => removeGate(qIdx, step)}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/gate:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot
                  const isHovered = dragOverSlot === slotKey;
                  return (
                    <div
                      key={step}
                      ref={(el) => (slotRefs.current[slotKey] = el)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverSlot(slotKey);
                      }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => handleDrop(e, qIdx, step)}
                      onClick={() => handleSlotClick(qIdx, step)}
                      className="flex justify-center"
                    >
                      <div
                        className={`wire-slot w-7 h-7 rounded border transition-all flex items-center justify-center cursor-pointer group/slot active:scale-95 ${
                          isHovered
                            ? 'border-cyan-500 bg-cyan-100 dark:bg-cyan-950/50 scale-110 shadow-xs'
                            : 'border-transparent hover:border-dashed hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-400'
                        }`}
                        title="Click or drop gate here"
                      >
                        <Plus className="w-3 h-3 opacity-0 group-hover/slot:opacity-100 transition-opacity text-cyan-600 dark:text-cyan-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Classical Register Bus (Double Wire) */}
        <div className="relative flex items-center h-9 mt-2">
          <div className="w-20 flex-shrink-0 flex items-center justify-between pr-4">
            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">c[{nQubits}]</span>
            <span className="font-mono text-xs text-slate-400 dark:text-slate-500">00</span>
          </div>

          {/* Double Lines */}
          <div className="absolute left-20 right-4 top-[14px] h-[1px] bg-slate-300 dark:bg-slate-700" />
          <div className="absolute left-20 right-4 top-[18px] h-[1px] bg-slate-300 dark:bg-slate-700" />

          {/* Bus Markers */}
          <div className="relative z-20 w-full grid grid-cols-8 pl-2 pr-4 h-full items-center">
            {steps.map((step) => {
              const hasMeasure = operations.some((op) => op.step === step && op.gate === 'M');
              return (
                <div key={step} className="flex justify-center">
                  {hasMeasure && (
                    <div className="flex flex-col items-center">
                      <ArrowDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 animate-pulse" />
                      <span className="font-mono text-[9px] text-slate-500 font-bold">2b</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
