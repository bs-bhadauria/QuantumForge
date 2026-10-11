# QuantumForge Architecture Overview & Simulation Flow

## 1. System Architecture

QuantumForge is an engineering platform that connects an interactive, high-fidelity browser workspace with a high-performance classical quantum simulation engine powered by Qiskit Aer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QuantumForge Platform                           │
├─────────────────────────────────┬──────────────────────────────────────┤
│       Frontend (Browser UI)     │         Backend (FastAPI)            │
│                                 │                                      │
│  • Responsive Design System     │  • HTTP / OpenAPI Schema Enforcement │
│  • Live SVG Circuit Visualizer  │  • Input & Boundary Validation       │
│  • Empirical Measurement Charts │  • Security Middleware & Guardrails  │
│  • Reproducible JSON Exporter   │  • Qiskit Aer Simulation Engine      │
└─────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. End-to-End Simulation Flow

```
1. Authoring / Preset Selection
   └── User selects a preset or inputs raw JSON defining { n_qubits, operations }.

2. Client-Side Guardrails
   ├── Syntax validation (valid JSON)
   ├── Supported gates check (h, x, y, z, s, t, rx, ry, rz, cx, cz, swap)
   └── Parameter bounds check (shots: 1..100000, seed >= 0).

3. Local Rendering (SVG Engine)
   └── Browser dynamically draws quantum wires, gates, and controlled links in SVG.

4. HTTP Simulation Request
   └── POST /simulate with strict payload limit (1MB max, 15s timeout).

5. Quantum Circuit Construction & Simulation
   ├── Backend instantiates Qiskit QuantumCircuit(n, n)
   ├── Validates gates, maps single/rotation/controlled gates
   ├── Measures all qubits to classical bits
   └── Qiskit Aer executes circuit with specified shots and seed.

6. Resource Metrics & Extraction
   ├── Transpiled depth, gate count, qubit counts
   └── State measurement count dictionary & empirical probabilities.

7. Response & Visualization
   └── Browser displays metrics, renders interactive distribution histogram,
       and enables single-click Reproducible Report Export (.json).
```

---

## 3. Security, Hardening & Resource Controls

- **Payload Limiting:** Enforces `MAX_PAYLOAD_BYTES = 1MB` to prevent memory exhaustion.
- **Circuit Operation Limiting:** Caps circuits at `MAX_OPERATIONS = 500`.
- **Execution Timeouts:** Asynchronous timeout enforcement via `QUANTUMFORGE_TIMEOUT_SECONDS = 15.0s`.
- **HTTP Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict Referrer policy.
- **Least Privilege:** Production Docker container runs as unprivileged `quantumuser` (`uid: 1001`).
