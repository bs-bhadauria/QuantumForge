import React, { useState, useMemo } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { INITIAL_ALGORITHMS } from '../../types/quantum';
import AlgorithmCard from './AlgorithmCard';
import AlgorithmModal from './AlgorithmModal';
import { Search, Sparkles, Filter, FlaskConical, ArrowRight, CheckCircle2, SlidersHorizontal, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { ImageTrail } from '../ui/ImageTrail';
import { BorderBeam } from '../ui/BorderBeam';

export default function AlgorithmMarketplace() {
  const { setActiveView } = useQuantum();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [inspectAlgo, setInspectAlgo] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [trailEnabled, setTrailEnabled] = useState(true);
  const [ansatzForm, setAnsatzForm] = useState({
    title: '',
    category: 'chemistry',
    description: '',
    n_qubits: 2,
    math: '',
  });

  const categories = [
    { id: 'all', label: 'All (18)' },
    { id: 'foundations', label: 'Foundations (5)' },
    { id: 'communication', label: 'Communication (3)' },
    { id: 'search', label: 'Search & Crypto (3)' },
    { id: 'chemistry', label: 'Chemistry & VQE (4)' },
    { id: 'optimization', label: 'QAOA / Opt (3)' },
  ];

  const filteredAlgorithms = useMemo(() => {
    return INITIAL_ALGORITHMS.filter((algo) => {
      const matchesCat = selectedCategory === 'all' || algo.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        algo.title.toLowerCase().includes(term) ||
        algo.description.toLowerCase().includes(term) ||
        algo.math.toLowerCase().includes(term);
      return matchesCat && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'depth') return a.depth - b.depth;
      if (sortBy === 'qubits') return a.n_qubits - b.n_qubits;
      return 0; // Default
    });
  }, [selectedCategory, searchTerm, sortBy]);

  const handleCreateAnsatz = async (e) => {
    e.preventDefault();
    const newAlgo = {
      id: `custom-${Date.now()}`,
      title: ansatzForm.title || 'Custom Variational Ansatz',
      category: ansatzForm.category,
      categoryLabel: `${ansatzForm.category} · User Submitted`,
      description: ansatzForm.description || 'Custom institutional user-contributed circuit.',
      n_qubits: Number(ansatzForm.n_qubits),
      depth: 4,
      fidelity: '99.90%',
      recommendedShots: 4096,
      math: ansatzForm.math || '|ψ(θ)⟩ = U(θ)|0⟩',
      entropy: '0.90',
      chsh: 'S = 2.0',
      idealDistribution: [
        { state: '|00⟩', prob: 50.0, color: 'sky' },
        { state: '|11⟩', prob: 50.0, color: 'violet' },
      ],
      operations: [
        { gate: 'H', qubit: 0, step: 0 },
        { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 1 },
        { gate: 'M', qubit: 0, step: 2 },
        { gate: 'M', qubit: 1, step: 2 },
      ],
      qasm: `OPENQASM 3.0;\nqubit[${ansatzForm.n_qubits}] q;\nh q[0];\ncx q[0], q[1];`,
    };

    await api.submitAlgorithm(newAlgo);
    INITIAL_ALGORITHMS.push(newAlgo);
    setShowSubmitModal(false);
  };

  return (
    <ImageTrail
      disabled={!trailEnabled}
      threshold={65}
      duration={950}
      maxItems={7}
      rotationRange={35}
      className="relative w-full max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-8 select-none min-h-screen"
    >
      {/* Soft atmospheric background glow */}
      <div className="absolute -top-12 left-1/4 w-[500px] h-[350px] bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Top Banner & Editorial Hero Header */}
      <section className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)] animate-pulse" />
            <span>Repository Manifest / v3.4.12-Prod</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Vengeance UI Image Trail Toggle Pill */}
            <button
              onClick={() => setTrailEnabled(!trailEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                trailEnabled
                  ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-600 dark:text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title="Click to toggle Vengeance UI Image Trail on cursor movement"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Quantum Trail: {trailEnabled ? 'ACTIVE' : 'OFF'}</span>
            </button>
            <span className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs shadow-2xs font-medium">
              Compiler: LLVM / QIR Native
            </span>
            <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-xs font-medium">
              AER Simulator Fidelity: 99.98%
            </span>
          </div>
        </div>

        <div className="max-w-4xl flex flex-col gap-2">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Curated Quantum Algorithm Library & Ansatz Repository
          </h1>
          <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Production-verified circuit templates spanning fundamental quantum mechanics, oracle searches, variational eigensolvers (VQE), and NISQ optimization.
          </p>
        </div>

        {/* Live Metric Chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-900 dark:text-white">18 Verified Templates</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs shadow-xs">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">OpenQASM 3.0 Compatible</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Qiskit Aer C++ Tested</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-500 ml-auto">
            <span>Target Architecture: Superconducting Transmon & Trapped-Ion</span>
          </div>
        </div>
      </section>

      {/* Search, Filter Pills & Sort Bar */}
      <section className="bg-white dark:bg-[#0F172A] p-4 lg:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, gate depth, or unitary..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00F0FF] text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-slate-400 uppercase font-semibold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 dark:bg-[#070A0F] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-mono text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="popular">Popularity / Citations</option>
            <option value="depth">Complexity (Depth)</option>
            <option value="qubits">Qubit Count</option>
          </select>
        </div>
      </section>

      {/* Grid of Algorithm Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAlgorithms.map((algo) => (
          <AlgorithmCard
            key={algo.id}
            algo={algo}
            onInspect={(selected) => setInspectAlgo(selected)}
          />
        ))}
      </section>

      {/* Enterprise & Academic Contribution Callout Banner */}
      <section className="relative overflow-hidden rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent dark:from-cyan-950/30 dark:via-indigo-950/20 dark:to-transparent shadow-sm">
        <BorderBeam size={240} duration={14} borderWidth={1.5} colorFrom="#00f2fe" colorTo="#cdbdff" />
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-mono text-xs text-cyan-700 dark:text-cyan-400 uppercase tracking-wider font-bold">
              Enterprise & Academic Contribution
            </span>
          </div>
          <h4 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Need custom topological or error-mitigated circuit templates?
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Compile novel Clifford+T decompositions, transpile hardware pulse schedules, or submit an institutional ansatz to the verified registry.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-display text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-cyan-500" />
            <span>Submit Ansatz</span>
          </button>
          <button
            onClick={() => setActiveView('docs')}
            className="px-5 py-2.5 rounded-xl bg-[#00F0FF] hover:bg-cyan-400 text-slate-950 font-display text-xs font-bold shadow-[0_0_14px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5"
          >
            <span>Ansatz Specification →</span>
          </button>
        </div>
      </section>

      {/* Flyout Modal Preview */}
      {inspectAlgo && (
        <AlgorithmModal
          algo={inspectAlgo}
          onClose={() => setInspectAlgo(null)}
        />
      )}

      {/* Submit Custom Ansatz Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Submit Custom Algorithm Ansatz
            </h3>
            <form onSubmit={handleCreateAnsatz} className="flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-500 mb-1 block">Algorithm Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Quantum Phase Estimation (3Q)"
                  value={ansatzForm.title}
                  onChange={(e) => setAnsatzForm({ ...ansatzForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 mb-1 block">Category</label>
                  <select
                    value={ansatzForm.category}
                    onChange={(e) => setAnsatzForm({ ...ansatzForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="foundations">Foundations</option>
                    <option value="communication">Communication</option>
                    <option value="search">Search & Crypto</option>
                    <option value="chemistry">Chemistry & VQE</option>
                    <option value="optimization">QAOA / Opt</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 mb-1 block">Qubit Count</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={ansatzForm.n_qubits}
                    onChange={(e) => setAnsatzForm({ ...ansatzForm, n_qubits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Dirac Mathematical Formulation</label>
                <input
                  type="text"
                  placeholder="|ψ⟩ = α|0⟩ + β|1⟩"
                  value={ansatzForm.math}
                  onChange={(e) => setAnsatzForm({ ...ansatzForm, math: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-500 mb-1 block">Description</label>
                <textarea
                  rows="3"
                  placeholder="Operational details, Hamiltonian targets, and citation..."
                  value={ansatzForm.description}
                  onChange={(e) => setAnsatzForm({ ...ansatzForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00F0FF] text-slate-950 font-bold"
                >
                  Save to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ImageTrail>
  );
}

