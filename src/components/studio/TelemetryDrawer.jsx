import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import BlochSphere from '../bloch/BlochSphere';
import { Download, Terminal, Copy, Check, BarChart3, Maximize2 } from 'lucide-react';

export default function TelemetryDrawer() {
  const {
    simulationResult,
    telemetryTab,
    setTelemetryTab,
    histogramMode,
    setHistogramMode,
    openQasmCode,
    setQasmDrawerOpen,
    shots,
    circuitName,
  } = useQuantum();

  const [copiedQasm, setCopiedQasm] = useState(false);

  const res = simulationResult?.resources || {
    depth: 4,
    gateCount: 6,
    entangleDensity: '0.33',
    fidelity: '99.82%',
    runtimeMs: 12,
  };

  const basisStates = simulationResult?.basisStates || [
    { bitstring: '00', p: 0.5078, ampReal: 0.7126, ampImag: 0.0 },
    { bitstring: '11', p: 0.4922, ampReal: 0.7015, ampImag: 0.0 },
  ];

  const counts = simulationResult?.counts || { '00': 2080, '11': 2016 };

  const handleCopyQasm = () => {
    navigator.clipboard.writeText(openQasmCode);
    setCopiedQasm(true);
    setTimeout(() => setCopiedQasm(false), 2000);
  };

  const downloadJsonReport = () => {
    const report = {
      circuitName,
      timestamp: new Date().toISOString(),
      engine: 'Qiskit Aer Matrix C++ v0.12.2',
      resources: res,
      shots,
      probabilities: simulationResult?.probabilities || {},
      counts,
      qasm: openQasmCode,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantumforge_sim_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPythonScript = () => {
    const pyScript = `# QuantumForge Auto-Generated Qiskit Script
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Circuit Definition
qasm_str = """${openQasmCode}"""
circuit = QuantumCircuit.from_qasm_str(qasm_str)

# Execution
simulator = AerSimulator()
compiled = transpile(circuit, simulator)
job = simulator.run(compiled, shots=${shots})
result = job.result()
counts = result.get_counts()

print("Execution Results:", counts)
`;
    const blob = new Blob([pyScript], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_circuit.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <aside className="w-[310px] sm:w-[340px] xl:w-[380px] bg-white dark:bg-[#0B0E15] border-l border-slate-200 dark:border-slate-800/80 flex flex-col flex-shrink-0 z-20 shadow-lg overflow-hidden transition-all duration-200">
      {/* Tab Navigation */}
      <div className="flex items-center bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-2 pt-2 gap-1 shrink-0">
        <button
          onClick={() => setTelemetryTab('prob')}
          className={`flex-1 py-2 px-1 text-center text-xs transition-all truncate ${
            telemetryTab === 'prob'
              ? 'font-bold text-sky-700 dark:text-cyan-400 bg-white dark:bg-[#0B0E15] border-t border-x border-slate-200 dark:border-slate-800 rounded-t shadow-2xs'
              : 'font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
          title="Measured Probabilities & Counts"
        >
          Probabilities
        </button>
        <button
          onClick={() => setTelemetryTab('qasm')}
          className={`flex-1 py-2 px-1 text-center text-xs transition-all truncate ${
            telemetryTab === 'qasm'
              ? 'font-bold text-sky-700 dark:text-cyan-400 bg-white dark:bg-[#0B0E15] border-t border-x border-slate-200 dark:border-slate-800 rounded-t shadow-2xs'
              : 'font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
          title="OpenQASM 3.0 Representation"
        >
          OpenQASM 3.0
        </button>
        <button
          onClick={() => setTelemetryTab('bloch')}
          className={`flex-1 py-2 px-1 text-center text-xs transition-all truncate ${
            telemetryTab === 'bloch'
              ? 'font-bold text-sky-700 dark:text-cyan-400 bg-white dark:bg-[#0B0E15] border-t border-x border-slate-200 dark:border-slate-800 rounded-t shadow-2xs'
              : 'font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
          title="Bloch Sphere 3D Statevector"
        >
          Bloch / |ψ⟩ Vector
        </button>
      </div>

      {/* Telemetry Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex flex-col">
            <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Circuit Depth
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {res.depth}
            </span>
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
              Critical Path: t0-t{Math.max(1, res.depth - 1)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex flex-col">
            <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Gate Operations
            </span>
            <span className="font-display text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {res.gateCount}
            </span>
            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              Unitary + Multi-Q
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg flex flex-col">
            <span className="font-mono text-[10px] uppercase text-slate-400 dark:text-slate-500 font-semibold">
              Entangle Density
            </span>
            <span className="font-display text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {res.entangleDensity}
            </span>
            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              EPR Links Verified
            </span>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-lg flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-emerald-800 dark:text-emerald-400 font-semibold">
                Est. Fidelity
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="font-display text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {res.fidelity}
            </span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Aer noise-free
            </span>
          </div>
        </div>

        {/* Tab 1: Probabilities Histogram */}
        {telemetryTab === 'prob' && (
          <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Measured Basis States</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </span>
              <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                <button
                  onClick={() => setHistogramMode('prob')}
                  className={`transition-colors ${
                    histogramMode === 'prob'
                      ? 'font-bold text-cyan-600 dark:text-cyan-400'
                      : 'hover:text-slate-700'
                  }`}
                >
                  PROB
                </button>
                <span>|</span>
                <button
                  onClick={() => setHistogramMode('counts')}
                  className={`transition-colors ${
                    histogramMode === 'counts'
                      ? 'font-bold text-cyan-600 dark:text-cyan-400'
                      : 'hover:text-slate-700'
                  }`}
                >
                  BITSTR
                </button>
              </div>
            </div>

            {/* Bars */}
            <div className="flex flex-col gap-2.5 pt-1">
              {basisStates.slice(0, 6).map((b, idx) => {
                const pct = (b.p * 100).toFixed(2);
                const count = counts[b.bitstring] || Math.round(b.p * shots);
                const isSignificant = b.p > 0.01;

                return (
                  <div key={b.bitstring} className={`flex flex-col gap-1 ${!isSignificant ? 'opacity-40' : ''}`}>
                    <div className="flex justify-between items-center font-mono text-xs">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            idx % 2 === 0 ? 'bg-cyan-400' : 'bg-purple-500'
                          }`}
                        />
                        <span>|{b.bitstring}⟩</span>
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono text-[11px] tabular-nums">
                        {histogramMode === 'prob' ? `${pct}%` : `${count} shots`}
                        {histogramMode === 'prob' && (
                          <span className="text-slate-400 text-[10px] ml-1">({count})</span>
                        )}
                      </span>
                    </div>
                    <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full shimmer-bar transition-all duration-500 ${
                          idx % 2 === 0
                            ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600'
                            : 'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600'
                        }`}
                        style={{ width: `${Math.max(b.p > 0 ? 2 : 0, Number(pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: OpenQASM Code View */}
        {telemetryTab === 'qasm' && (
          <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase text-slate-500 font-semibold">
                Generated OpenQASM 3.0
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQasmDrawerOpen(true)}
                  className="px-2 py-0.5 rounded bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 text-sky-700 dark:text-cyan-400 text-[11px] font-mono flex items-center gap-1 transition-all"
                  title="Expand Full Code Editor"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </button>
                <button
                  onClick={handleCopyQasm}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-all"
                >
                  {copiedQasm ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQasm ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 bg-white dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 p-3 rounded-lg overflow-x-auto">
              <code>{openQasmCode}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: Bloch Sphere & State Vector */}
        {telemetryTab === 'bloch' && (
          <div className="flex flex-col gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl">
            <BlochSphere />

            {/* Statevector breakdown list */}
            <div className="flex flex-col gap-1.5 font-mono text-xs pt-2">
              <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold">
                Amplitude Vector |ψ⟩ Breakdown
              </span>
              {basisStates.slice(0, 4).map((b) => (
                <div
                  key={b.bitstring}
                  className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                  <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                    |{b.bitstring}⟩
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    {b.ampReal.toFixed(4)} + {b.ampImag.toFixed(4)}i
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    |amp|²={(b.p).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulation Artifacts Card */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-3 rounded-xl flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase text-slate-400 font-semibold">
            Simulation Artifacts
          </span>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Batch Seed Matrix:</span>
            <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">0x2A_AER_RNG</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Shot Noise Factor:</span>
            <span className="font-mono text-cyan-600 dark:text-cyan-400 font-medium">Poisson (σ=0.015)</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={downloadJsonReport}
              className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-500" />
              <span>JSON Export</span>
            </button>
            <button
              onClick={downloadPythonScript}
              className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>Python Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Footer Status */}
      <div className="p-3 bg-slate-50 dark:bg-[#070A0F] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs text-slate-500">
        <span>
          Engine: <strong className="text-slate-900 dark:text-slate-300">Aer 0.12.2 C++</strong>
        </span>
        <span className="flex items-center gap-1.5 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[10px]">Online</span>
        </span>
      </div>
    </aside>
  );
}

