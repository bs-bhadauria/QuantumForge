# QuantumForge v1.0.0 Pre-Release Checklist

This checklist must be verified before tagging and deploying a release of QuantumForge.

## 1. Automated Test Suites & Regression
- [x] **Unit & Integration Tests (pytest):** All 68 Python tests pass (0 failures, 0 warnings).
- [x] **Browser Regression Tests (Playwright):** All 29 end-to-end tests pass across Chromium and mobile viewports.
- [x] **Performance Benchmarks:** Bell state (<50ms), GHZ state (<80ms), 10-qubit circuit (<300ms).
- [x] **Stress & Concurrency:** Concurrency test passes with 8 parallel worker requests.

## 2. Code Quality, Formatting & Static Analysis
- [x] **Python Linting:** `ruff check .` passes with 0 errors.
- [x] **Python Formatting:** `ruff format --check .` passes cleanly.
- [x] **JavaScript Formatting:** `npm run lint:js` passes via Prettier.

## 3. Security, Auditing & Dependency Hygiene
- [x] **Python Dependencies:** `pip-audit` confirms 0 known vulnerabilities.
- [x] **JavaScript Dependencies:** `npm audit` confirms 0 known vulnerabilities.
- [x] **Request Limits:** Payload capped at 1MB (HTTP 413) and circuit operations capped at 500.
- [x] **Execution Timeout:** Circuit simulation timeout capped at 15.0s (HTTP 504).
- [x] **Security Headers:** Enforced via Starlette middleware (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).

## 4. Containerization & Deployment Verification
- [x] **Multi-Stage Dockerfile:** Builds clean, minimal image without build toolchain bloat.
- [x] **Non-Root Runtime:** Runs under unprivileged user `quantumuser` (`uid: 1001`).
- [x] **Health Check:** `HEALTHCHECK` directive correctly tests `http://localhost:8000/health`.
- [x] **Compose Orchestration:** `compose.yaml` validated with environment variable overrides.
- [x] **CI Automation:** `.github/workflows/ci.yml` validates linting, pytest, Playwright, and Docker smoke test.

## 5. Documentation & Artifacts
- [x] `README_QuantumForge.md` updated with completed roadmap status and instructions.
- [x] Architecture flow documented in `docs/ARCHITECTURE.md`.
- [x] Curated example circuits provided in `examples/` (`bell_state.json`, `ghz_state.json`, `rotation_gates.json`).
- [x] Sample experiment report provided in `examples/sample_bell_report.json`.
