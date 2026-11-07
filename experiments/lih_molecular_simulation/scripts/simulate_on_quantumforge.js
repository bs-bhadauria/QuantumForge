/**
 * QuantumForge Studio Engine Simulation of LiH VQE Circuit
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { simulateQuantumCircuit } from '../../../src/services/quantumEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const circuitPath = path.join(__dirname, '..', 'data', 'lih_circuit.json');
const circuitData = JSON.parse(fs.readFileSync(circuitPath, 'utf8'));

// Run simulation with 4,096 shots
const result = simulateQuantumCircuit(circuitData.n_qubits, circuitData.operations, 4096, 42);

// Save results
const outPath = path.join(__dirname, '..', 'data', 'simulation_results.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

console.log('=== QuantumForge Studio Simulation Output for LiH Ground State ===');
console.log(`- Qubits: ${result.resources.qubits}`);
console.log(`- Gate Count: ${result.resources.gateCount}`);
console.log(`- Circuit Depth: ${result.resources.depth}`);
console.log(`- Fidelity: ${result.resources.fidelity}`);
console.log(`- Runtime: ${result.resources.runtimeMs} ms`);
console.log('\nTop Measured Basis States:');
const sortedStates = Object.entries(result.counts).sort((a, b) => b[1] - a[1]);
for (const [state, count] of sortedStates.slice(0, 6)) {
  const prob = (result.probabilities[state] * 100).toFixed(2);
  console.log(`  |${state}⟩: ${count} shots (${prob}%)`);
}

console.log('\nBloch Sphere Coordinates for Target Qubit q[0]:');
console.log(`  - Polar Angle θ: ${result.bloch.theta} rad (${result.bloch.thetaDeg}°)`);
console.log(`  - Azimuthal Angle φ: ${result.bloch.phi} rad (${result.bloch.phiDeg}°)`);
console.log(`  - Bloch Vector (x, y, z): (${result.bloch.x}, ${result.bloch.y}, ${result.bloch.z})`);
console.log(`  - Single Qubit State: ${result.bloch.stateString}`);
