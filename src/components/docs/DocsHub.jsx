import React from 'react';
import { BookOpen, Code2, Layers, Cpu, Compass, Check } from 'lucide-react';

export default function DocsHub() {
  const gates = [
    {
      symbol: 'H (Hadamard)',
      matrix: '1/√2 [[1, 1], [1, -1]]',
      role: 'Superposition generator. Maps Z-basis (|0⟩, |1⟩) into X-basis (|+⟩, |-⟩).',
      category: 'Unitary Clifford',
    },
    {
      symbol: 'X (Pauli-X)',
      matrix: '[[0, 1], [1, 0]]',
      role: 'Quantum bit flip. Acts as quantum NOT: X|0⟩ = |1⟩, X|1⟩ = |0⟩.',
      category: 'Pauli Group',
    },
    {
      symbol: 'Y (Pauli-Y)',
      matrix: '[[0, -i], [i, 0]]',
      role: 'Combined bit and phase flip: Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.',
      category: 'Pauli Group',
    },
    {
      symbol: 'Z (Pauli-Z)',
      matrix: '[[1, 0], [0, -1]]',
      role: 'Phase flip. Leaves |0⟩ unchanged and applies -1 phase to |1⟩.',
      category: 'Pauli Group',
    },
    {
      symbol: 'S (Phase)',
      matrix: '[[1, 0], [0, i]]',
      role: 'π/2 rotation about Z-axis. S = √Z.',
      category: 'Clifford Group',
    },
    {
      symbol: 'T (π/8 Gate)',
      matrix: '[[1, 0], [0, e^{iπ/4}]]',
      role: 'Universal non-Clifford gate. Essential for fault-tolerant quantum computation.',
      category: 'Non-Clifford',
    },
    {
      symbol: 'Ry(θ)',
      matrix: '[[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]',
      role: 'Continuous single-qubit rotation about Y-axis on the Bloch sphere.',
      category: 'Parametric',
    },
    {
      symbol: 'CX (CNOT)',
      matrix: '4x4 Permutation Matrix',
      role: 'Two-qubit entanglement operator. Flips target qubit conditional on control qubit = |1⟩.',
      category: 'Entangler',
    },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Documentation & Architecture Hub</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Quantum Gate Algebra & OpenQASM 3.0 Specification
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
          Comprehensive reference guide for quantum circuit synthesis, unitary transformation matrices, and hardware-level execution models.
        </p>
      </div>

      {/* 2-Column Specs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Gate Matrix Reference (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>Standard Quantum Gate Unitary Matrices</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gates.map((g) => (
                <div
                  key={g.symbol}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      {g.symbol}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800">
                      {g.category}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-900 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                    {g.matrix}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    {g.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: OpenQASM 3.0 Guide (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-500" />
              <span>OpenQASM 3.0 Grammar</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              OpenQASM 3.0 extends OpenQASM 2.0 with classical control flow, subroutines, timing semantics, and arbitrary precision angles.
            </p>

            <div className="font-mono text-xs bg-slate-50 dark:bg-[#070A0F] p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-slate-700 dark:text-slate-300">
              <div className="text-violet-600 dark:text-violet-400 font-bold">// Register Definition</div>
              <div>qubit[3] q;</div>
              <div>bit[3] c;</div>
              <div className="text-violet-600 dark:text-violet-400 font-bold pt-2">// Rotation Syntax</div>
              <div>ry(π/4) q[0];</div>
              <div>cx q[0], q[1];</div>
              <div className="text-violet-600 dark:text-violet-400 font-bold pt-2">// Measurement</div>
              <div>c = measure q;</div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/40 text-xs text-cyan-950 dark:text-cyan-200">
              <strong className="block mb-1 font-display">Clifford + T Universality</strong>
              Any arbitrary unitary operation U can be approximated to arbitrary accuracy ε using sequences of H, S, CX and T gates (Solovay-Kitaev theorem).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

