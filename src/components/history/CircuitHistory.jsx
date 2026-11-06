import React, { useState, useEffect } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { api } from '../../services/api';
import { Database, Clock, Play, Trash2, BookmarkPlus, Check, Sparkles } from 'lucide-react';

export default function CircuitHistory() {
  const {
    circuitName,
    nQubits,
    operations,
    loadAlgorithm,
    setActiveView,
    simulationResult,
  } = useQuantum();

  const [savedCircuits, setSavedCircuits] = useState([]);
  const [historyRuns, setHistoryRuns] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const circuits = await api.getCircuits();
    setSavedCircuits(circuits || []);
    const history = await api.getHistory();
    setHistoryRuns(history || []);
  };

  const handleSaveActive = async () => {
    const newCircuit = {
      name: circuitName,
      n_qubits: nQubits,
      operations,
      depth: simulationResult?.resources?.depth || 1,
      fidelity: simulationResult?.resources?.fidelity || '99.8%',
      description: 'Saved from active composer workbench.',
    };
    await api.saveCircuit(newCircuit);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    loadData();
  };

  const handleReload = (circuit) => {
    loadAlgorithm({
      title: circuit.name,
      n_qubits: circuit.n_qubits,
      operations: circuit.operations,
    });
    setActiveView('composer');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
            <Database className="w-4 h-4" />
            <span>SQLite Embedded Database Storage</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Saved Circuits & Execution History
          </h1>
        </div>

        <button
          onClick={handleSaveActive}
          className="px-4 py-2 rounded-xl bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold shadow-[0_0_14px_rgba(0,240,255,0.3)] transition-all flex items-center gap-2 active:scale-95"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-emerald-900" /> : <BookmarkPlus className="w-4 h-4" />}
          <span>{saveSuccess ? 'Saved to Database!' : 'Save Current Circuit'}</span>
        </button>
      </div>

      {/* 2-Column Split: Saved Circuits vs Recent Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Circuits */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Saved Circuits ({savedCircuits.length})</span>
            </span>
          </div>

          {savedCircuits.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-slate-400">
              No saved circuits in database yet. Click "Save Current Circuit" to persist your workbench state.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {savedCircuits.map((circ) => (
                <div
                  key={circ.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {circ.name}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {circ.n_qubits} Qubits · {circ.operations?.length || 0} Gates · {circ.created_at ? new Date(circ.created_at).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleReload(circ)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-display text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Load</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Simulation Runs */}
        <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-500" />
              <span>Execution Telemetry Runs ({historyRuns.length})</span>
            </span>
          </div>

          {historyRuns.length === 0 ? (
            <div className="text-center py-10 text-xs font-mono text-slate-400">
              No runs recorded yet. Click "Simulate" in the composer to capture live execution telemetry.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto">
              {historyRuns.map((run, i) => (
                <div
                  key={run.id || i}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 dark:text-white font-display text-xs">
                      {run.name}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {run.qubits}Q · {run.shots} shots · seed={run.seed} · {run.runtimeMs}ms
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                    {run.fidelity || '99.82%'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

