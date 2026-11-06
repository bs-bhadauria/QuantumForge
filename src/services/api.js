import { simulateQuantumCircuit, generateOpenQASM } from './quantumEngine';
import { INITIAL_ALGORITHMS } from '../types/quantum';

const API_BASE = '/api';

export const api = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'mock', service: 'QuantumForge In-Browser Engine', engine: 'Local WebGL/C++ WASM' };
    }
  },

  // Simulate circuit
  async simulate(nQubits, operations, shots = 4096, seed = 42) {
    try {
      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_qubits: nQubits, operations, shots, seed }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to client-side engine
    }
    return simulateQuantumCircuit(nQubits, operations, shots, seed);
  },

  // Get algorithm catalog
  async getAlgorithms() {
    try {
      const res = await fetch(`${API_BASE}/algorithms`);
      if (res.ok) {
        const data = await res.json();
        return data.algorithms || INITIAL_ALGORITHMS;
      }
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_custom_algorithms');
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...INITIAL_ALGORITHMS, ...custom];
      } catch {
        // ignore
      }
    }
    return INITIAL_ALGORITHMS;
  },

  // Save new algorithm ansatz
  async submitAlgorithm(algo) {
    try {
      const res = await fetch(`${API_BASE}/algorithms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(algo),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_custom_algorithms') || '[]';
    const list = JSON.parse(saved);
    list.push(algo);
    localStorage.setItem('quantumforge_custom_algorithms', JSON.stringify(list));
    return algo;
  },

  // Get saved circuits
  async getCircuits() {
    try {
      const res = await fetch(`${API_BASE}/circuits`);
      if (res.ok) {
        const data = await res.json();
        return data.circuits;
      }
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_saved_circuits') || '[]';
    return JSON.parse(saved);
  },

  // Save circuit
  async saveCircuit(circuit) {
    try {
      const res = await fetch(`${API_BASE}/circuits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circuit),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_saved_circuits') || '[]';
    const list = JSON.parse(saved);
    const newCircuit = {
      ...circuit,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    list.unshift(newCircuit);
    localStorage.setItem('quantumforge_saved_circuits', JSON.stringify(list));
    return newCircuit;
  },

  // Get simulation history
  async getHistory() {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        return data.history;
      }
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_sim_history') || '[]';
    return JSON.parse(saved);
  },

  // Log simulation to history
  async logSimulation(entry) {
    try {
      await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem('quantumforge_sim_history') || '[]';
    const list = JSON.parse(saved);
    list.unshift({ ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() });
    if (list.length > 50) list.pop();
    localStorage.setItem('quantumforge_sim_history', JSON.stringify(list));
  },
};

