# QuantumForge

**QuantumForge is an interactive quantum-circuit simulation and experimentation platform built with FastAPI, Qiskit Aer, and a browser-based workspace.** It is being developed as a reliable, testable software platform for defining quantum circuits, simulating measurements, visualizing circuits and results, inspecting resource metrics, and exporting reproducible experiment reports.

> **Project status:** Active development. Milestones 1 and 2 are complete. The core simulation engine, browser workspace, structured logging, OpenAPI documentation, linting/formatting checks, and continuous integration pipeline are verified. At the latest verified checkpoint, 29 Playwright browser tests and 57 Python tests passed (86 total passing tests, 0 warnings). Performance hardening, containerization, and deployment packaging are upcoming work.

---

## Table of contents

- [Vision](#vision)
- [What we are building](#what-we-are-building)
- [Current capabilities](#current-capabilities)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Local development](#local-development)
- [API endpoints](#api-endpoints)
- [Circuit definition format](#circuit-definition-format)
- [Automated testing](#automated-testing)
- [Engineering roadmap](#engineering-roadmap)
- [Definition of done](#definition-of-done)
- [Agentic development instructions](#agentic-development-instructions)
- [Current limitations and honest status](#current-limitations-and-honest-status)

## Vision

The goal is to build a dependable quantum-computing experimentation workspace where a user can define a small quantum circuit, inspect its visual representation, execute it on a simulator, understand the measurement results and circuit resources, and save an experiment report.

QuantumForge should evolve through controlled engineering milestones. Correctness, reproducibility, usability, test coverage, maintainability, and safe resource usage take priority over adding features quickly.

This project currently focuses on **classical simulation of quantum circuits using Qiskit Aer**. It does not currently claim to execute jobs on real quantum hardware.

## What we are building

QuantumForge brings together five connected parts:

1. **Circuit authoring** — create or select a circuit through built-in presets and a JSON editor.
2. **Circuit visualization** — render qubit wires, gate symbols, controlled-gate connections, rotation labels, and final measurement markers in an SVG diagram.
3. **Quantum simulation** — submit a validated circuit to the FastAPI backend and simulate measurements with configurable shot count and random seed.
4. **Result and resource inspection** — display measurement counts, empirical probabilities, a histogram, and circuit-resource metrics.
5. **Experiment reporting** — download a JSON report containing the circuit definition, run settings, results, and resource information.

The platform is intended to become a well-tested, reproducible software release—not merely a working demo. The planned path is to finish core reliability, establish continuous integration, validate performance and security, package deployment, and publish clear documentation and a repeatable demonstration.

## Current capabilities

### Dashboard

- Browser-based workspace served at `/dashboard`.
- Preset circuits: Bell, X, Hadamard, and GHZ.
- Editable circuit JSON.
- Render circuit action and run simulation action.
- Configurable shot count and random seed.
- SVG visualization for supported single-qubit and multi-qubit gates.
- Measurement histogram and raw JSON response.
- Circuit resource metrics, including qubits, gate count, depth, classical bits, and operation counts where provided by the backend.
- Downloadable experiment report in JSON format.
- Copy-result control.
- Responsive layout, including a scrollable circuit-diagram container for wide circuits.

### Quantum simulation

The backend uses Qiskit Aer to simulate circuits. The general-purpose circuit endpoint supports circuits with **1–16 qubits** and validates gate definitions before constructing the circuit.

Supported gate names currently include:

- Single-qubit gates: `h`, `x`, `y`, `z`, `s`, `t`
- Rotation gates: `rx`, `ry`, `rz`
- Multi-qubit gates: `cx`, `cz`, `swap`

Rotation gates require one finite numeric angle in radians. Other supported gates do not accept parameters. Multi-qubit gates require two distinct valid qubit indices.

### Experiment reports

The dashboard can export a JSON report with information such as:

- Report version and platform name
- Generation timestamp
- Circuit name and submitted circuit definition
- Shot count, random seed, and simulator identifier
- Measurement counts and probabilities
- Circuit resource metrics

The report is intended to make an experiment easier to inspect and reproduce. It is not a cryptographically signed artifact, and the timestamp alone does not guarantee reproducibility across all dependency versions or environments.

## Architecture

```text
Browser
  |
  | GET /dashboard
  v
FastAPI application ----------------------> Static dashboard
  |                                           |
  | POST /simulate                            | Circuit JSON
  v                                           v
Request validation <------------------- Browser-side validation
  |
  v
Quantum circuit builder
  |
  v
Qiskit Aer simulator
  |
  v
Measurement results + resource analysis
  |
  v
JSON API response ---------------------> Dashboard result rendering
                                             |
                                             +--> Histogram and metrics
                                             +--> SVG circuit diagram
                                             +--> Downloadable JSON report
```

### Main responsibilities

- `app/main.py`: FastAPI application, request models, routes, and HTTP error handling.
- `app/quantum/engine.py`: quantum circuit construction, simulation, and resource analysis.
- `app/static/index.html`: dashboard markup, styles, client-side validation, SVG rendering, API calls, results, and report export.
- `tests/`: Python regression tests for the API, engine, and dashboard contract.
- `e2e/dashboard.spec.js`: Playwright browser regression tests.
- `playwright.config.js`: Chromium test configuration and automatic local FastAPI startup.

## Technology stack

- **Python** for the backend and quantum-engine integration
- **FastAPI** for HTTP endpoints and request validation
- **Qiskit / Qiskit Aer** for quantum circuits and classical simulation
- **HTML, CSS, and JavaScript** for the browser workspace
- **SVG** for circuit visualization
- **pytest** and FastAPI `TestClient` for Python tests
- **Playwright Test + Chromium** for browser-level regression tests
- **Git** for checkpoints and version control
- **Node.js/npm** for the Playwright development toolchain

The Python dependencies are declared in `requirements.txt`. The browser-test dependencies and lockfile are declared in `package.json` and `package-lock.json`.

## Project structure

```text
quantumforge/
├── app/
│   ├── main.py
│   ├── quantum/
│   │   └── engine.py
│   └── static/
│       └── index.html
├── tests/
│   ├── test_api.py
│   ├── test_dashboard_contract.py
│   ├── test_engine.py
│   └── test_rotation_gates.py
├── e2e/
│   └── dashboard.spec.js
├── playwright.config.js
├── requirements.txt
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

This is the expected project layout; use the repository itself as the source of truth if files are later renamed or added.

## Local development

The current development environment is WSL Ubuntu. The repository has been used from:

```bash
cd ~/projects/quantumforge
```

### 1. Install Python dependencies

Create and activate a virtual environment if one does not already exist:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 2. Start the API and dashboard

From the repository root, with the virtual environment activated:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open these local URLs in a browser:

- Dashboard: `http://127.0.0.1:8000/dashboard`
- API health: `http://127.0.0.1:8000/health`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Stop the server with `Ctrl+C`.

### 3. Install browser-test dependencies

Node.js and npm are required for Playwright. Install the locked dependencies with:

```bash
npm ci
npx playwright install chromium
```

If Playwright reports missing Linux system dependencies on a supported Ubuntu environment, use its documented dependency-install procedure. System package installation may require administrator privileges.

### 4. Run the tests & code quality checks

Run Python and JavaScript linters and formatters:

```bash
# Python linting & formatting checks (ruff)
ruff check .
ruff format --check .

# JavaScript code style checks (prettier)
npm run lint:js
```

Run the Python suite:

```bash
python -m pytest -q
```

Run the Playwright suite:

```bash
npm run test:e2e
```

Playwright configuration starts the FastAPI application automatically for browser tests. Do not start a second server on the same port unless you intentionally configure the test server differently.

For a visible Chromium browser, use:

```bash
npm run test:e2e:headed
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Service information and endpoint list |
| `GET` | `/health` | Basic health check |
| `GET` | `/dashboard` | Serves the dashboard UI |
| `GET` | `/circuits/bell` | Returns the built-in Bell circuit and resource information |
| `POST` | `/simulate/bell` | Simulates the built-in Bell circuit |
| `POST` | `/simulate` | Simulates a custom circuit definition |

### General simulation request

Example request body for `POST /simulate`:

```json
{
  "n_qubits": 2,
  "operations": [
    { "name": "h", "qubits": [0], "params": [] },
    { "name": "cx", "qubits": [0, 1], "params": [] }
  ],
  "shots": 1024,
  "seed": 42
}
```

The API validates request fields and circuit operations. The `shots` value must be between 1 and 100000, and the seed must be non-negative. The circuit qubit count is constrained to 1–16.

A successful response includes the circuit name, measurement counts, probabilities, shot information, and resource metrics. Exact response fields should be confirmed against the current implementation and API schema before integrating external clients.

## Circuit definition format

The dashboard's circuit editor uses a JSON object with `n_qubits` and `operations`. Each operation has a gate `name`, a list of `qubits`, and an optional or explicit `params` list.

Example single-qubit rotation circuit:

```json
{
  "n_qubits": 1,
  "operations": [
    { "name": "h", "qubits": [0], "params": [] },
    { "name": "rz", "qubits": [0], "params": [1.5707963267948966] },
    { "name": "h", "qubits": [0], "params": [] }
  ]
}
```

Validation rules include:

- `n_qubits` must be an integer from 1 through 16.
- `operations` must be an array.
- Every gate must be supported.
- Gate operands must have the correct count and use valid qubit indices.
- Multi-qubit gates cannot use the same qubit twice.
- Parameters must be finite numbers.
- `rx`, `ry`, and `rz` require exactly one angle in radians; other supported gates accept no parameters.

## Automated testing

### Latest verified baseline

The latest verified test run from the local development session showed:

- **29 Playwright browser tests passing**
- **57 Python tests passing**
- **86 total passing tests (0 warnings)**
- **All code quality checks passing (Ruff lint/format & Prettier)**

The browser tests cover dashboard loading, health checks, preset rendering, Bell/X/GHZ simulation workflows, mobile viewport usability, RX/RY/RZ behavior, report export, invalid-JSON recovery, long-circuit SVG bounds, a 16-qubit diagram, scrolling for a wide diagram, pre- and post-simulation workspace reset, result invalidation upon parameter/circuit changes, clipboard copy verification, exact report schema and value validation, and browser-side rejection of invalid gates, operands, and parameter ranges.

The Python tests cover root/health endpoints, Bell simulation, custom circuit compilation and simulation, parameter and qubit boundaries, non-finite input rejection, rotation gates, resource metric analysis, OpenAPI schema synchronization, and Swagger documentation availability.

These are the latest observed results, not a promise that tests will pass after future changes. Always rerun both suites after making changes.

### Dependency compatibility & warning resolution

The earlier Starlette deprecation warning (`StarletteDeprecationWarning: Using 'httpx' with 'starlette.testclient' is deprecated; install 'httpx2' instead`) was investigated and cleanly resolved by adding `httpx2==2.13.1` to the environment and `requirements.txt`. The full Python test suite now runs with 0 warnings.

### Test policy

- Keep existing tests passing as new tests are added.
- Test a suspected defect before changing implementation code.
- Prefer deterministic quantum tests with known measurement outcomes where possible.
- For probabilistic outcomes, test valid distributions and tolerances rather than requiring an exact random sample.
- Avoid tests that depend on timing except where a timeout is the behavior under test.
- Never claim production readiness based only on a passing regression suite.

## Engineering roadmap

The roadmap below records the agreed direction. Complete each milestone before expanding into unrelated features.

### Milestone 1 — Core reliability and state consistency

**Status: Complete.**

- [x] Establish FastAPI + Qiskit Aer simulation flow.
- [x] Implement the browser workspace, preset circuits, SVG rendering, resource display, histogram, and JSON report export.
- [x] Add Python regression tests.
- [x] Add Playwright browser regression tests.
- [x] Verify RX, RY, and RZ in browser-driven workflows.
- [x] Verify report download produces parseable JSON.
- [x] Verify invalid JSON is rejected and a subsequent valid simulation succeeds.
- [x] Test long-circuit bounds, 16-qubit rendering, and mobile horizontal scrolling.
- [x] Test reset behavior before and after successful simulations.
- [x] Verify result invalidation when circuit, shot count, or seed changes.
- [x] Verify copy-result behavior and the exact exported report schema and values.
- [x] Add targeted invalid-gate and parameter edge cases to both API and browser coverage.
- [x] Run the full test suite after a clean dependency installation.
- [x] Review and save a Git checkpoint after all tests pass.

### Milestone 2 — Professional software quality and CI

**Status: Complete.**

- [x] Add a CI workflow (for example, GitHub Actions) to install dependencies and run Python and Playwright tests on pushes and pull requests.
- [x] Add suitable Python and JavaScript linting/formatting checks where they provide value.
- [x] Make test setup and dependency versions reproducible.
- [x] Review the Starlette/TestClient deprecation warning and select compatible dependency versions deliberately.
- [x] Improve structured logging and consistent API error responses.
- [x] Keep API documentation synchronized with request and response schemas.

### Milestone 3 — Performance and security hardening

- Benchmark representative circuits, qubit counts, and shot counts.
- Set and test resource limits and request timeouts appropriate for a local simulation service.
- Validate error behavior for oversized or malformed requests.
- Review input handling, dependency vulnerabilities, exposed ports, and configuration practices.
- Test repeated and concurrent requests within the intended operating envelope.
- Document known limits; do not imply that the 16-qubit input limit alone guarantees safe resource consumption.

### Milestone 4 — Reproducible deployment

- Add a Docker image and a documented build/run workflow.
- Keep configuration outside source code where appropriate.
- Add a container health check and validate clean startup/shutdown behavior.
- Document local development, testing, troubleshooting, and deployment assumptions.
- Verify that the packaged deployment can run a circuit and export a report.

### Milestone 5 — Release and demonstration

- Prepare an architecture overview and an explanation of the simulation flow.
- Include a small set of reproducible example circuits and sample reports.
- Prepare a release checklist covering tests, dependencies, configuration, security review, and documentation.
- Record a demonstration of authoring, visualization, simulation, resource inspection, and report export.
- Tag a release only after the release checks pass.

## Definition of done

A milestone is complete only when its requirements are implemented, tested, and documented. For the core platform, the intended outcome is:

1. A developer can clone the repository and follow documented installation steps.
2. Both Python and Playwright tests run successfully from a clean setup.
3. The dashboard can load, define/render a supported circuit, simulate it, show results and resource metrics, and export a valid report.
4. Invalid inputs produce understandable errors without leaving the interface in a broken state.
5. Changes are covered by regression tests and committed as focused Git checkpoints.
6. Limitations and uncompleted work are stated honestly.

## Agentic development instructions

This project will be developed agentically using **Antigravity**. The agent should inspect the repository, make changes directly in the workspace, run commands and tests, and report the results. The user should not have to copy code snippets manually for every implementation step.

### Required workflow for the coding agent

1. **Inspect before editing.** Read this README, inspect the relevant source files, check `git status`, and understand the current implementation before proposing changes.
2. **Respect the current milestone.** Follow the engineering roadmap in order. Do not introduce unrelated features or broaden scope before the current milestone is complete.
3. **Preserve working behavior.** Avoid unnecessary rewrites, framework changes, or file restructuring. Prefer small, focused changes.
4. **Plan and execute autonomously.** For a well-specified task, make the change directly in the workspace instead of asking the user to copy and paste code. Ask only when a genuinely important requirement is ambiguous or an action has material external consequences.
5. **Test each meaningful change.** Add or update focused tests, run the relevant tests, then run the full Python and Playwright suites before marking the milestone complete.
6. **Diagnose failures instead of hiding them.** Determine whether a failure reflects an implementation defect, a test assumption, or an environment problem. Do not weaken assertions merely to make the suite green.
7. **Protect user work.** Inspect Git status before editing. Never discard, overwrite, reset, or clean user changes without explicit authorization. Do not amend or rewrite existing commits unless requested.
8. **Keep dependencies deliberate.** Explain why a new dependency is needed, prefer maintained compatible versions, and update lockfiles where applicable.
9. **Maintain documentation.** Update this README when actual architecture, commands, supported gates, endpoints, test coverage, or roadmap status changes. Mark tasks complete only after verifying them.
10. **Report evidence.** At the end of a task, summarize files changed, tests actually run and their results, known warnings, remaining issues, and the next milestone. Never claim a test or deployment succeeded if it was not run.
11. **Commit at stable checkpoints.** Once the relevant suites pass, review the diff and create a focused commit when appropriate. Leave unrelated changes untouched.
12. **Do not claim production readiness prematurely.** Passing tests is necessary but not sufficient; performance, security, deployment, and operational readiness need their own verification.

### Instructions for the first Antigravity session

Start by inspecting the repository and comparing its actual state with this README. Check the current Git branch and working tree before making changes. Run the Python and Playwright suites to establish a fresh baseline. Then continue **Milestone 1: core reliability and state consistency**, beginning with reset behavior, result invalidation, copy-result behavior, and exact report-content validation. Do not begin CI, Docker, or new quantum features until this milestone is closed and documented.

## Current limitations and honest status

- QuantumForge currently simulates circuits using Qiskit Aer; real quantum hardware execution is not implemented by the capabilities described here.
- The dashboard currently supports circuits up to 16 qubits. Practical simulation limits may be lower depending on circuit structure, shots, and available resources.
- Automated tests cover important paths but do not prove the absence of defects.
- CI, comprehensive security review, systematic load/performance validation, and deployment hardening remain roadmap work unless the repository shows they have since been completed.
- A non-blocking Starlette/TestClient deprecation warning was present in the latest observed Python test run.

---

## Contributing and development philosophy

QuantumForge is developed incrementally: understand the current code, make a focused change, prove it with tests, document it, and preserve a known-good checkpoint. Correctness and reproducibility come before feature count.

For current development status, always trust the repository, test output, and Git history over stale statements in documentation. Update this README when verified project facts change.
