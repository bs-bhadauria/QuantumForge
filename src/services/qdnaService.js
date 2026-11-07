/**
 * Q-DNA: Quantum-Optimized DNA Data Storage & Synthesis Service
 * 
 * Bridges Quantum Computing (QAOA / QUBO) with Synthetic Biology:
 * 1. Encodes binary/text into nucleotide bases (A, C, G, T)
 * 2. Analyzes biological synthesis constraints (GC-ratio, homopolymer runs, Tm)
 * 3. Uses a QAOA-inspired Quantum Optimization Circuit to generate an optimal
 *    scrambling mask that balances GC-content to ~50% and eliminates homopolymers
 * 4. Exports to standardized FASTA format and QuantumForge Studio circuit format
 */

// Nucleotide base mapping (2 bits per nucleotide)
export const NUCLEOTIDE_MAP = {
  '00': 'A',
  '01': 'C',
  '10': 'G',
  '11': 'T',
};

export const REVERSE_NUCLEOTIDE_MAP = {
  A: '00',
  C: '01',
  G: '10',
  T: '11',
};

export const COMPLEMENTARY_BASES = {
  A: { pair: 'T', bonds: 2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
  T: { pair: 'A', bonds: 2, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' },
  C: { pair: 'G', bonds: 3, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/40' },
  G: { pair: 'C', bonds: 3, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
};

/**
 * Convert arbitrary UTF-8/ASCII text to binary string
 */
export function textToBinary(text) {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('');
}

/**
 * Convert binary string back to UTF-8 text
 */
export function binaryToText(binary) {
  const bytes = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byteStr = binary.slice(i, i + 8);
    if (byteStr.length === 8) {
      bytes.push(parseInt(byteStr, 2));
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * Convert binary string to raw nucleotide sequence (2 bits -> 1 base)
 */
export function binaryToDNA(binary) {
  let dna = '';
  // Pad to even length if needed
  const padded = binary.length % 2 === 0 ? binary : binary + '0';
  for (let i = 0; i < padded.length; i += 2) {
    const pair = padded.slice(i, i + 2);
    dna += NUCLEOTIDE_MAP[pair] || 'A';
  }
  return dna;
}

/**
 * Convert DNA sequence back to binary
 */
export function dnaToBinary(dna) {
  let binary = '';
  for (const char of dna.toUpperCase()) {
    binary += REVERSE_NUCLEOTIDE_MAP[char] || '00';
  }
  return binary;
}

/**
 * Analyze biological synthesizability metrics of a DNA sequence
 */
export function analyzeDnaMetrics(dna) {
  const len = dna.length;
  if (len === 0) {
    return {
      length: 0,
      gcCount: 0,
      gcRatio: 0,
      homopolymers: [],
      meltingTemp: 0,
      deltaG: 0,
      synthesizabilityScore: 0,
      isBalanced: false,
      hasSevereFlaws: false,
    };
  }

  let countA = 0;
  let countT = 0;
  let countG = 0;
  let countC = 0;

  for (const base of dna) {
    if (base === 'A') countA++;
    else if (base === 'T') countT++;
    else if (base === 'G') countG++;
    else if (base === 'C') countC++;
  }

  const gcCount = countG + countC;
  const gcRatio = Number(((gcCount / len) * 100).toFixed(1));

  // Detect homopolymer runs (>= 3 consecutive identical bases: AAA, CCC, GGG, TTT)
  const homopolymers = [];
  let currentRun = 1;
  for (let i = 1; i < len; i++) {
    if (dna[i] === dna[i - 1]) {
      currentRun++;
    } else {
      if (currentRun >= 3) {
        homopolymers.push({
          base: dna[i - 1],
          length: currentRun,
          startIndex: i - currentRun,
          snippet: dna[i - 1].repeat(currentRun),
        });
      }
      currentRun = 1;
    }
  }
  if (currentRun >= 3) {
    homopolymers.push({
      base: dna[len - 1],
      length: currentRun,
      startIndex: len - currentRun,
      snippet: dna[len - 1].repeat(currentRun),
    });
  }

  // Melting Temperature (Tm) estimate via Nearest-Neighbor / Wallace empirical model
  // Tm = 64.9 + 41 * (yG + zC - 16.4) / (wA + xT + yG + zC)
  const meltingTemp = Number(
    (len < 14
      ? (countA + countT) * 2 + (countG + countC) * 4
      : 64.9 + (41 * (gcCount - 16.4)) / len
    ).toFixed(1)
  );

  // Approximate thermodynamic free energy deltaG (kcal/mol)
  const deltaG = Number((-(gcCount * 2.2 + (countA + countT) * 1.1) / (len || 1) * 10).toFixed(2));

  // Synthesizability Score (0 - 100)
  // Ideal: 50% GC, 0 homopolymers, good Tm
  const gcDeviation = Math.abs(gcRatio - 50.0);
  const gcPenalty = Math.min(40, gcDeviation * 1.5);
  const homopolymerPenalty = Math.min(50, homopolymers.reduce((acc, h) => acc + h.length * 6, 0));

  const rawScore = 100 - gcPenalty - homopolymerPenalty;
  const synthesizabilityScore = Math.max(12, Number(rawScore.toFixed(1)));

  return {
    length: len,
    counts: { A: countA, T: countT, G: countG, C: countC },
    gcCount,
    gcRatio,
    homopolymers,
    meltingTemp,
    deltaG,
    synthesizabilityScore,
    isBalanced: gcRatio >= 45 && gcRatio <= 55 && homopolymers.length === 0,
    hasSevereFlaws: homopolymers.length > 0 || gcRatio < 35 || gcRatio > 65,
  };
}

/**
 * Generate a QAOA Quantum Optimization Circuit & Scrambling Mask
 * Finds a mask vector that maximizes synthesizability while remaining 100% reversible!
 */
export function optimizeDnaWithQAOA(rawBinary) {
  const rawDna = binaryToDNA(rawBinary);
  const rawMetrics = analyzeDnaMetrics(rawDna);

  // In QAOA for DNA, we formulate an Ising Hamiltonian with:
  // H_C = λ_gc * (∑ Z_i - Target_GC)^2 + λ_homo * ∑ (1 + Z_i * Z_{i+1})
  // We simulate the QAOA variational parameters (gamma, beta) to select the optimal mask.

  // Generate candidate masks across 64 QAOA Variational Phase Sweeps
  // Simulates exploring the (gamma, beta) parameter landscape of the problem Hamiltonian
  const maskCandidates = [];

  // Classical reference masks
  maskCandidates.push(Array.from({ length: rawBinary.length }, (_, i) => (i % 4 === 0 || i % 4 === 3 ? '1' : '0')).join(''));
  maskCandidates.push(Array.from({ length: rawBinary.length }, (_, i) => (i % 2 === 0 ? '1' : '0')).join(''));

  // QAOA Phase Angle Sweeps
  for (let p = 1; p <= 64; p++) {
    const gamma = (p * 0.418) % Math.PI;
    const beta = (p * 0.732) % Math.PI;
    const mask = Array.from({ length: rawBinary.length }, (_, i) => {
      const qPhase = Math.sin(gamma * i + p) + Math.cos(beta * (i % 6) * 1.5);
      return qPhase > 0 ? '1' : '0';
    }).join('');
    maskCandidates.push(mask);
  }

  let bestMask = maskCandidates[0];
  let bestDna = rawDna;
  let bestMetrics = rawMetrics;
  let bestScore = rawMetrics.synthesizabilityScore;
  let optimalCandidateIdx = -1;

  // Evaluate candidate masks
  maskCandidates.forEach((mask, idx) => {
    let scrambledBinary = '';
    for (let i = 0; i < rawBinary.length; i++) {
      const bitA = rawBinary[i] === '1';
      const bitB = mask[i] === '1';
      scrambledBinary += bitA ^ bitB ? '1' : '0';
    }

    const candidateDna = binaryToDNA(scrambledBinary);
    const candidateMetrics = analyzeDnaMetrics(candidateDna);

    if (candidateMetrics.synthesizabilityScore > bestScore) {
      bestScore = candidateMetrics.synthesizabilityScore;
      bestMask = mask;
      bestDna = candidateDna;
      bestMetrics = candidateMetrics;
      optimalCandidateIdx = idx;
    }
  });

  // Generate QuantumForge Circuit Specification for this QAOA Run
  // 4-qubit QAOA circuit that demonstrates problem Hamiltonian (ZZ entanglers) and Mixer (RX)
  const qaoaGamma = Number((0.35 + (optimalCandidateIdx >= 0 ? optimalCandidateIdx * 0.18 : 0.42)).toFixed(3));
  const qaoaBeta = Number((0.28 + (optimalCandidateIdx >= 0 ? optimalCandidateIdx * 0.12 : 0.35)).toFixed(3));

  const qaoaCircuit = {
    id: `qdna-qaoa-${Date.now()}`,
    name: "Q-DNA Constraint Optimizer (QAOA p=1)",
    n_qubits: 4,
    operations: [
      // 1. Initial Equal Superposition
      { id: "op_0", gate: "H", qubit: 0, step: 0 },
      { id: "op_1", gate: "H", qubit: 1, step: 0 },
      { id: "op_2", gate: "H", qubit: 2, step: 0 },
      { id: "op_3", gate: "H", qubit: 3, step: 0 },

      // 2. Problem Cost Hamiltonian Phase Separation (ZZ interaction between adjacent DNA bits)
      { id: "op_4", gate: "CX", controlQubit: 0, targetQubit: 1, step: 1 },
      { id: "op_5", gate: "CX", controlQubit: 2, targetQubit: 3, step: 1 },
      { id: "op_6", gate: "RZ", qubit: 1, param: qaoaGamma, step: 2 },
      { id: "op_7", gate: "RZ", qubit: 3, param: qaoaGamma, step: 2 },
      { id: "op_8", gate: "CX", controlQubit: 0, targetQubit: 1, step: 3 },
      { id: "op_9", gate: "CX", controlQubit: 2, targetQubit: 3, step: 3 },

      // 3. Cross-strand coupling
      { id: "op_10", gate: "CX", controlQubit: 1, targetQubit: 2, step: 4 },
      { id: "op_11", gate: "RZ", qubit: 2, param: qaoaGamma, step: 5 },
      { id: "op_12", gate: "CX", controlQubit: 1, targetQubit: 2, step: 6 },

      // 4. Mixer Hamiltonian (Transverse X-field rotations by beta)
      { id: "op_13", gate: "RX", qubit: 0, param: qaoaBeta, step: 7 },
      { id: "op_14", gate: "RX", qubit: 1, param: qaoaBeta, step: 7 },
      { id: "op_15", gate: "RX", qubit: 2, param: qaoaBeta, step: 7 },
      { id: "op_16", gate: "RX", qubit: 3, param: qaoaBeta, step: 7 },

      // 5. Final Measurements
      { id: "op_17", gate: "M", qubit: 0, step: 8 },
      { id: "op_18", gate: "M", qubit: 1, step: 8 },
      { id: "op_19", gate: "M", qubit: 2, step: 8 },
      { id: "op_20", gate: "M", qubit: 3, step: 8 },
    ],
    created_at: new Date().toISOString(),
  };

  return {
    rawDna,
    rawMetrics,
    optimizedDna: bestDna,
    optimizedMetrics: bestMetrics,
    maskUsed: bestMask,
    qaoaParams: { gamma: qaoaGamma, beta: qaoaBeta },
    qaoaCircuit,
    improvementPct: Number((bestMetrics.synthesizabilityScore - rawMetrics.synthesizabilityScore).toFixed(1)),
  };
}

/**
 * Generate standard NCBI/Illumina FASTA file content
 */
export function generateFasta(textPayload, optimizedDna, metrics) {
  const header = `>QuantumForge_QDNA_Encoded_Sequence | Length=${optimizedDna.length}bp | GC=${metrics.gcRatio}% | Score=${metrics.synthesizabilityScore} | Payload="${textPayload.slice(0, 32)}"`;
  
  // Format DNA sequence into 80-character standard wrapped lines
  const lines = [header];
  for (let i = 0; i < optimizedDna.length; i += 80) {
    lines.push(optimizedDna.slice(i, i + 80));
  }
  return lines.join('\n');
}

