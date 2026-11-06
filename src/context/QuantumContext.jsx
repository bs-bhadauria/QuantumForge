import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { simulateQuantumCircuit, generateOpenQASM } from '../services/quantumEngine';
import { INITIAL_ALGORITHMS } from '../types/quantum';
import { api } from '../services/api';

const QuantumContext = createContext(null);

export function QuantumProvider({ children }) {
  // Theme state: dark / light
  const [theme, setTheme] = useState(() => localStorage.getItem('quantumforge_theme') || 'dark');

  // Navigation view
  const [activeView, setActiveView] = useState('landing'); // 'landing' | 'composer' | 'marketplace' | 'benchmarks' | 'docs' | 'history'

  // Circuit metadata
  const [circuitName, setCircuitName] = useState('Untitled 3-Qubit Circuit [Bell State + Ancilla]');
  const [nQubits, setNQubits] = useState(3);
  const [shots, setShots] = useState(4096);
  const [seed, setSeed] = useState(42);

  // Active operations in circuit
  // Initial state: Bell state on q0, q1 + Ry rotation
  const [operations, setOperations] = useState([
    { gate: 'H', qubit: 0, step: 0 },
    { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 2 },
    { gate: 'X', qubit: 1, step: 3 },
    { gate: 'Ry', qubit: 0, step: 4, param: 0.785 },
    { gate: 'M', qubit: 0, step: 6 },
    { gate: 'M', qubit: 1, step: 6 },
  ]);

  // Undo / Redo history stacks
  const historyRef = useRef([]);
  const futureRef = useRef([]);

  // Active parameter popover
  const [activeParamGate, setActiveParamGate] = useState({
    gate: 'Ry',
    qubit: 0,
    step: 4,
    param: 0.785,
  });
  const [popoverVisible, setPopoverVisible] = useState(false);

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Drawers and Tabs
  const [qasmDrawerOpen, setQasmDrawerOpen] = useState(false);
  const [telemetryTab, setTelemetryTab] = useState('prob'); // 'prob' | 'qasm' | 'bloch'
  const [histogramMode, setHistogramMode] = useState('prob'); // 'prob' | 'counts'

  // Sidebar Resizable & Collapsible State
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('quantumforge_sidebar_width');
    return saved ? Math.max(180, Math.min(460, Number(saved))) : 260;
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('quantumforge_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('quantumforge_sidebar_collapsed', String(next));
      return next;
    });
  }, []);

  const updateSidebarWidth = useCallback((newWidth) => {
    if (newWidth < 130) {
      // Dragging very small converts into hamburger / collapsed state
      setIsSidebarCollapsed(true);
      localStorage.setItem('quantumforge_sidebar_collapsed', 'true');
    } else {
      const clamped = Math.max(180, Math.min(460, newWidth));
      setSidebarWidth(clamped);
      setIsSidebarCollapsed(false);
      localStorage.setItem('quantumforge_sidebar_width', String(clamped));
      localStorage.setItem('quantumforge_sidebar_collapsed', 'false');
    }
  }, []);

  // Backend Health
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', service: 'Qiskit Aer Engine' });

  // Update theme class on HTML element
  useEffect(() => {
    localStorage.setItem('quantumforge_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initial backend check and simulation
  useEffect(() => {
    api.checkHealth().then((res) => setBackendStatus(res));
  }, []);

  // Run simulation whenever circuit, shots or seed changes
  const runSimulation = useCallback(async () => {
    setIsSimulating(true);

    try {
      // Simulate locally or via backend
      const result = await api.simulate(nQubits, operations, shots, seed);
      setSimulationResult(result);

      // Log to history
      api.logSimulation({
        name: circuitName,
        qubits: nQubits,
        shots,
        seed,
        depth: result.resources?.depth || 1,
        fidelity: result.resources?.fidelity || '99.8%',
        runtimeMs: result.resources?.runtimeMs || 12,
        counts: result.counts,
      });
    } catch (e) {
      console.error('Simulation error', e);
      // Fallback local
      const res = simulateQuantumCircuit(nQubits, operations, shots, seed);
      setSimulationResult(res);
    } finally {
      setTimeout(() => setIsSimulating(false), 900);
    }
  }, [nQubits, operations, shots, seed, circuitName]);

  // Initial simulation run on mount
  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  // Push state to undo stack
  const recordHistory = useCallback((newOps) => {
    historyRef.current.push([...operations]);
    if (historyRef.current.length > 30) historyRef.current.shift();
    futureRef.current = [];
    setOperations(newOps);
  }, [operations]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    futureRef.current.push([...operations]);
    setOperations(prev);
  }, [operations]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop();
    historyRef.current.push([...operations]);
    setOperations(next);
  }, [operations]);

  // Helper to extract all qubits involved in an operation
  const getOpQubits = (op) => {
    const list = [];
    if (op.qubit !== undefined) list.push(op.qubit);
    if (op.controlQubit !== undefined) list.push(op.controlQubit);
    if (op.controlQubit2 !== undefined) list.push(op.controlQubit2);
    if (op.targetQubit !== undefined) list.push(op.targetQubit);
    if (Array.isArray(op.controls)) list.push(...op.controls);
    return list;
  };

  // Gate manipulation
  const addGate = useCallback((gateData) => {
    const incomingQubits = getOpQubits(gateData);
    // Remove any previous gate whose occupied qubits overlap with incomingQubits at this step
    const filtered = operations.filter((op) => {
      if (op.step !== gateData.step) return true;
      const existingQubits = getOpQubits(op);
      return !existingQubits.some((q) => incomingQubits.includes(q));
    });
    recordHistory([...filtered, gateData]);
  }, [operations, recordHistory]);

  const removeGate = useCallback((qubit, step) => {
    const next = operations.filter((op) => {
      if (op.step !== step) return true;
      const existingQubits = getOpQubits(op);
      return !existingQubits.includes(qubit);
    });
    recordHistory(next);
  }, [operations, recordHistory]);

  const updateEntanglerTarget = useCallback((controlQubit, step, newTargetQubit) => {
    const next = operations.map((op) => {
      if (op.step === step && op.controlQubit === controlQubit) {
        return { ...op, targetQubit: newTargetQubit };
      }
      return op;
    });
    recordHistory(next);
  }, [operations, recordHistory]);

  const updateGateParam = useCallback((qubit, step, param) => {
    const next = operations.map((op) => {
      if (op.step === step && op.qubit === qubit) {
        return { ...op, param: Number(param) };
      }
      return op;
    });
    setOperations(next);
    setActiveParamGate((prev) => (prev ? { ...prev, param: Number(param) } : prev));
  }, [operations]);

  const clearCircuit = useCallback(() => {
    recordHistory([]);
  }, [recordHistory]);

  const loadAlgorithm = useCallback((algo) => {
    setCircuitName(algo.title);
    setNQubits(algo.n_qubits);
    if (algo.recommendedShots) setShots(algo.recommendedShots);
    recordHistory(algo.operations || []);
    setActiveView('composer');
  }, [recordHistory]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const openQasmCode = generateOpenQASM(nQubits, operations);

  return (
    <QuantumContext.Provider
      value={{
        theme,
        toggleTheme,
        activeView,
        setActiveView,
        circuitName,
        setCircuitName,
        nQubits,
        setNQubits,
        shots,
        setShots,
        seed,
        setSeed,
        operations,
        addGate,
        removeGate,
        updateEntanglerTarget,
        updateGateParam,
        clearCircuit,
        loadAlgorithm,
        activeParamGate,
        setActiveParamGate,
        popoverVisible,
        setPopoverVisible,
        isSimulating,
        runSimulation,
        simulationResult,
        qasmDrawerOpen,
        setQasmDrawerOpen,
        telemetryTab,
        setTelemetryTab,
        histogramMode,
        setHistogramMode,
        openQasmCode,
        backendStatus,
        undo,
        redo,
        sidebarWidth,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        updateSidebarWidth,
      }}
    >
      {children}
    </QuantumContext.Provider>
  );
}

export function useQuantum() {
  const context = useContext(QuantumContext);
  if (!context) {
    throw new Error('useQuantum must be used within a QuantumProvider');
  }
  return context;
}

