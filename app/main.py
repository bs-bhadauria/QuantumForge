import logging
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.quantum.engine import (
    MAX_QUBITS,
    analyze_circuit,
    build_circuit,
    create_bell_circuit,
    simulate_circuit,
)

logger = logging.getLogger("quantumforge")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [quantumforge]: %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


app = FastAPI(
    title="QuantumForge API",
    description=(
        "Quantum circuit simulation, visualization, "
        "testing, and resource analysis platform."
    ),
    version="0.3.0",
)

DASHBOARD_FILE = Path(__file__).resolve().parent / "static" / "index.html"


# --------------------------------------------------
# Request & Response Models
# --------------------------------------------------


class CircuitResourcesResponse(BaseModel):
    qubits: int = Field(description="Total number of qubits in the circuit")
    classical_bits: int = Field(description="Total number of classical bits")
    gate_count: int = Field(description="Total number of operations/gates")
    depth: int = Field(description="Circuit depth")
    operations: dict[str, int] = Field(description="Breakdown of operation counts")


class SimulationRequest(BaseModel):
    shots: int = Field(
        default=1024, ge=1, le=100000, description="Measurement shot count"
    )
    seed: int = Field(default=42, ge=0, description="Random number generator seed")


class GateOperation(BaseModel):
    name: str = Field(description="Quantum gate identifier, e.g. 'h', 'cx', 'rz'")
    qubits: list[int] = Field(description="Target and control qubit indices")
    params: list[float] = Field(
        default_factory=list,
        description="Optional gate parameters (e.g. rotation angles)",
    )


class CircuitSimulationRequest(BaseModel):
    n_qubits: int = Field(ge=1, le=MAX_QUBITS, description="Number of qubits (1-16)")
    operations: list[GateOperation] = Field(
        default_factory=list, description="Sequence of gate operations"
    )
    shots: int = Field(
        default=1024, ge=1, le=100000, description="Measurement shot count"
    )
    seed: int = Field(default=42, ge=0, description="Random number generator seed")


class SimulationResultResponse(BaseModel):
    name: str = Field(description="Circuit display name")
    shots: int = Field(description="Measurement shot count")
    counts: dict[str, int] = Field(description="Measurement bitstrings and frequencies")
    probabilities: dict[str, float] = Field(description="Empirical probabilities")
    resources: CircuitResourcesResponse = Field(description="Circuit resource analysis")


class BellCircuitResponse(BaseModel):
    name: str = Field(description="Preset name")
    circuit: str = Field(description="ASCII circuit diagram")
    resources: CircuitResourcesResponse = Field(description="Circuit resource analysis")


class RootResponse(BaseModel):
    name: str = Field(description="Platform name")
    description: str = Field(description="Platform description")
    version: str = Field(description="API version")
    status: str = Field(description="Service status")
    dashboard: str = Field(description="Dashboard path")
    docs: str = Field(description="OpenAPI docs path")
    endpoints: list[str] = Field(description="Available endpoints")


class HealthResponse(BaseModel):
    status: str = Field(description="Health status")
    service: str = Field(description="Service identifier")


class ErrorResponse(BaseModel):
    detail: str = Field(description="Error message details")


# --------------------------------------------------
# Middleware
# --------------------------------------------------


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(
        "%s %s -> %d (%sms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# --------------------------------------------------
# Dashboard
# --------------------------------------------------


@app.get("/dashboard", include_in_schema=False)
def dashboard():
    if not DASHBOARD_FILE.is_file():
        logger.error("Dashboard file not found at %s", DASHBOARD_FILE)
        raise HTTPException(
            status_code=500,
            detail="Dashboard file not found.",
        )

    return FileResponse(
        DASHBOARD_FILE,
        media_type="text/html",
    )


# --------------------------------------------------
# Root and Health
# --------------------------------------------------


@app.get(
    "/",
    response_model=RootResponse,
    summary="Service metadata",
    description="Returns service description, status, and discoverable endpoints.",
)
def root():
    return {
        "name": "QuantumForge",
        "description": "Quantum Software Engineering Platform",
        "version": "0.3.0",
        "status": "running",
        "dashboard": "/dashboard",
        "docs": "/docs",
        "endpoints": [
            "/",
            "/health",
            "/circuits/bell",
            "/simulate/bell",
            "/simulate",
        ],
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Basic health check probe for uptime and readiness verification.",
)
def health():
    return {
        "status": "ok",
        "service": "QuantumForge",
    }


# --------------------------------------------------
# Bell Circuit
# --------------------------------------------------


@app.get(
    "/circuits/bell",
    response_model=BellCircuitResponse,
    description=(
        "Returns pre-constructed 2-qubit Bell state circuit "
        "diagram and resource metrics."
    ),
)
def bell_circuit():
    circuit = create_bell_circuit()
    return {
        "name": "Bell State",
        "circuit": circuit.draw(output="text").single_string(),
        "resources": analyze_circuit(circuit),
    }


@app.post(
    "/simulate/bell",
    response_model=SimulationResultResponse,
    responses={400: {"model": ErrorResponse, "description": "Simulation error"}},
    summary="Simulate Bell state",
    description="Simulates measurement of the canonical two-qubit Bell state.",
)
def simulate_bell(request: SimulationRequest):
    try:
        logger.info(
            "Simulating Bell circuit (shots=%d, seed=%d)",
            request.shots,
            request.seed,
        )
        return {
            "name": "Bell State",
            **simulate_circuit(
                create_bell_circuit(),
                shots=request.shots,
                seed=request.seed,
            ),
        }
    except ValueError as exc:
        logger.warning("Bell simulation error: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


# --------------------------------------------------
# General-Purpose Circuit Simulation
# --------------------------------------------------


@app.post(
    "/simulate",
    response_model=SimulationResultResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Validation or simulation error"}
    },
    summary="Simulate custom circuit",
    description=(
        "Validates, constructs, and executes a user-defined "
        "quantum circuit with Qiskit Aer."
    ),
)
def simulate_general_circuit(
    request: CircuitSimulationRequest,
):
    try:
        logger.info(
            "Simulating custom circuit (qubits=%d, ops=%d, shots=%d, seed=%d)",
            request.n_qubits,
            len(request.operations),
            request.shots,
            request.seed,
        )
        circuit = build_circuit(
            n_qubits=request.n_qubits,
            operations=[operation.model_dump() for operation in request.operations],
        )

        return {
            "name": "Custom Quantum Circuit",
            **simulate_circuit(
                circuit,
                shots=request.shots,
                seed=request.seed,
            ),
        }
    except ValueError as exc:
        logger.warning("Custom circuit simulation error: %s", exc)
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
