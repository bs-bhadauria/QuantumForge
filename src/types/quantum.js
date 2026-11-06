export const GATE_DEFINITIONS = {
  // Single-Qubit Unitaries
  H: { name: 'H', type: 'unitary', label: 'H', color: 'cyan', description: 'Hadamard: Creates equal superposition (|0⟩+|1⟩)/√2' },
  X: { name: 'X', type: 'unitary', label: 'X', color: 'slate', description: 'Pauli-X: Quantum NOT bit-flip (|0⟩↔|1⟩)' },
  Y: { name: 'Y', type: 'unitary', label: 'Y', color: 'slate', description: 'Pauli-Y: Bit and phase flip' },
  Z: { name: 'Z', type: 'unitary', label: 'Z', color: 'slate', description: 'Pauli-Z: Phase flip (|1⟩ → -|1⟩)' },
  S: { name: 'S', type: 'unitary', label: 'S', color: 'purple', description: 'Phase S: π/2 rotation about Z-axis' },
  T: { name: 'T', type: 'unitary', label: 'T', color: 'purple', description: 'T-Gate: π/8 phase gate' },

  // Parameterized Rotations
  Rx: { name: 'Rx', type: 'rotation', label: 'Rx(θ)', color: 'violet', defaultParam: 1.571, description: 'Rotation Rx(θ): e^{-i(θ/2)X}' },
  Ry: { name: 'Ry', type: 'rotation', label: 'Ry(θ)', color: 'violet', defaultParam: 0.785, description: 'Rotation Ry(θ): e^{-i(θ/2)Y}' },
  Rz: { name: 'Rz', type: 'rotation', label: 'Rz(θ)', color: 'violet', defaultParam: 1.571, description: 'Rotation Rz(θ): e^{-i(θ/2)Z}' },
  U3: { name: 'U3', type: 'rotation', label: 'U3', color: 'violet', defaultParam: 0.785, description: 'Arbitrary single-qubit unitary U3(θ, φ, λ)' },

  // Entanglers
  CX: { name: 'CX', type: 'entangler', label: 'CX', color: 'amber', description: 'Controlled-NOT (CNOT): Flips target if control is |1⟩' },
  CZ: { name: 'CZ', type: 'entangler', label: 'CZ', color: 'amber', description: 'Controlled-Z: Phase flip if both qubits are |1⟩' },
  SWAP: { name: 'SWAP', type: 'entangler', label: 'SWAP', color: 'amber', description: 'Swap Gate: Exchanges quantum states of two qubits' },
  CCX: { name: 'CCX', type: 'entangler', label: 'CCX', color: 'amber', description: 'Toffoli (CCNOT): Controlled-controlled-NOT' },

  // Measurement & Barrier
  M: { name: 'M', type: 'measure', label: 'M', color: 'pink', description: 'Z-basis Projective Measurement: Collapses to classical register' },
  Barrier: { name: 'Barrier', type: 'barrier', label: '|', color: 'slate', description: 'Hardware Barrier: Prevents compiler gate reordering' },
};

export const INITIAL_ALGORITHMS = [
  {
    id: 'bell',
    title: 'Bell State (|Φ⁺⟩ & |Ψ⁻⟩)',
    category: 'foundations',
    categoryLabel: 'Foundations · Standard EPR Pair',
    description: 'Maximally entangled two-qubit EPR state. Fundamental resource for quantum teleportation, superdense coding, and Bell-inequality violation tests.',
    n_qubits: 2,
    depth: 2,
    qubits: 2,
    fidelity: '99.98%',
    recommendedShots: 4096,
    math: '|Φ⁺⟩ = 1/√2 (|00⟩ + |11⟩)',
    entropy: '1.00',
    chsh: 'S = 2√2 ≈ 2.828',
    idealDistribution: [
      { state: '|00⟩', prob: 50.0, color: 'sky' },
      { state: '|01⟩', prob: 0.0, color: 'slate' },
      { state: '|10⟩', prob: 0.0, color: 'slate' },
      { state: '|11⟩', prob: 50.0, color: 'violet' }
    ],
    operations: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 1 },
      { gate: 'M', qubit: 0, step: 2 },
      { gate: 'M', qubit: 1, step: 2 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[2] q;\nbit[2] c;\n\nh q[0];\ncx q[0], q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];`
  },
  {
    id: 'ghz',
    title: 'Greenberger–Horne–Zeilinger (GHZ)',
    category: 'foundations',
    categoryLabel: 'Foundations · 3-Qubit Entanglement',
    description: 'Tripartite entangled quantum superposition demonstrating multi-particle quantum nonlocality without inequalities.',
    n_qubits: 3,
    depth: 3,
    qubits: 3,
    fidelity: '99.94%',
    recommendedShots: 4096,
    math: '|GHZ⟩ = 1/√2 (|000⟩ + |111⟩)',
    entropy: '1.00',
    chsh: 'Multi-party Mermin M3 = 4',
    idealDistribution: [
      { state: '|000⟩', prob: 50.0, color: 'sky' },
      { state: '|111⟩', prob: 50.0, color: 'violet' }
    ],
    operations: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 1 },
      { gate: 'CX', controlQubit: 1, targetQubit: 2, step: 2 },
      { gate: 'M', qubit: 0, step: 3 },
      { gate: 'M', qubit: 1, step: 3 },
      { gate: 'M', qubit: 2, step: 3 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[3] c;\n\nh q[0];\ncx q[0], q[1];\ncx q[1], q[2];\nc = measure q;`
  },
  {
    id: 'teleportation',
    title: 'Quantum Teleportation Protocol',
    category: 'communication',
    categoryLabel: 'Communication · State Transfer',
    description: 'Transfers unknown quantum state of Q0 to Q2 using pre-shared EPR entanglement (Q1-Q2) and classical message channels.',
    n_qubits: 3,
    depth: 5,
    qubits: 3,
    fidelity: '99.91%',
    recommendedShots: 4096,
    math: '|ψ⟩ ⊗ |Φ⁺⟩ → (|00⟩|ψ⟩ + |01⟩X|ψ⟩ + |10⟩Z|ψ⟩ + |11⟩ZX|ψ⟩)/2',
    entropy: '0.98',
    chsh: 'Fidelity = 1.00 (noiseless)',
    idealDistribution: [
      { state: '|000⟩', prob: 25.0, color: 'sky' },
      { state: '|010⟩', prob: 25.0, color: 'sky' },
      { state: '|100⟩', prob: 25.0, color: 'violet' },
      { state: '|110⟩', prob: 25.0, color: 'violet' }
    ],
    operations: [
      { gate: 'Ry', qubit: 0, step: 0, param: 1.047 },
      { gate: 'H', qubit: 1, step: 0 },
      { gate: 'CX', controlQubit: 1, targetQubit: 2, step: 1 },
      { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 2 },
      { gate: 'H', qubit: 0, step: 3 },
      { gate: 'M', qubit: 0, step: 4 },
      { gate: 'M', qubit: 1, step: 4 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[2] c;\n\nry(1.047) q[0];\nh q[1];\ncx q[1], q[2];\ncx q[0], q[1];\nh q[0];\nc[0] = measure q[0];\nc[1] = measure q[1];`
  },
  {
    id: 'grover',
    title: "Grover's 2-Qubit Search",
    category: 'search',
    categoryLabel: 'Search & Cryptography · Amplitude Amplification',
    description: 'Quadratic speedup search finding an unstructured database target (|11⟩) in O(√N) oracle queries.',
    n_qubits: 2,
    depth: 6,
    qubits: 2,
    fidelity: '99.95%',
    recommendedShots: 4096,
    math: 'G = -H^⊗2 (I - 2|00⟩⟨00|) H^⊗2 · U_w',
    entropy: '0.00',
    chsh: 'Success P(|11⟩) = 100%',
    idealDistribution: [
      { state: '|00⟩', prob: 0.0, color: 'slate' },
      { state: '|01⟩', prob: 0.0, color: 'slate' },
      { state: '|10⟩', prob: 0.0, color: 'slate' },
      { state: '|11⟩', prob: 100.0, color: 'emerald' }
    ],
    operations: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'H', qubit: 1, step: 0 },
      { gate: 'CZ', controlQubit: 0, targetQubit: 1, step: 1 },
      { gate: 'H', qubit: 0, step: 2 },
      { gate: 'H', qubit: 1, step: 2 },
      { gate: 'X', qubit: 0, step: 3 },
      { gate: 'X', qubit: 1, step: 3 },
      { gate: 'CZ', controlQubit: 0, targetQubit: 1, step: 4 },
      { gate: 'X', qubit: 0, step: 5 },
      { gate: 'X', qubit: 1, step: 5 },
      { gate: 'H', qubit: 0, step: 6 },
      { gate: 'H', qubit: 1, step: 6 },
      { gate: 'M', qubit: 0, step: 7 },
      { gate: 'M', qubit: 1, step: 7 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[2] q;\nbit[2] c;\n\nh q[0]; h q[1];\ncz q[0], q[1];\nh q[0]; h q[1];\nx q[0]; x q[1];\ncz q[0], q[1];\nx q[0]; x q[1];\nh q[0]; h q[1];\nc = measure q;`
  },
  {
    id: 'deutsch',
    title: 'Deutsch-Jozsa Algorithm',
    category: 'foundations',
    categoryLabel: 'Foundations · Oracle Query',
    description: 'Deterministic separation between constant and balanced Boolean functions in a single quantum evaluation.',
    n_qubits: 3,
    depth: 4,
    qubits: 3,
    fidelity: '99.97%',
    recommendedShots: 4096,
    math: '|ψ_final⟩ = ∑_x (-1)^(f(x)) |x⟩',
    entropy: '0.00',
    chsh: 'Exact deterministic query',
    idealDistribution: [
      { state: '|110⟩', prob: 100.0, color: 'sky' }
    ],
    operations: [
      { gate: 'X', qubit: 2, step: 0 },
      { gate: 'H', qubit: 0, step: 1 },
      { gate: 'H', qubit: 1, step: 1 },
      { gate: 'H', qubit: 2, step: 1 },
      { gate: 'CX', controlQubit: 0, targetQubit: 2, step: 2 },
      { gate: 'CX', controlQubit: 1, targetQubit: 2, step: 3 },
      { gate: 'H', qubit: 0, step: 4 },
      { gate: 'H', qubit: 1, step: 4 },
      { gate: 'M', qubit: 0, step: 5 },
      { gate: 'M', qubit: 1, step: 5 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[2] c;\n\nx q[2];\nh q[0]; h q[1]; h q[2];\ncx q[0], q[2];\ncx q[1], q[2];\nh q[0]; h q[1];\nc[0] = measure q[0];\nc[1] = measure q[1];`
  },
  {
    id: 'vqe',
    title: 'VQE: Molecular Hydrogen (H₂)',
    category: 'chemistry',
    categoryLabel: 'Chemistry · Variational Eigensolver',
    description: 'Hardware-efficient ansatz parameterized for ground-state electronic energy calculation of H₂ at equilibrium distance R=0.735Å.',
    n_qubits: 2,
    depth: 4,
    qubits: 2,
    fidelity: '99.92%',
    recommendedShots: 4096,
    math: '⟨H⟩(θ) = ⟨0|U†(θ) H U(θ)|0⟩ ≥ E_ground = -1.137 Hartree',
    entropy: '0.85',
    chsh: 'VQE Ground Convergence ΔE < 1e-4',
    idealDistribution: [
      { state: '|01⟩', prob: 88.5, color: 'sky' },
      { state: '|10⟩', prob: 11.5, color: 'violet' }
    ],
    operations: [
      { gate: 'X', qubit: 0, step: 0 },
      { gate: 'Ry', qubit: 1, step: 1, param: 0.785 },
      { gate: 'CX', controlQubit: 1, targetQubit: 0, step: 2 },
      { gate: 'M', qubit: 0, step: 3 },
      { gate: 'M', qubit: 1, step: 3 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[2] q;\nbit[2] c;\n\nx q[0];\nry(0.785) q[1];\ncx q[1], q[0];\nc = measure q;`
  },
  {
    id: 'qaoa',
    title: 'QAOA: Max-Cut Graph Partitioning',
    category: 'optimization',
    categoryLabel: 'Optimization · Adiabatic Mapping',
    description: 'Quantum Approximate Optimization Algorithm mapping combinatorial graph partitioning to transverse Ising Hamiltonian dynamics.',
    n_qubits: 4,
    depth: 6,
    qubits: 4,
    fidelity: '99.88%',
    recommendedShots: 8192,
    math: '|γ, β⟩ = e^{-i β H_B} e^{-i γ H_C} |+⟩^⊗4',
    entropy: '1.24',
    chsh: 'Approximation Ratio α > 0.82',
    idealDistribution: [
      { state: '|0101⟩', prob: 42.0, color: 'emerald' },
      { state: '|1010⟩', prob: 42.0, color: 'emerald' },
      { state: '|0011⟩', prob: 8.0, color: 'slate' },
      { state: '|1100⟩', prob: 8.0, color: 'slate' }
    ],
    operations: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'H', qubit: 1, step: 0 },
      { gate: 'H', qubit: 2, step: 0 },
      { gate: 'H', qubit: 3, step: 0 },
      { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 1 },
      { gate: 'Rz', qubit: 1, step: 2, param: 1.05 },
      { gate: 'CX', controlQubit: 0, targetQubit: 1, step: 3 },
      { gate: 'Rx', qubit: 0, step: 4, param: 0.62 },
      { gate: 'Rx', qubit: 1, step: 4, param: 0.62 },
      { gate: 'M', qubit: 0, step: 5 },
      { gate: 'M', qubit: 1, step: 5 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[4] q;\nbit[4] c;\n\nh q;\ncx q[0], q[1];\nrz(1.05) q[1];\ncx q[0], q[1];\nrx(0.62) q;\nc = measure q;`
  },
  {
    id: 'qft',
    title: 'Quantum Fourier Transform (QFT 3Q)',
    category: 'search',
    categoryLabel: 'Search & Cryptography · Phase Estimation',
    description: 'Transforms basis states |j⟩ to frequency domain superpositions. Key submodule in Shor factoring and phase estimation.',
    n_qubits: 3,
    depth: 7,
    qubits: 3,
    fidelity: '99.90%',
    recommendedShots: 4096,
    math: '|j⟩ → 1/√N ∑_{k=0}^{N-1} e^{2πi jk/N} |k⟩',
    entropy: '1.58',
    chsh: 'O(n²) unitary depth',
    idealDistribution: [
      { state: '|000⟩', prob: 12.5, color: 'sky' },
      { state: '|001⟩', prob: 12.5, color: 'sky' },
      { state: '|010⟩', prob: 12.5, color: 'sky' },
      { state: '|011⟩', prob: 12.5, color: 'sky' },
      { state: '|100⟩', prob: 12.5, color: 'violet' },
      { state: '|101⟩', prob: 12.5, color: 'violet' },
      { state: '|110⟩', prob: 12.5, color: 'violet' },
      { state: '|111⟩', prob: 12.5, color: 'violet' }
    ],
    operations: [
      { gate: 'H', qubit: 0, step: 0 },
      { gate: 'S', qubit: 0, step: 1 },
      { gate: 'H', qubit: 1, step: 2 },
      { gate: 'T', qubit: 1, step: 3 },
      { gate: 'H', qubit: 2, step: 4 },
      { gate: 'SWAP', controlQubit: 0, targetQubit: 2, step: 5 },
      { gate: 'M', qubit: 0, step: 6 },
      { gate: 'M', qubit: 1, step: 6 },
      { gate: 'M', qubit: 2, step: 6 }
    ],
    qasm: `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[3] q;\nbit[3] c;\n\nh q[0];\ns q[0];\nh q[1];\nt q[1];\nh q[2];\nswap q[0], q[2];\nc = measure q;`
  }
];

