# QuantumForge Walkthrough & Demonstration Guide

This guide walks through demonstrating the core capabilities of QuantumForge from initial launch to experiment report export.

---

## 1. Launching the Workspace

You can launch QuantumForge locally via Docker or Python:

### Option A: Docker (Recommended)
```bash
docker compose up -d
# Open http://localhost:8000/dashboard in your browser
```

### Option B: Python Virtual Environment
```bash
source .venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
# Open http://localhost:8000/dashboard
```

---

## 2. Interactive Demonstration Steps

### Step 1: System Health Verification
- Upon opening the dashboard, observe the top-right status pill (`API ok`) glowing with an active cyan indicator.

### Step 2: Exploring Circuit Presets
1. In Section **01 / Circuit definition**, select the **Bell state** preset from the dropdown.
2. Click **Render circuit**.
3. Observe Section **02 / Circuit diagram**:
   - Two qubit wires ($q_0, q_1$) rendered with crisp labels.
   - Hadamard gate ($H$) on $q_0$ with glowing cyan borders.
   - Controlled-NOT ($CX$) gate with amber control point on $q_0$ and target $\oplus$ on $q_1$.
   - Purple final measurement boxes labeled $M$ aligned on the right.

### Step 3: Running a Simulation
1. Set **Measurement shots** to `4096` and **Random seed** to `42`.
2. Click **Run simulation**.
3. Observe instantaneous execution:
   - Section **03 / Circuit resources** updates with exact metrics:
     - Qubits: `2`, Gates: `4`, Depth: `3`, Classical bits: `2`.
   - Section **04 / Measurement distribution** displays the empirical quantum statistics:
     - Outcome `00`: ~50% (~2048 counts).
     - Outcome `11`: ~50% (~2048 counts).
   - Section **05 / Raw experiment response** outputs formatted API response JSON.

### Step 4: Downloading the Experiment Report
1. Click **Download experiment report**.
2. Notice the instant download of `quantumforge-report-<timestamp>.json`.
3. Open the file to verify the complete reproducible bundle: circuit metadata, seed, shots, backend identifier (`Qiskit Aer`), measurement frequencies, and resource breakdown.

### Step 5: Advanced Rotation Gate Experiment
1. Select the text inside the Circuit JSON editor and paste the rotation experiment:
   ```json
   {
     "n_qubits": 1,
     "operations": [
       { "name": "ry", "qubits": [0], "params": [3.14159265] }
     ]
   }
   ```
2. Click **Render circuit**. Notice the diagram dynamically renders an $RY(3.14)$ gate box.
3. Click **Run simulation**. The state vector rotates $\pi$ radians around the Y-axis from $\lvert 0\rangle$ to $\lvert 1\rangle$, resulting in **100% measurement probability for outcome `1`**.
