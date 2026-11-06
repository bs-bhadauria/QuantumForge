# ⚛️ QuantumForge Studio Platform

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-quantumforge.vercel.app-00f2fe?style=for-the-badge&logo=vercel&logoColor=white)](https://quantumforge.vercel.app)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=for-the-badge)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit_Aer-0.13.2-6929C4?style=for-the-badge&logo=ibm&logoColor=white)](https://qiskit.org/)
[![Database](https://img.shields.io/badge/Neon-PostgreSQL_Serverless-00E599?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Three.js](https://img.shields.io/badge/Three.js-3D_Bloch_Sphere-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)

**A modern, production-grade Quantum Circuit IDE, 3D Bloch Sphere Simulator, and Algorithm Marketplace.**  
Engineered for quantum researchers, physicists, students, and software engineers exploring quantum computing.

[Explore Live Studio](https://quantumforge.vercel.app) • [View Architecture](#architecture) • [Algorithm Marketplace](#algorithm-marketplace) • [Deployment](#deployment)

</div>

---

## 🌟 Overview

**QuantumForge** bridges the gap between quantum mechanics and modern web engineering. Designed with an ultra-responsive, high-performance dark theme, it brings together drag-and-drop circuit composition, mathematical transparency, 3D statevector visualization, and cloud serverless persistence.

```
       ┌────────────────────────────────────────────────────────┐
       │                 QuantumForge Studio IDE                │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   IBM-Composer   │     │  Three.js 3D      │     │  18+ Algorithms  │
│   Circuit Canvas │     │  Bloch Sphere     │     │  Marketplace     │
└────────┬─────────┘     └─────────┬─────────┘     └────────┬─────────┘
         │                         │                        │
         └─────────────────────────┼────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Simulation & Cloud Core                       │
│  • Sub-50ms Classical Matrix Simulator (Local Offline Fallback)     │
│  • Qiskit Aer Statevector Execution Engine (FastAPI)                │
│  • Neon Serverless PostgreSQL Cloud Persistence (Dual-Driver)       │
│  • OpenQASM 3.0 & Python Script Multi-Format Exporter               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Platform Features

### 1. 🎛️ IBM Quantum Composer-Grade Circuit Canvas
- **Two-Click Multi-Qubit Entangler Linking**: Select an entangler gate (`CX`, `CZ`, `CCX` / Toffoli), click a control slot on wire $q[i]$, then click a target slot on wire $q[j]$.
- **Dynamic Laser SVG Connectors**: Vertical laser connector rods automatically span across arbitrary qubit wires with real-time target alignment and glow effects.
- **Sub-Step Precision & Timeline Layout**: Visual time slices ($t_0, t_1, t_2, \dots$) with drag-and-drop gate movement, one-click gate deletion, and circuit depth calculations.
- **Universal Gate Toolbox**:
  - **Unitaries**: $H$ (Hadamard), $X$ (Pauli-X), $Y$ (Pauli-Y), $Z$ (Pauli-Z), $S$, $T$
  - **Rotations**: $R_x(\theta)$, $R_y(\theta)$, $R_z(\theta)$, $U_3(\theta, \phi, \lambda)$
  - **Entanglers**: $CX$ (CNOT), $CZ$, $\text{SWAP}$, $CCX$ (Toffoli)
  - **Measurement & Sync**: Measurement ($\mathbf{M}$) and Barriers.

### 2. 🌐 Real-Time 3D Bloch Sphere Vector Engine
- Powered by **Three.js** with orbital drag controls and inertial rotation.
- **Real-Time Statevector Tracking**: Computes spherical coordinates $(\theta, \phi)$ and the single-qubit pure statevector:
  $$\vert\psi\rangle = \cos(\theta / 2)\vert 0\rangle + e^{i\phi}\sin(\theta / 2)\vert 1\rangle$$
- Displays active Bloch vector $(x, y, z)$, polar and azimuthal angles in radians/degrees, and amplitude breakdown.
- Built-in `ResizeObserver` ensures seamless responsive resizing without canvas stretching or camera distortion.

### 3. 📚 Comprehensive Algorithm Marketplace (18+ Presets)
A catalog of pre-compiled quantum algorithms ready for immediate simulation, circuit inspection, and code export:
- **Quantum Search & Optimization**: Grover’s Search (Quadratic Speedup), QAOA Max-Cut Graph Partitioning.
- **Quantum Chemistry & Physics**: Variational Quantum Eigensolver (VQE Molecular $\text{H}_2$ Ground State Ansatz), Quantum Phase Estimation (QPE).
- **Quantum Arithmetic & Transform**: Quantum Fourier Transform (QFT 3-Qubit), Quantum Half-Adder & Quantum Full-Adder.
- **Foundational Protocols**: Bell State ($\vert\Phi^+\rangle$), GHZ Multi-Party Entanglement, Quantum Teleportation, Superdense Coding.
- **Oracle & Complexity Benchmarks**: Deutsch-Jozsa Constant/Balanced Oracle, Bernstein-Vazirani Secret Bitstring Finder.
- Each algorithm card provides mathematical formulations, Clifford+T resource estimations, circuit depth, and one-click import into the active canvas.

### 4. 🎨 Modern Cybernetic UI & Experience
- **Perspective Grid Matrix**: 3D tilted matrix plane with colorful cursor light-trails that fade organically over 1.4 seconds.
- **Mega-Menu Navigation**: Glassmorphic header with categorized flyout menus, system status monitors, and one-click theme toggling.
- **Hidable & Resizable Responsive Sidebar**: Drag-to-resize sidebar with automatic hamburger menu transformation at narrow viewports to maximize circuit canvas workspace.

### 5. ☁️ Dual-Driver Cloud Persistence & Execution
- **Neon Serverless PostgreSQL Adapter**: Connects via `pg.Pool` with SSL encryption when `DATABASE_URL` is set, auto-creating `circuits`, `simulations`, and `algorithms` tables.
- **Zero-Config Local SQLite Fallback**: Uses Node.js native `DatabaseSync` for offline, local development with zero external setup.
- **OpenQASM 3.0 & Python Export**: Export circuits directly into standardized OpenQASM 3.0 syntax or copy ready-to-run Qiskit Python scripts.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Platform** | React 19, Vite, Tailwind CSS, Lucide Icons, GSAP, Framer Motion |
| **3D Graphics** | Three.js (WebGL Statevector Bloch Sphere & Orbital Controls) |
| **Backend & APIs** | Node.js 22, Express 5, FastAPI (Python 3.12), REST API |
| **Simulation Engines**| Qiskit Aer 0.13.2 (C++ Statevector Simulator) + Client Matrix Evaluator |
| **Database & Storage**| Neon Serverless PostgreSQL (`pg`) & Native Node SQLite (`node:sqlite`) |
| **Testing & Quality** | Playwright (End-to-End Browser Testing), Pytest, Ruff, Prettier |
| **Hosting & CI/CD**   | Vercel (Edge Frontend), Render (Web Service), GitHub Actions |

---

## 📁 Repository Structure

```text
quantumforge/
├── app/                        # Python FastAPI & Qiskit Aer backend
│   ├── main.py                 # FastAPI application & REST endpoints
│   └── quantum/
│       └── engine.py           # Qiskit Aer circuit builder & simulator
├── server/                     # Node.js backend & dual database adapter
│   └── server.js               # Express API, Neon PostgreSQL & SQLite driver
├── src/                        # React 19 Frontend (Vite)
│   ├── components/
│   │   ├── circuit/            # CircuitBoard, VisualToolbox, GatePalette
│   │   ├── bloch/              # 3D Three.js Bloch Sphere component
│   │   ├── landing/            # LandingPage hero & capabilities showcase
│   │   ├── layout/             # Header, MegaMenu, ResizableSidebar
│   │   ├── marketplace/        # AlgorithmMarketplace (18+ algorithms)
│   │   └── ui/                 # PerspectiveGrid, AnimatedFooter, GlassCard
│   ├── services/
│   │   └── api.js              # Simulation client with offline matrix fallback
│   ├── App.jsx                 # Main application state & view routing
│   └── main.jsx                # Application root entry point
├── tests/                      # Python automated test suite
├── e2e/                        # Playwright automated browser test suite
├── Dockerfile                  # Production container definition
├── render.yaml                 # Render cloud web service blueprint
├── vercel.json                 # Vercel SPA edge routing configuration
├── package.json                # Node dependencies and build scripts
└── requirements.txt            # Python dependencies (Qiskit, FastAPI)
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: v20 or v22+
- **Python**: v3.11 or v3.12 (optional, for Qiskit Aer backend)

### 1. Clone the Repository
```bash
git clone https://github.com/bs-bhadauria/QuantumForge.git
cd QuantumForge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Frontend Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. The frontend includes an in-browser quantum matrix simulation engine, so it runs completely standalone with zero backend setup needed!

### 4. Run the Backend API (Optional)
```bash
# Start Node.js API (SQLite locally, or Neon if DATABASE_URL is set):
npm run server

# Or run with Neon PostgreSQL:
DATABASE_URL="postgres://user:password@endpoint.neon.tech/neondb?sslmode=require" npm run server
```

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🧪 Testing & Quality Assurance

QuantumForge is tested across unit, integration, and browser end-to-end layers:

```bash
# Run Playwright End-to-End browser test suite
npm run test:e2e

# Run with visible browser window
npm run test:e2e:headed

# Run code style and formatting checks
npm run lint:js

# Run Python pytest suite (when Python venv is active)
python -m pytest -q
```

---

## 🌐 Cloud Deployment

### Deploy to Vercel (Frontend)
1. Import the repository on [Vercel](https://vercel.com/new).
2. Set **Project Name** to `quantumforge`.
3. Vercel automatically detects `vercel.json` and runs `npm run build`.
4. Your application is live at `https://quantumforge.vercel.app`.

### Deploy to Neon (Serverless Database)
1. Create a free project on [neon.tech](https://neon.tech).
2. Copy the connection string (`postgresql://...`).
3. Set `DATABASE_URL` in your hosting environment.

### Deploy to Render (Backend)
1. Connect your repository on [dashboard.render.com](https://dashboard.render.com).
2. Select **Blueprint** to use the pre-configured [render.yaml](render.yaml).
3. Add the `DATABASE_URL` environment variable.

---

## 📄 License

This project is open-source software licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.  
See the [LICENSE](LICENSE) file for complete details.

---

<div align="center">
Built with ⚛️ for the Quantum Computing & Open Source Community.
</div>
